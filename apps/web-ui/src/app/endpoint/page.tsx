"use client";
import { useState } from "react";
import { api } from "@/service/api";
import { EndpointAnalytics } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequestsChart } from "@/components/dashboard/RequestsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle

export default function EndpointPage() {
  const [query, setQuery] = useState("/api/test/limited");
  const [data, setData] = useState<EndpointAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.getEndpoint(query.trim());
      setData(result);
    } catch {
      setError("Endpoint not found or error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      {/* Responsive Header Typography */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Endpoint Analytics
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Search specific API routes to analyze traffic patterns.
        </p>
      </div>

      {/* Responsive Form */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:max-w-md sm:flex-row"
      >
        <Input
          placeholder="e.g. /api/test/limited"
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> /* Added mr-2 here */
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Analyze
        </Button>
      </form>

      {/* Upgraded Error State to match Dashboard styling */}
      {error && (
        <div className="flex max-w-md items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive md:text-base">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Hits for{" "}
                {/* Added break-all to handle extremely long URLs gracefully on mobile */}
                <span className="break-all font-mono text-foreground">
                  {data.endpoint}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold sm:text-4xl">
                {data.totalHits.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Added an overflow wrapper to ensure the chart doesn't break horizontal bounds */}
          <div className="w-full overflow-hidden">
            <RequestsChart data={data.timeline} />
          </div>
        </div>
      )}
    </div>
  );
}
