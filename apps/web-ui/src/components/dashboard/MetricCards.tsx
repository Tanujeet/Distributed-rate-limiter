"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ban, CheckCircle, Percent } from "lucide-react";
import { Metrics } from "@/types";

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
