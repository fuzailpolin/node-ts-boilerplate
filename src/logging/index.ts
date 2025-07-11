import winston from "winston";
import path from "path";
import fs from "fs";
import { Logtail } from "@logtail/node";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "gray",
};

winston.addColors(colors);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize Logtail (only if LOGTAIL_SOURCE_TOKEN is provided)
let logtail: Logtail | null = null;
if (process.env.LOGTAIL_SOURCE_TOKEN) {
  logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
    endpoint: process.env.LOGTAIL_INGESTING_HOST,
  });
}

// Custom format for file logs (JSON for easy parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Custom format for console logs (readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      stack,
      userId,
      ip,
      method,
      url,
      ...meta
    }) => {
      let log = `${timestamp} [${level}]: ${message}`;

      // Add user context if available
      if (userId && userId !== "anonymous") {
        log += ` | User: ${userId}`;
      }

      // Add request context if available
      if (method && url) {
        log += ` | ${method} ${url}`;
      }

      // Add IP if available
      if (ip && ip !== "unknown") {
        log += ` | IP: ${ip}`;
      }

      // Add stack trace for errors (simplified)
      if (stack && level === "error" && typeof stack === "string") {
        const lines = stack.split("\n");
        const relevantLines = lines.slice(0, 3); // Show only first 3 lines
        log += `\n${relevantLines.join("\n")}`;
      }

      // Add other metadata if present (but not the ones we already handled)
      const remainingMeta = Object.keys(meta).filter(
        (key) =>
          ![
            "timestamp",
            "level",
            "message",
            "stack",
            "userId",
            "ip",
            "method",
            "url",
          ].includes(key)
      );

      if (remainingMeta.length > 0) {
        const filteredMeta: Record<string, any> = {};
        remainingMeta.forEach((key) => {
          filteredMeta[key] = meta[key];
        });
        log += `\n${JSON.stringify(filteredMeta, null, 2)}`;
      }

      return log;
    }
  )
);

export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "info",
  transports: [
    // Console transport (readable format)
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File transport for all logs (JSON format)
    new winston.transports.File({
      filename: path.join(
        logsDir,
        `${new Date().toISOString().split("T")[0]}-all.log`
      ),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 30, // Keep 30 days of logs
    }),

    // Separate file for error logs only (JSON format)
    new winston.transports.File({
      filename: path.join(
        logsDir,
        `${new Date().toISOString().split("T")[0]}-error.log`
      ),
      level: "error",
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 90, // Keep 90 days of error logs
    }),
  ],
});

// Send error logs to Logtail if configured
if (logtail) {
  logger.on("data", (info) => {
    if (info.level === "error") {
      logtail!
        .error(info.message, {
          ...info,
          level: info.level,
          timestamp: info.timestamp,
        })
        .catch((err) => {
          console.error("Failed to send log to Logtail:", err);
        });
    }
  });
}

// TypeScript augmentation for logger.stream
interface LoggerStream {
  write: (message: string) => void;
}
(logger as any).stream = {
  write: (message: string) => logger.http(message.trim()),
} as LoggerStream;
