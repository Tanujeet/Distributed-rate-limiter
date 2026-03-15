import { Router, Request, Response } from "express";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

/**
 * Simple test endpoint with rate limiting
 */
router.get("/limited", rateLimit, (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Request allowed",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint without rate limiting (control test)
 */
router.get("/unlimited", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "No rate limit here",
  });
});

export default router;
