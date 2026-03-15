"use client";
import { useState, useEffect } from "react";
import { api } from "@/service/api";
import { OverviewData } from "@/types";
import { RequestsChart } from "@/components/dashboard/RequestsChart";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { TopEndpointsTable } from "@/components/dashboard/TopEndpointsTable";
import { RateLimitTester } from "@/components/dashboard/RateLimitTester";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api
      .getOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-87.5 w-full" />
          <Skeleton className="col-span-3 h-87.5 w-full" />
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
        <AlertCircle className="h-5 w-5" />
        <p>Backend connection error: Ensure API is running on port 4000.</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <MetricCards data={data.metrics} />

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <RateLimitTester />
          <RequestsChart data={data.timeline} />
        </div>
        <div className="lg:col-span-3">
          <TopEndpointsTable endpoints={data.topEndpoints} />
        </div>
      </div>
    </div>
  );
}
