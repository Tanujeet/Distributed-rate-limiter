"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/types";

export function RequestsChart({ data }: { data: ChartData[] }) {
  // Show empty state if no data yet
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-4 shadow-sm">
        <CardHeader>
          <CardTitle>Requests Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground text-sm">
            No traffic recorded yet. Make some requests to see data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 shadow-sm">
      <CardHeader>
        <CardTitle>Requests Over Time</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        {/* FIX: h-87.5 is not a valid Tailwind class — replaced with inline style */}
        <div style={{ height: 350 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="allowed"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="Allowed"
              />
              <Line
                type="monotone"
                dataKey="blocked"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="Blocked"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
