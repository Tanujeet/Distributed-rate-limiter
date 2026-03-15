export interface Metrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  blockRate: number;
}

export interface ChartData {
  timestamp: string;
  allowed: number;
  blocked: number;
}

export interface EndpointStat {
  path: string;
  hits: number;
  blocked: number;
}

export interface OverviewData {
  metrics: Metrics;
  timeline: ChartData[];
  topEndpoints: EndpointStat[];
}

// Used by endpoint/page.tsx
export interface EndpointAnalytics {
  endpoint: string;
  totalHits: number;
  timeline: ChartData[];
}

// Used by ip/page.tsx
export interface IpAnalytics {
  ip: string;
  requestCount: number;
  isBlocked: boolean; // NOTE: backend doesn't return this — always false for now
}
