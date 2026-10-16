"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, RotateCcw, Square } from "lucide-react";

interface LogEntry {
  id: number;
  requestNum: number;
  status: number | null;
  timestamp: string;
  retryAfter?: number;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/analytics", "") ||
  "http://localhost:4000";

const TOTAL_REQUESTS = 15; // Extracted as a constant to prevent mismatched numbers

export function RateLimitTester() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [errors, setErrors] = useState(0);
  const stopRef = useRef(false);
  const idRef = useRef(0);
  const runningRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    stopRef.current = true;
    controllerRef.current?.abort();
  }, []);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runTest = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLogs([]);
    setCount(0);
    setAllowed(0);
    setBlocked(0);
    setErrors(0);
    setRunning(true);
    stopRef.current = false;

    let allowedCount = 0;
    let blockedCount = 0;

    // FIX: Synced loop limit with the UI text and progress bar math
    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
      if (stopRef.current) break;

      const ts = new Date().toLocaleTimeString();
      setCount(i);
      try {
        const res = await fetch(`${BASE_URL}/api/test/limited`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (stopRef.current) break;
        const status = res.status;
        let retryAfter: number | undefined;

        if (status === 429) {
          retryAfter = Number(res.headers.get("Retry-After") || 0);
          blockedCount++;
          setBlocked(blockedCount);
        } else if (res.ok) {
          allowedCount++;
          setAllowed(allowedCount);
        } else {
          setErrors((value) => value + 1);
        }

        setCount(i);
        setLogs((prev) => [
          {
            id: idRef.current++,
            requestNum: i,
            status,
            timestamp: ts,
            retryAfter,
          },
          ...prev,
        ]);
      } catch {
        if (stopRef.current) break;
        setLogs((prev) => [
          { id: idRef.current++, requestNum: i, status: null, timestamp: ts },
          ...prev,
        ]);
        setErrors((value) => value + 1);
      }

      await sleep(50);
    }

    runningRef.current = false;
    controllerRef.current = null;
    setRunning(false);
  };

  const stop = () => {
    stopRef.current = true;
    controllerRef.current?.abort();
  };

  const reset = () => {
    setLogs([]);
    setCount(0);
    setAllowed(0);
    setBlocked(0);
    setErrors(0);
    stopRef.current = false;
  };

  const blockRate = count > 0 ? Math.round((blocked / count) * 100) : 0;

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        {/* Responsive Header Layout */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-yellow-500" />
            Live Rate Limit Tester
          </CardTitle>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={running}
              className="h-8 px-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            {running ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={stop}
                className="h-8 flex-1 px-3 text-xs sm:flex-none"
              >
                <Square className="mr-1 h-3 w-3" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={runTest}
                className="h-8 flex-1 bg-yellow-500 px-3 text-xs font-semibold text-black hover:bg-yellow-600 sm:flex-none"
              >
                <Zap className="mr-1 h-3 w-3" />
                Fire {TOTAL_REQUESTS} Requests
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Responsive Stats row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: "Fired", value: count, color: "text-foreground" },
            { label: "Allowed", value: allowed, color: "text-emerald-500" },
            { label: "Blocked", value: blocked, color: "text-red-500" },
            { label: "Errors", value: errors, color: "text-red-500" },
            {
              label: "Block %",
              value: `${blockRate}%`,
              color:
                blockRate > 0 ? "text-orange-500" : "text-muted-foreground",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md bg-muted/40 p-2 text-center"
            >
              <div className={cn("text-lg font-bold tabular-nums", s.color)}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {running && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-100"
              style={{ width: `${(count / TOTAL_REQUESTS) * 100}%` }}
            />
          </div>
        )}

        {/* Log Area */}
        <div className="h-48 space-y-1 overflow-y-auto rounded-md border border-border/50 bg-muted/30 p-2 font-mono text-xs">
          {logs.length === 0 && (
            <p className="mt-16 text-center text-muted-foreground">
              Click &quot;Fire {TOTAL_REQUESTS} Requests&quot; to test rate limiting live
            </p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-center gap-2 rounded px-2 py-1.5",
                log.status === 200 ? "bg-emerald-500/10" : "bg-red-500/10",
              )}
            >
              <span className="w-5 shrink-0 text-right text-muted-foreground sm:w-6">
                #{log.requestNum}
              </span>
              <span
                className={cn(
                  "w-8 shrink-0 font-bold",
                  log.status === 200 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {log.status ?? "ERR"}
              </span>
              {/* Added truncate so long retry strings don't break layout on mobile */}
              <span className="flex-1 truncate text-muted-foreground">
                {log.status === 200
                  ? "Allowed"
                  : log.status === 429
                    ? `Too Many Requests${log.retryAfter ? ` — retry in ${log.retryAfter}s` : ""}`
                    : log.status === null ? "Network error" : "Request failed"}
              </span>
              {/* Hidden on very small screens to save space */}
              <span className="hidden text-muted-foreground/60 sm:inline-block">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Hits{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            /api/test/limited
          </code>{" "}
          — bucket capacity 3, refills one request every 20 seconds
        </p>
      </CardContent>
    </Card>
  );
}
