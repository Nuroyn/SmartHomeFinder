import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";

import authV1Routes from "./routes/v1/auth.routes.js";
import usersV1Routes from "./routes/v1/users.routes.js";
import propertiesV1Routes from "./routes/v1/properties.routes.js";
import transactionsV1Routes from "./routes/v1/transactions.routes.js";
import walletsV1Routes from "./routes/v1/wallets.routes.js";
import mediaV1Routes from "./routes/v1/media.routes.js";
import adminV1Routes from "./routes/v1/admin.routes.js";

import "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// ── Security headers ──
app.use(helmet());

// ── Rate limiting ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});
app.use("/api/", apiLimiter);

// Strict rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later" },
});
app.use("/api/auth/", authLimiter);
app.use("/api/v1/auth/", authLimiter);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:19006,exp://localhost:19000,exp://127.0.0.1:19000,http://10.0.2.2:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Native mobile clients often send no origin; allow them by default
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Legacy routes (keep for compatibility)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentsRoutes);

// Versioned routes (v1)
app.use("/api/v1/auth", authV1Routes);
app.use("/api/v1/users", usersV1Routes);
app.use("/api/v1/properties", propertiesV1Routes);
app.use("/api/v1/transactions", transactionsV1Routes);
app.use("/api/v1/wallets", walletsV1Routes);
app.use("/api/v1/media", mediaV1Routes);
app.use("/api/v1/admin", adminV1Routes);

app.get("/", (req, res) => {
  res.send("SmartHomeFinder API");
});

// ── Global error handler (must be last middleware) ──
app.use((err, _req, res, _next) => {
  // Don't leak internal details to the client
  const status = err.status || 500;
  const message = status < 500 ? err.message : "Internal server error";
  if (status >= 500 && process.env.NODE_ENV !== "test") {
    console.error("Unhandled error:", err);
  }
  res.status(status).json({ message });
});

export default app;
