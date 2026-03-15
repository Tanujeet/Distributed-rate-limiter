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
        {/* Metric Cards Skeletons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        {/* Main Content Skeletons */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <Skeleton className="h-87.5 w-full lg:col-span-4" />
          <Skeleton className="h-87.5 w-full lg:col-span-3" />
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive md:text-base">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>Backend connection error: Ensure API is running on port 4000.</p>
      </div>
    );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Responsive Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          System Overview
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="w-full gap-2 sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metric Cards (Ensure your MetricCards component uses grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 internally) */}
      <MetricCards data={data.metrics} />

      {/* Main Responsive Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {/* Left Column (Charts & Tester) */}
        <div className="space-y-4 lg:col-span-4">
          <RateLimitTester />
          <RequestsChart data={data.timeline} />
        </div>

        {/* Right Column (Tables) */}
        <div className="lg:col-span-3">
          <TopEndpointsTable endpoints={data.topEndpoints} />
        </div>
      </div>
    </div>
  );
}
