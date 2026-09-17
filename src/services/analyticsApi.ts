import { store } from "@/redux/store";
import { analyticsApiSlice } from "@/redux/api/analyticsApi";
import type { CandidateDashboardData, ProgressTrendsData } from "@/types/analytics";

export const analyticsApi = {
  async getDashboardStats(): Promise<CandidateDashboardData> {
    return store
      .dispatch(analyticsApiSlice.endpoints.getDashboardStats.initiate())
      .unwrap();
  },

  async getProgressTrends(limit: number = 10): Promise<ProgressTrendsData> {
    return store
      .dispatch(analyticsApiSlice.endpoints.getProgressTrends.initiate(limit))
      .unwrap();
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/analyticsApi";