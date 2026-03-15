import { redis } from "../../config/redis";
import {
  TokenBucketOptions,
  TokenBucketResult,
} from "../../types/rateLimit.types";
import { RedisKeys } from "../../utils/redisKeys";

/**
 * Token Bucket Algorithm
 *
 * How it works:
 *  - Each identifier (IP/user) gets a "bucket" stored in Redis.
 *  - The bucket holds tokens (max = capacity).
 *  - Every second, `refillRate` tokens are added back.
 *  - Each request consumes 1 token.
 *  - If the bucket is empty → request is blocked.
 */
export async function tokenBucket({
  capacity,
  refillRate,
  identifier,
  endpoint,
}: TokenBucketOptions): Promise<TokenBucketResult> {
  const key = RedisKeys.tokenBucket(identifier, endpoint);
  const now = Date.now();

  // Load existing bucket from Redis
  const stored = await redis.hgetall(key);
  const isNewBucket = !stored || Object.keys(stored).length === 0;

  // Initialize or restore token state
  let tokens = isNewBucket ? capacity : Number(stored.tokens);
  let lastRefill = isNewBucket ? now : Number(stored.lastRefill);

  // Refill tokens based on elapsed time
  const elapsedSeconds = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + elapsedSeconds * refillRate);
  console.log(
    `[BUCKET] KEY: ${key} | NEW: ${isNewBucket} | TOKENS: ${tokens.toFixed(3)} | ELAPSED: ${elapsedSeconds.toFixed(3)}s`,
  );

  // Deny request if not enough tokens
  if (tokens < 1) {
    return {
      allowed: false,
      remainingTokens: 0,
      retryAfter: Math.ceil((1 - tokens) / refillRate),
    };
  }

  // Consume 1 token and persist updated bucket
  tokens -= 1;

  await redis.hset(key, {
    tokens: tokens.toString(),
    lastRefill: now.toString(),
  });

  // Auto-expire bucket after 60s of inactivity
  await redis.expire(key, 60);

  return {
    allowed: true,
    remainingTokens: Math.floor(tokens),
    retryAfter: 0,
  };
}
