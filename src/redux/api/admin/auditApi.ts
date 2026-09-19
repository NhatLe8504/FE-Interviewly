import { baseApi } from "../baseApi";
import type { AuditLogPageOut } from "@/types/admin";

export interface ServerRouteLog {
  id: number;
  timestamp: string;
  method: string;
  path: string;
  query: string;
  status_code: number;
  duration_ms: number;
  client_ip: string;
  user_id?: number | null;
  user_agent: string;
  level: "INFO" | "WARN" | "ERROR" | string;
  status: "success" | "warning" | "failure";
  summary: string;
}

export interface ServerLogStats {
  total_requests: number;
  success_count: number;
  client_error_count: number;
  server_error_count: number;
  avg_duration_ms: number;
  uptime_seconds: number;
  retention_minutes: number;
}

export interface ServerLogsResponse {
  terminal_lines: string[];
  routes: ServerRouteLog[];
  total: number;
  limit: number;
  offset: number;
  stats: ServerLogStats;
}

export interface ServerLogsParams {
  limit?: number;
  offset?: number;
  level?: string;
  search?: string;
  method?: string;
  status_code?: number;
  tail_lines?: number;
}

export const adminAuditApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogPageOut,
      { tableName?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.tableName && params.tableName !== "all") {
          queryParams.append("table_name", params.tableName);
        }
        if (typeof params?.limit === "number") {
          queryParams.append("limit", String(params.limit));
        }
        if (typeof params?.offset === "number") {
          queryParams.append("offset", String(params.offset));
        }
        const qs = queryParams.toString();
        return `/api/v1/admin/audit-logs${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AuditLogs" as any],
    }),

    getServerLogs: builder.query<ServerLogsResponse, ServerLogsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        if (params?.level && params.level !== "ALL") queryParams.append("level", params.level);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.method && params.method !== "all") queryParams.append("method", params.method);
        if (typeof params?.status_code === "number") queryParams.append("status_code", String(params.status_code));
        if (typeof params?.tail_lines === "number") queryParams.append("tail_lines", String(params.tail_lines));
        const qs = queryParams.toString();
        return `/api/v1/admin/server-logs${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServerLogs" as any],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery, useGetServerLogsQuery } = adminAuditApiSlice;