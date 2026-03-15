export const RedisKeys = {
  tokenBucket: (identifier: string, endpoint: string) => {
    return `rate_limit:bucket:${endpoint}:${identifier}`;
  },

  endpointHits: (endpoint: string) => {
    return `analytics:endpoint:${endpoint}`;
  },

  globalRequests: () => {
    return `analytics:global_requests`;
  },

  rateLimitExceeded: () => {
    return `analytics:rate_limit_exceeded`;
  },

  userRequests: (userId: string) => {
    return `analytics:user:${userId}`;
  },

  ipRequests: (ip: string) => {
    return `analytics:ip:${ip}`;
  },
};
