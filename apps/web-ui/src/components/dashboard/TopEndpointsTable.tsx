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
  return (
    <Card className="col-span-3 shadow-sm overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>Top Endpoints</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
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
                <TableCell className="font-medium">{ep.path}</TableCell>
                <TableCell className="text-right">
                  {ep.hits.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {(ep.hits ?? 0).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
