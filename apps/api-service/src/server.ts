import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/test.routes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { testDb } from "./utils/testDb";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/test", testRoutes); // Rate-limited test endpoints
app.use("/api", analyticsRoutes); // Analytics dashboard endpoints

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

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  await testDb();
  console.log(`🚀 Rate Limiter API running on port ${PORT}`);
});
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-vercel-app.vercel.app", // Vercel deploy hone ke baad add karna
    ],
  }),
);