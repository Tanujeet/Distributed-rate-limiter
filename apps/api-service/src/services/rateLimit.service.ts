import { db } from "../config/db";
import { redis } from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";

export async function getAnalytics() {
  const analyticsStart = Date.now(); // 👈

  const [totalRequests, rateLimitExceeded] = await redis.mget(
    RedisKeys.globalRequests(),
    RedisKeys.rateLimitExceeded(),
  );

  console.log(`[METRIC] Analytics fetch: ${Date.now() - analyticsStart}ms`); // 👈

  return {
    totalRequests: Number(totalRequests || 0),
    rateLimitExceeded: Number(rateLimitExceeded || 0),
  };
}

export async function logRateLimitEvent(
  identifier: string,
  endpoint: string,
  allowed: boolean,
) {
  const dbStart = Date.now(); // 👈

  await db.query(
    `INSERT INTO rate_limit_events (identifier, endpoint, allowed) VALUES ($1, $2, $3)`,
    [identifier, endpoint, allowed],
  );

  console.log(`[METRIC] PostgreSQL log insert: ${Date.now() - dbStart}ms`); // 👈
}
