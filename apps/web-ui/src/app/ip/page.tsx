"use client";
import { useState } from "react";
import { api } from "@/service/api";
import { IpAnalytics } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from "lucide-react"; // Added AlertCircle
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
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      {/* Responsive Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          IP & Identifier Analytics
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Investigate specific client IPs or user API keys.
        </p>
      </div>

      {/* Responsive Form */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:max-w-md sm:flex-row"
      >
        <Input
          placeholder="Enter IP (e.g., 192.168.1.1)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full shrink-0 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> /* Added mr-2 */
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Lookup
        </Button>
      </form>

      {/* Standardized Error State */}
      {error && (
        <div className="flex max-w-md items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive md:text-base">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold sm:text-4xl">
                {data.requestCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2 shadow-sm transition-colors",
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
                  "text-3xl font-bold tracking-tight sm:text-4xl",
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
