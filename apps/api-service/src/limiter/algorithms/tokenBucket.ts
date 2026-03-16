import { redis } from "../../config/redis";
import {
  TokenBucketOptions,
  TokenBucketResult,
} from "../../types/rateLimit.types";
import { RedisKeys } from "../../utils/redisKeys";

export async function tokenBucket({
  capacity,
  refillRate,
  identifier,
  endpoint,
}: TokenBucketOptions): Promise<TokenBucketResult> {
  const bucketStart = Date.now(); // 👈
  const key = RedisKeys.tokenBucket(identifier, endpoint);
  const now = Date.now();

  const stored = await redis.hgetall(key);
  const isNewBucket = !stored || Object.keys(stored).length === 0;

  let tokens = isNewBucket ? capacity : Number(stored.tokens);
  let lastRefill = isNewBucket ? now : Number(stored.lastRefill);

  const elapsedSeconds = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + elapsedSeconds * refillRate);

  console.log(
    `[BUCKET] KEY: ${key} | NEW: ${isNewBucket} | TOKENS: ${tokens.toFixed(3)} | ELAPSED: ${elapsedSeconds.toFixed(3)}s`,
  );

  if (tokens < 1) {
    console.log(
      `[METRIC] TokenBucket latency: ${Date.now() - bucketStart}ms | BLOCKED`,
    ); // 👈
    return {
      allowed: false,
      remainingTokens: 0,
      retryAfter: Math.ceil((1 - tokens) / refillRate),
    };
  }

  tokens -= 1;

  await redis.hset(key, {
    tokens: tokens.toString(),
    lastRefill: now.toString(),
  });

  await redis.expire(key, 60);

  console.log(
    `[METRIC] TokenBucket latency: ${Date.now() - bucketStart}ms | ALLOWED | remaining: ${Math.floor(tokens)}`,
  ); // 👈

  return {
    allowed: true,
    remainingTokens: Math.floor(tokens),
    retryAfter: 0,
  };
}
