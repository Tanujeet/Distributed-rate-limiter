import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/test.routes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { testDb } from "./utils/testDb";

dotenv.config();

const app = express();

// Trust Railway/Vercel proxy — ZAROORI hai real IP ke liye
app.set("trust proxy", true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" })); // sabhi origins allow — CORS issue nahi hoga

// Routes
app.use("/api/test", testRoutes);
app.use("/api", analyticsRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Rate limiter service is running",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  },
);

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  await testDb();
  console.log(`🚀 Rate Limiter API running on port ${PORT}`);
});
