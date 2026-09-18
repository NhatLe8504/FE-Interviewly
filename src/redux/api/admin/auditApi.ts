import { baseApi } from "../baseApi";
import type { AuditLogPageOut } from "@/types/admin";

export const adminAuditApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogPageOut,
      { tableName?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.tableName) queryParams.append("table_name", params.tableName);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/audit-logs${qs ? `?${qs}` : ""}`;
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = adminAuditApiSlice;
