import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/test.routes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

const app = express();

// Trust Railway/Vercel proxy
app.set("trust proxy", process.env.TRUST_PROXY?.split(",").map((value) => value.trim()) || false);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", exposedHeaders: ["Retry-After", "X-RateLimit-Remaining"] }));

// Routes
app.use("/api/test", testRoutes);
app.use("/api", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  if (process.env.PROXY_DIAGNOSTICS === "1" && req.query.proxyCheck === "1") {
    console.log("[PROXY_CHECK]", JSON.stringify({
      remoteAddress: req.socket.remoteAddress,
      forwardedFor: req.get("x-forwarded-for"),
      clientIp: req.ip,
    }));
  }
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {

  console.log(`🚀 Rate Limiter API running on port ${PORT}`);
});
