import { OverviewData, EndpointAnalytics, IpAnalytics } from "@/types";

// Backend runs on port 4000 — make sure your .env or server.ts matches
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/analytics";
export const api = {
  /**
   * Fetches global stats for the main dashboard.
   * Backend: GET /api/analytics/overview
   */
  async getOverview(): Promise<OverviewData> {
    const res = await fetch(`${BASE_URL}/overview`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch overview");

    const data = await res.json();

    const total = data.totalRequests || 0;
    const blocked = data.blockedRequests || 0;
    const allowed = Math.max(0, total - blocked);
    const blockRate =
      total > 0 ? Number(((blocked / total) * 100).toFixed(1)) : 0;

    return {
      metrics: {
        totalRequests: total,
        allowedRequests: allowed,
        blockedRequests: blocked,
        blockRate,
      },
      timeline: data.timeline || [],
      topEndpoints: data.topEndpoints || [],
    };
  },

  /**
   * Fetches analytics for a specific API endpoint path.
   * Backend: GET /api/analytics/endpoint?endpoint=...
   */
  async getEndpoint(endpoint: string): Promise<EndpointAnalytics> {
    const res = await fetch(
      `${BASE_URL}/endpoint?endpoint=${encodeURIComponent(endpoint)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error("Endpoint not found");

    const data = await res.json();

    return {
      endpoint: data.endpoint,
      totalHits: data.hits || 0,
      timeline: data.timeline || [],
    };
  },

  /**
   * Fetches request count for a specific IP or user identifier.
   * Backend: GET /api/analytics/ip/:identifier
   *
   * NOTE: Backend doesn't return isBlocked — to add this you'd need a Redis
   * key that tracks blocked state per IP (e.g. `analytics:ip:blocked:<ip>`).
   * For now isBlocked is derived: if requestCount > threshold, mark as suspicious.
   */
  async getIp(identifier: string): Promise<IpAnalytics> {
    const res = await fetch(
      `${BASE_URL}/ip/${encodeURIComponent(identifier)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error("IP data not found");

    const data = await res.json();
    const requestCount = data.requests || 0;

    return {
      ip: data.identifier || identifier,
      requestCount,
      // Treat as "blocked" if they've hit more than 100 requests
      // Replace with real backend data once you add blocked tracking
      isBlocked: requestCount > 100,
    };
  },
};
