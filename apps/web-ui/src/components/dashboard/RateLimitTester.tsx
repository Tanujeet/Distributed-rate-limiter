"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, RotateCcw, Square } from "lucide-react";

interface LogEntry {
  id: number;
  requestNum: number;
  status: 200 | 429;
  timestamp: string;
  retryAfter?: number;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/analytics", "") ||
  "http://localhost:4000";

export function RateLimitTester() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const stopRef = useRef(false);
  const idRef = useRef(0);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runTest = async () => {
    setLogs([]);
    setCount(0);
    setAllowed(0);
    setBlocked(0);
    setRunning(true);
    stopRef.current = false;

    let allowedCount = 0;
    let blockedCount = 0;

    for (let i = 1; i <= 20; i++) {
      if (stopRef.current) break;

      const ts = new Date().toLocaleTimeString();
      try {
        const res = await fetch(`${BASE_URL}/api/test/limited`, {
          cache: "no-store",
        });
        const status = res.status as 200 | 429;
        let retryAfter: number | undefined;

        if (status === 429) {
          retryAfter = Number(res.headers.get("Retry-After") || 0);
          blockedCount++;
          setBlocked(blockedCount);
        } else {
          allowedCount++;
          setAllowed(allowedCount);
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
        setLogs((prev) => [
          { id: idRef.current++, requestNum: i, status: 429, timestamp: ts },
          ...prev,
        ]);
        blockedCount++;
        setBlocked(blockedCount);
      }

      await sleep(50);
    }

    setRunning(false);
  };

  const stop = () => {
    stopRef.current = true;
    setRunning(false);
  };

  const reset = () => {
    setLogs([]);
    setCount(0);
    setAllowed(0);
    setBlocked(0);
    stopRef.current = false;
  };

  const blockRate = count > 0 ? Math.round((blocked / count) * 100) : 0;

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Live Rate Limit Tester
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={running}
              className="h-7 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            {running ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={stop}
                className="h-7 px-3 text-xs"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={runTest}
                className="h-7 px-3 text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                <Zap className="h-3 w-3 mr-1" />
                Fire 15 Requests
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Fired", value: count, color: "text-foreground" },
            { label: "Allowed", value: allowed, color: "text-emerald-500" },
            { label: "Blocked", value: blocked, color: "text-red-500" },
            {
              label: "Block %",
              value: `${blockRate}%`,
              color:
                blockRate > 0 ? "text-orange-500" : "text-muted-foreground",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-muted/40 rounded-md p-2 text-center"
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
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-100 rounded-full"
              style={{ width: `${(count / 15) * 100}%` }}
            />
          </div>
        )}

        {/* Log */}
        <div className="bg-muted/30 rounded-md border border-border/50 h-48 overflow-y-auto p-2 font-mono text-xs space-y-1">
          {logs.length === 0 && (
            <p className="text-muted-foreground text-center mt-16">
              Click "Fire 15 Requests" to test rate limiting live
            </p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded",
                log.status === 200 ? "bg-emerald-500/10" : "bg-red-500/10",
              )}
            >
              <span className="text-muted-foreground w-6 text-right">
                #{log.requestNum}
              </span>
              <span
                className={cn(
                  "font-bold w-8",
                  log.status === 200 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {log.status}
              </span>
              <span className="text-muted-foreground flex-1">
                {log.status === 200
                  ? "Request allowed"
                  : `Too Many Requests${log.retryAfter ? ` — retry in ${log.retryAfter}s` : ""}`}
              </span>
              <span className="text-muted-foreground/60">{log.timestamp}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Hits <code className="bg-muted px-1 rounded">/api/test/limited</code>{" "}
          — bucket capacity 10, blocks after limit exceeded
        </p>
      </CardContent>
    </Card>
  );
}
