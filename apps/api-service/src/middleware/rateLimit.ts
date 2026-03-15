import { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../limiter/rateLimiter";
import { logRateLimitEvent } from "../services/rateLimit.service";
import { redis } from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";

const DEFAULT_CONFIG = {
  capacity: 3, // Max 10 requests in the bucket
  refillRate: 0.05, // Refill 5 tokens per second
};

/**
 * Rate Limiting Middleware
 *
 * For each incoming request:
 *  1. Identify the client (by user-id header or IP).
 *  2. Run the token bucket check.
 *  3. Record analytics in Redis (pipeline for performance).
 *  4. Log the event to PostgreSQL (async, non-blocking).
 *  5. Allow or block the request.
 */
export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("RAW IP:", req.ip);
  console.log(
    "IDENTIFIER:",
    (req.headers["x-user-id"] as string) || req.ip || "anonymous",
  );

  // Skip rate limiting for CORS preflight and favicon requests
  if (req.method === "OPTIONS" || req.path === "/favicon.ico") {
    return next();
  }

  try {
    const forwarded = (req.headers["x-forwarded-for"] as string)
      ?.split(",")[0]
      ?.trim();
    const identifier =
      (req.headers["x-user-id"] as string) || req.ip || "anonymous";
    const endpoint = req.originalUrl.split("?")[0]; // Strip query params
    console.log("IDENTIFIER:", identifier);
    const result = await checkRateLimit({
      identifier,
      endpoint,
      config: DEFAULT_CONFIG,
    });

    // Current time bucket for chart data (e.g., "14:05")
    const now = new Date();
    const timeBucket = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Batch all Redis writes into a single pipeline call
    const pipeline = redis.pipeline();
    pipeline.incr(RedisKeys.globalRequests());
    pipeline.incr(RedisKeys.endpointHits(endpoint));
    pipeline.incr(RedisKeys.ipRequests(identifier));
    pipeline.zincrby("analytics:top_endpoints", 1, endpoint);

    if (result.allowed) {
      pipeline.hincrby(`analytics:timeline:${endpoint}:allowed`, timeBucket, 1);
      pipeline.hincrby(`analytics:timeline:global:allowed`, timeBucket, 1);
    } else {
      pipeline.incr(RedisKeys.rateLimitExceeded());
      pipeline.hincrby(`analytics:timeline:${endpoint}:blocked`, timeBucket, 1);
      pipeline.hincrby(`analytics:timeline:global:blocked`, timeBucket, 1);
    }

    await pipeline.exec();

    // Log to Postgres without blocking the response
    logRateLimitEvent(identifier, endpoint, result.allowed).catch(
      console.error,
    );

    // Set rate limit info in response headers
    res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
    res.setHeader("Retry-After", result.retryAfter.toString());

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: "Too Many Requests",
        retryAfter: result.retryAfter,
      });
    }

    next();
  } catch (error) {
    // Fail-open: if rate limiter errors, let the request through
    console.error("Rate limiter error:", error);
    next();
  }
}
