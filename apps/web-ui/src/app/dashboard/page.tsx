"use client";
import { useState, useEffect } from "react";
import { api } from "@/service/api";
import { OverviewData } from "@/types";
import { RequestsChart } from "@/components/dashboard/RequestsChart";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { TopEndpointsTable } from "@/components/dashboard/TopEndpointsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Skeleton className="col-span-4 h-[350px] w-full" />
          <Skeleton className="col-span-3 h-[350px] w-full" />
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
        <AlertCircle className="h-5 w-5" />
        {/* FIX: was incorrectly saying port 5000 — backend runs on port 4000 */}
        <p>Backend connection error: Ensure API is running on port 4000.</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>

      <MetricCards data={data.metrics} />

      <div className="grid gap-4 lg:grid-cols-7">
        <RequestsChart data={data.timeline} />
        <TopEndpointsTable endpoints={data.topEndpoints} />
      </div>
    </div>
  );
}
