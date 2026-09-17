import { baseApi } from "./baseApi";
import type { CandidateDashboardData, ProgressTrendsData } from "@/types/analytics";

export const analyticsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<CandidateDashboardData, void>({
      query: () => "/api/v1/analytics/dashboard",
      providesTags: ["Analytics"],
    }),

    getProgressTrends: builder.query<ProgressTrendsData, number | undefined>({
      query: (limit = 10) => `/api/v1/analytics/progress?limit=${limit}`,
      providesTags: ["Analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetProgressTrendsQuery,
} = analyticsApiSlice;