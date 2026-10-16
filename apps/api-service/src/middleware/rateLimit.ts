import { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../limiter/rateLimiter";
import { logRateLimitEvent } from "../services/rateLimit.service";
import { redis } from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";

const DEFAULT_CONFIG = {
  capacity: 3,
  refillRate: 0.05,
};

export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const middlewareStart = Date.now(); // 👈

  if (req.method === "OPTIONS" || req.path === "/favicon.ico") {
    return next();
  }

  try {
    const identifier = req.ip || "anonymous";
    const endpoint = req.originalUrl.split("?")[0];

    const result = await checkRateLimit({
      identifier,
      endpoint,
      config: DEFAULT_CONFIG,
    });

    console.log(
      `[METRIC] RateLimit decision: ${Date.now() - middlewareStart}ms | allowed: ${result.allowed}`,
    ); // 👈

    const now = new Date();
    const timeBucket = now.toISOString().slice(0, 16) + ":00Z";

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

    await pipeline.exec().catch(console.error);

    console.log(
      `[METRIC] Pipeline exec total: ${Date.now() - middlewareStart}ms`,
    ); // 👈

    logRateLimitEvent(identifier, endpoint, result.allowed).catch(
      console.error,
    );

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
    console.error("Rate limiter error:", error);
    res.status(503).json({ success: false, error: "Rate limiter unavailable" });
  }
}
