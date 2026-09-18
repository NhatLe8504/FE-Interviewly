import { baseApi } from "../baseApi";
import type { ModerationPageOut } from "@/types/admin";

export const adminModerationApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getModerationLogs: builder.query<
      ModerationPageOut,
      { targetType?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.targetType) queryParams.append("target_type", params.targetType);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/moderation${qs ? `?${qs}` : ""}`;
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetModerationLogsQuery } = adminModerationApiSlice;
