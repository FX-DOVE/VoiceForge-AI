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

// Build allowed origins from config + common dev + any extra from env (comma separated)
const extraOrigins = (process.env.ADDITIONAL_CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  config.clientUrl,
  process.env.SERVER_URL,
  "https://voiceforgeai.site",
  "https://www.voiceforgeai.site",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...extraOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      // Allow any subdomain of known production domains (helps with www / staging)
      if (origin.endsWith("voiceforgeai.site")) return callback(null, true);
      // Allow the configured client / server origin even if not exact match above
      if (config.clientUrl && origin === config.clientUrl) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
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
app.use((req, res, next) => {
  if (req.path === "/api/payments/paystack/webhook") {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => {
      req.rawBody = Buffer.concat(data);
      req.body = req.rawBody;
      next();
    });
  } else {
    next();
  }
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Lenient limiter for read-only, cacheable preview/list endpoints
app.use(
  /^\/api\/voices(\/[^/]+\/preview)?$/,
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please wait a moment and try again.",
      errors: {},
    },
  })
);

// Global limiter for all other routes (skip auth to avoid carrier NAT issues on mobile)
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: Math.max(config.rateLimit.max, 300),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/api/auth/"),
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
