"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EndpointStat } from "@/types";

interface TopEndpointsTableProps {
  endpoints: EndpointStat[];
}

export function TopEndpointsTable({ endpoints }: TopEndpointsTableProps) {
  // Graceful empty state
  if (!endpoints || endpoints.length === 0) {
    return (
      <Card className="flex h-full w-full flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          No endpoint data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Top Endpoints</CardTitle>
      </CardHeader>

      {/* px-0 on mobile allows the table to stretch edge-to-edge for more space */}
      <CardContent className="flex-1 overflow-auto px-2 pb-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead className="text-right">Hits</TableHead>
              <TableHead className="text-right">Blocked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((ep) => (
              <TableRow key={ep.path}>
                {/* Truncate on mobile to prevent layout breakage. 
                  Expands naturally on sm screens and larger.
                */}
                <TableCell
                  className="max-w-[150px] truncate font-medium sm:max-w-none"
                  title={ep.path} // Shows full path on hover if truncated
                >
                  {ep.path}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {ep.hits?.toLocaleString() ?? 0}
                </TableCell>

                {/* FIX: Changed from ep.hits to ep.blocked */}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {ep.blocked?.toLocaleString() ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
