import { baseApi } from "../baseApi";
import type { SystemStatsOut } from "@/types/admin";

export const adminStatsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<SystemStatsOut, void>({
      query: () => "/api/v1/admin/stats",
      providesTags: ["AdminStats"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminStatsQuery } = adminStatsApiSlice;
