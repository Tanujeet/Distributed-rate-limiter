"use client";
import { useState } from "react";
import { api } from "@/service/api";
import { EndpointAnalytics } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequestsChart } from "@/components/dashboard/RequestsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

export default function EndpointPage() {
  const [query, setQuery] = useState("/api/test/limited");
  // FIX: was typed as `any` — now properly typed
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
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Endpoint Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Search specific API routes to analyze traffic patterns.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <Input
          placeholder="e.g. /api/test/limited"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Analyze
        </Button>
      </form>

      {error && <p className="text-destructive font-medium">{error}</p>}

      {data && (
        <div className="space-y-6 mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Total Hits for{" "}
                <span className="font-mono text-foreground">
                  {data.endpoint}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {data.totalHits.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <RequestsChart data={data.timeline} />
        </div>
      )}
    </div>
  );
}
