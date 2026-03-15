"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ban, CheckCircle, Percent } from "lucide-react";
import { Metrics } from "@/types";
import { cn } from "@/lib/utils"; // Added for class merging

interface MetricCardsProps {
  data: Metrics;
}

export function MetricCards({ data }: MetricCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: data.totalRequests,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Allowed",
      value: data.allowedRequests,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      title: "Blocked",
      value: data.blockedRequests,
      icon: Ban,
      color: "text-destructive",
    },
    {
      title: "Block Rate",
      value: `${data.blockRate}%`,
      icon: Percent,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {c.title}
            </CardTitle>
            <c.icon className={cn("h-4 w-4", c.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold sm:text-3xl">
              {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}