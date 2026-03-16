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
    const forwarded = (req.headers["x-forwarded-for"] as string)
      ?.split(",")[0]
      ?.trim();
    const identifier =
      (req.headers["x-user-id"] as string) ||
      forwarded ||
      req.ip ||
      "anonymous";
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
    const timeBucket = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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
    next();
  }
}
