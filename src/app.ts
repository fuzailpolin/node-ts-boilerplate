import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { config } from "./config";
import { logger } from "./logging";
import passport from "passport";
import "./auth";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import specs from "./docs/swagger";
import { responseHandler, errorHandler } from "./middleware/responseHandler";
import morgan from "morgan";

const app = express();

logger.debug("Registering security middleware");
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

logger.debug("Registering session middleware");
app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true if using HTTPS
  })
);

logger.debug("Registering passport middleware");
app.use(passport.initialize());
app.use(passport.session());

logger.debug("Registering morgan HTTP logger");
app.use((morgan as any)("combined", { stream: logger.stream }));

logger.debug("Registering Swagger docs");
// When initializing Swagger UI Express:
app.get("/docs/swagger.json", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  } catch (err) {
    logger.error("Failed to serve Swagger spec", err);
    res.status(500).json({ error: "Failed to serve Swagger spec" });
  }
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/docs/swagger.json",
      withCredentials: true,
    },
  })
);

logger.debug("Registering response handler");
app.use(responseHandler); // <--- Move this AFTER Swagger routes
logger.debug("Registering routes");
app.use("/", routes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 404 handler
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: { message: "Not Found" } });
});

logger.debug("Registering error handler");
app.use(errorHandler); // <--- Add this after all routes

export default app;
