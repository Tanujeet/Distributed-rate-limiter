import { tokenBucket } from "./algorithms/tokenBucket";

interface RateLimitConfig {
  capacity: number; // Max tokens the bucket can hold
  refillRate: number; // Tokens added per second
}

interface RateLimitRequest {
  identifier: string; // IP address or user ID
  endpoint: string; // API path being accessed
  config: RateLimitConfig;
}

interface RateLimitResponse {
  allowed: boolean;
  remaining: number; // Tokens left after this request
  retryAfter: number; // Seconds to wait if blocked
}

/**
 * Core rate limiter — delegates to the Token Bucket algorithm.
 * All Redis analytics tracking is handled in the middleware layer.
 */
export async function checkRateLimit({
  identifier,
  endpoint,
  config,
}: RateLimitRequest): Promise<RateLimitResponse> {
  const result = await tokenBucket({
    capacity: config.capacity,
    refillRate: config.refillRate,
    identifier,
    endpoint,
  });

  return {
    allowed: result.allowed,
    remaining: Math.floor(result.remainingTokens),
    retryAfter: result.retryAfter,
  };
}
