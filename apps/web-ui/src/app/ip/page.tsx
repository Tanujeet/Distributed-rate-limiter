"use client";
import { useState } from "react";
import { api } from "@/service/api";
import { IpAnalytics } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IpPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<IpAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.getIp(query.trim());
      setData(result);
    } catch {
      setError("IP/Identifier not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          IP & Identifier Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Investigate specific client IPs or user API keys.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <Input
          placeholder="Enter IP (e.g., 192.168.1.1)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Lookup
        </Button>
      </form>

      {error && <p className="text-destructive font-medium">{error}</p>}

      {data && (
        <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {data.requestCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "shadow-sm border-2 transition-colors",
              data.isBlocked
                ? "border-destructive/50 bg-destructive/5"
                : "border-emerald-500/50 bg-emerald-500/5",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Enforced Status
              </CardTitle>
              {data.isBlocked ? (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-4xl font-bold tracking-tight",
                  data.isBlocked ? "text-destructive" : "text-emerald-500",
                )}
              >
                {data.isBlocked ? "BLOCKED" : "ALLOWED"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
