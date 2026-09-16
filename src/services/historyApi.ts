import { request } from "./apiClient";
import {
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
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.pageSize) query.set("page_size", params.pageSize.toString());
    if (params.domainId) query.set("domain_id", params.domainId.toString());
    if (params.roleId) query.set("role_id", params.roleId.toString());
    if (params.mode) query.set("mode", params.mode);
    if (params.status) query.set("status", params.status);

    const queryString = query.toString();
    const endpoint = queryString
      ? `/api/v1/analytics/history?${queryString}`
      : "/api/v1/analytics/history";
    return request<HistoryPageData>(endpoint);
  },

  async getSessionDetails(sessionId: number | string): Promise<SessionDetailData> {
    return request<SessionDetailData>(`/api/v1/analytics/sessions/${sessionId}`);
  },

  async getSessionResult(sessionId: number | string): Promise<SessionResultData> {
    return request<SessionResultData>(`/api/v1/interviews/sessions/${sessionId}/result`);
  },

  getPdfDownloadUrl(sessionId: number | string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/api/v1/sessions/${sessionId}/pdf/download`;
  },
};
