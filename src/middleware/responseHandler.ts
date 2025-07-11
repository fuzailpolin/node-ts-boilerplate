import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";

// Success response wrapper
export function responseHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Monkey-patch res.send to wrap all responses
  const oldSend = res.send;
  res.send = function (body?: any) {
    // If response is already structured, don't double-wrap
    if (res.headersSent) return oldSend.call(this, body);
    // Only wrap JSON responses
    if (typeof body === "object" && !Buffer.isBuffer(body)) {
      return oldSend.call(
        this,
        JSON.stringify({
          success: true,
          data: body,
        })
      );
    }
    return oldSend.call(this, body);
  };
  next();
}

// Error handler
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user ? (req.user as any).id : "anonymous";
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const timestamp = new Date().toISOString();

  logger.error({
    message: err.message,
    stack: err.stack,
    userId,
    timestamp,
    ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
  });

  // Prepare error response for frontend
  const errorResponse: {
    success: false;
    error: {
      message: string;
      code: string;
      status: number;
      details?: any;
    };
  } = {
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      code: err.code || err.name || "UNKNOWN_ERROR",
      status: err.status || 500,
    },
  };

  // Add additional details for specific error types
  if (err.code === "InvalidAccessKeyId") {
    errorResponse.error.message =
      "AWS credentials are invalid. Please check your configuration.";
  } else if (err.code === "NoSuchBucket") {
    errorResponse.error.message =
      "S3 bucket not found. Please check your bucket configuration.";
  } else if (err.code === "AccessDenied") {
    errorResponse.error.message =
      "Access denied. Please check your AWS permissions.";
  }

  // Include additional error details in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.details = {
      originalError: err.message,
      stack: err.stack,
    };
  }

  res.status(err.status || 500).json(errorResponse);
}
