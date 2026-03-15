export interface RateLimitConfig {
  capacity: number; // max tokens in bucket
  refillRate: number; // tokens added per second
}

export interface TokenBucketOptions {
  capacity: number;
  refillRate: number;
  identifier: string;
  endpoint: string;
}

export interface TokenBucketResult {
  allowed: boolean;
  remainingTokens: number;
  retryAfter: number; // seconds
}

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}
