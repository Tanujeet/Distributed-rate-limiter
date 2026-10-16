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
  const key = RedisKeys.tokenBucket(identifier, endpoint);
  const result = await redis.eval(`
    local clock = redis.call('TIME')
    local now = tonumber(clock[1]) * 1000 + tonumber(clock[2]) / 1000
    local capacity = tonumber(ARGV[1])
    local rate = tonumber(ARGV[2])
    local stored = redis.call('HMGET', KEYS[1], 'tokens', 'lastRefill')
    local tokens = tonumber(stored[1]) or capacity
    local last = tonumber(stored[2]) or now
    tokens = math.min(capacity, tokens + math.max(0, now - last) / 1000 * rate)
    local allowed = 0
    if tokens >= 1 then
      tokens = tokens - 1
      allowed = 1
    end
    local retry = math.max(0, math.ceil((1 - tokens) / rate))
    redis.call('HSET', KEYS[1], 'tokens', tokens, 'lastRefill', now,
      'blockedUntil', now + math.max(0, (1 - tokens) / rate) * 1000)
    redis.call('EXPIRE', KEYS[1], math.ceil(capacity / rate))
    return {allowed, math.floor(tokens), allowed == 1 and 0 or retry}
  `, 1, key, capacity, refillRate) as number[];

  return {
    allowed: result[0] === 1,
    remainingTokens: result[1],
    retryAfter: result[2],
  };
}
