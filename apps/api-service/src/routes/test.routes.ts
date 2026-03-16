import { Router, Request, Response } from "express";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/limited", rateLimit, (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Request allowed",
    timestamp: new Date().toISOString(),
  });
});

router.get("/unlimited", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "No rate limit here",
  });
});

// 👈 LOAD TEST ROUTE
router.get("/load-test", async (req: Request, res: Response) => {
  const totalRequests = 300;
  const results = { allowed: 0, blocked: 0, totalMs: 0 };
  const latencies: number[] = [];

  const start = Date.now();

  for (let i = 0; i < totalRequests; i++) {
    const reqStart = Date.now();

    // Simulate different IPs to test cross-client isolation
    const fakeReq = {
      method: "GET",
      path: "/test/limited",
      originalUrl: "/test/limited",
      ip: `192.168.1.${i % 10}`, // 10 different IPs
      headers: { "x-user-id": `user-${i % 10}` },
    } as unknown as Request;

    const fakeRes = {
      setHeader: () => {},
      status: () => ({ json: () => {} }),
      json: () => {},
    } as unknown as Response;

    await new Promise<void>((resolve) => {
      rateLimit(fakeReq, fakeRes, () => {
        results.allowed++;
        resolve();
      });

      // Check if blocked via status
      const originalStatus = fakeRes.status;
      fakeRes.status = (code: number) => {
        if (code === 429) results.blocked++;
        return originalStatus.call(fakeRes, code);
      };

      resolve();
    });

    const latency = Date.now() - reqStart;
    latencies.push(latency);
  }

  results.totalMs = Date.now() - start;

  const p50 = latencies.sort((a, b) => a - b)[Math.floor(totalRequests * 0.5)];
  const p99 = latencies[Math.floor(totalRequests * 0.99)];
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / totalRequests);

  console.log(
    `[METRIC] Load test: ${totalRequests} requests in ${results.totalMs}ms`,
  );
  console.log(`[METRIC] p50: ${p50}ms | p99: ${p99}ms | avg: ${avg}ms`);
  console.log(
    `[METRIC] Allowed: ${results.allowed} | Blocked: ${results.blocked}`,
  );

  return res.json({
    totalRequests,
    totalMs: results.totalMs,
    allowed: results.allowed,
    blocked: results.blocked,
    latency: { p50, p99, avg },
  });
});

export default router;
