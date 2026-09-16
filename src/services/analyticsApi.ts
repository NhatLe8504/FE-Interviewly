import { request } from "./apiClient";
import { CandidateDashboardData, ProgressTrendsData } from "@/types/analytics";

export const analyticsApi = {
  async getDashboardStats(): Promise<CandidateDashboardData> {
    return request<CandidateDashboardData>("/api/v1/analytics/dashboard");
  },

  async getProgressTrends(limit: number = 10): Promise<ProgressTrendsData> {
    return request<ProgressTrendsData>(`/api/v1/analytics/progress?limit=${limit}`);
  },
};
