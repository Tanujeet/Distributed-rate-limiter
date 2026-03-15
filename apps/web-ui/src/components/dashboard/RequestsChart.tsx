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
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Requests Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center sm:h-[350px]">
          <p className="px-4 text-center text-sm text-muted-foreground">
            No traffic recorded yet. Make some requests to see data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Requests Over Time
        </CardTitle>
      </CardHeader>
      {/* Adjusted padding to prevent Y-axis cutoff on narrow mobile screens */}
      <CardContent className="px-2 pb-4 sm:px-6">
        {/* Replaced inline style with responsive Tailwind heights */}
        <div className="h-[250px] w-full sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
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
                minTickGap={20} // Prevents label collision on mobile
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
                  fontSize: "12px",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
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