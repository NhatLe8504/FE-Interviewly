import { store } from "@/redux/store";
import { historyApiSlice } from "@/redux/api/historyApi";
import type {
  HistoryPageData,
  SessionDetailData,
  SessionResultData,
} from "@/types/analytics";

export interface HistoryQueryParams {
  page?: number;
  pageSize?: number;
  domainId?: number;
  roleId?: number;
  mode?: string;
  status?: string;
}

export const historyApi = {
  async getInterviewHistory(params: HistoryQueryParams = {}): Promise<HistoryPageData> {
    return store
      .dispatch(historyApiSlice.endpoints.getInterviewHistory.initiate(params))
      .unwrap();
  },

  async getSessionDetails(sessionId: number | string): Promise<SessionDetailData> {
    return store
      .dispatch(historyApiSlice.endpoints.getSessionDetails.initiate(sessionId))
      .unwrap();
  },

  async getSessionResult(sessionId: number | string): Promise<SessionResultData> {
    return store
      .dispatch(historyApiSlice.endpoints.getHistoricalSessionResult.initiate(sessionId))
      .unwrap();
  },

  getPdfDownloadUrl(sessionId: number | string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/api/v1/sessions/${sessionId}/pdf/download`;
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/historyApi";