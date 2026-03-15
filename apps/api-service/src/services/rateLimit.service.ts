import { db } from "../config/db";
import { redis } from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";

/**
 * Returns global rate limit stats from Redis.
 */
export async function getAnalytics() {
  const [totalRequests, rateLimitExceeded] = await redis.mget(
    RedisKeys.globalRequests(),
    RedisKeys.rateLimitExceeded(),
  );

  return {
    totalRequests: Number(totalRequests || 0),
    rateLimitExceeded: Number(rateLimitExceeded || 0),
  };
}

/**
 * Persists a rate limit event to PostgreSQL for historical tracking.
 * Called asynchronously — does not block the HTTP response.
 */
export async function logRateLimitEvent(
  identifier: string,
  endpoint: string,
  allowed: boolean,
) {
  await db.query(
    `INSERT INTO rate_limit_events (identifier, endpoint, allowed) VALUES ($1, $2, $3)`,
    [identifier, endpoint, allowed],
  );
}
