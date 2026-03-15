import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

/**
 * Redis client used across the application
 * Single instance to avoid creating multiple connections
 */
export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  enableReadyCheck: true,

  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

/**
 * Connection logging
 */
redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
