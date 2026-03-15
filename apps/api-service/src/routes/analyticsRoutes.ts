import { Router } from "express";
import { redis } from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";

const router = Router();

/**
 * Builds a sorted timeline array from two Redis hashes (allowed + blocked).
 * Returns the last `limit` time buckets.
 */
async function getTimeline(key: string, limit = 20) {
  const allowed = await redis.hgetall(`analytics:timeline:${key}:allowed`);
  const blocked = await redis.hgetall(`analytics:timeline:${key}:blocked`);

  const times = Array.from(
    new Set([...Object.keys(allowed), ...Object.keys(blocked)]),
  ).sort();

  return times
    .map((time) => ({
      timestamp: time,
      allowed: Number(allowed[time] || 0),
      blocked: Number(blocked[time] || 0),
    }))
    .slice(-limit);
}

/**
 * GET /api/analytics/overview
 * Returns global stats + timeline for the main dashboard.
 */
router.get("/analytics/overview", async (req, res) => {
  try {
    const [totalRequests, blockedRequests] = await redis.mget(
      RedisKeys.globalRequests(),
      RedisKeys.rateLimitExceeded(),
    );

    const timeline = await getTimeline("global");

    // Top 5 most-hit endpoints
    const raw = await redis.zrevrange(
      "analytics:top_endpoints",
      0,
      4,
      "WITHSCORES",
    );
    const topEndpoints = [];
    for (let i = 0; i < raw.length; i += 2) {
      topEndpoints.push({ path: raw[i], hits: Number(raw[i + 1]), blocked: 0 });
    }

    res.json({
      totalRequests: Number(totalRequests || 0),
      blockedRequests: Number(blockedRequests || 0),
      timeline,
      topEndpoints,
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

/**
 * GET /api/analytics/endpoint?endpoint=/api/test/limited
 * Returns hit count + timeline for a specific endpoint.
 */
router.get("/analytics/endpoint", async (req, res) => {
  try {
    const endpoint = req.query.endpoint as string;
    if (!endpoint)
      return res
        .status(400)
        .json({ error: "endpoint query param is required" });

    const hits = await redis.get(RedisKeys.endpointHits(endpoint));
    const timeline = await getTimeline(endpoint);

    res.json({ endpoint, hits: Number(hits || 0), timeline });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch endpoint analytics" });
  }
});

/**
 * GET /api/analytics/ip/:identifier
 * Returns total request count for a specific IP or user ID.
 */
router.get("/analytics/ip/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const requests = await redis.get(RedisKeys.ipRequests(identifier));

    res.json({ identifier, requests: Number(requests || 0) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch IP analytics" });
  }
});

export default router;
