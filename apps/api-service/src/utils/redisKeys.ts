export const RedisKeys = {
  // Stores token bucket state for one user on one endpoint
  tokenBucket: (identifier: string, endpoint: string) => {
    return `rate_limit:bucket:${endpoint}:${identifier}`;
  },

  // Stores total hit count for one endpoint
  endpointHits: (endpoint: string) => {
    return `analytics:endpoint:${endpoint}`;
  },

  // Stores total requests across entire system
  globalRequests: () => {
    return `analytics:global_requests`;
  },

  // Stores how many times rate limit was triggered
  rateLimitExceeded: () => {
    return `analytics:rate_limit_exceeded`;
  },

  // Stores request count for one user
  userRequests: (userId: string) => {
    return `analytics:user:${userId}`;
  },

  // Stores request count for one IP
  ipRequests: (ip: string) => {
    return `analytics:ip:${ip}`;
  },
};
