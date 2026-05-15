const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { uploadsDir } = require("./middleware/upload");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = new Set([
  config.clientUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(null, config.clientUrl);
      }
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan(config.env === "development" ? "dev" : "combined"));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please wait a moment and try again.",
      errors: {},
    },
  })
);

app.use("/uploads", express.static(uploadsDir));
app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
