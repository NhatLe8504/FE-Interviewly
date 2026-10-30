import { store } from "@/redux/store";
import { historyApiSlice } from "@/redux/api/historyApi";
import { getStoredToken } from "@/services/apiClient";
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
    const token = getStoredToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${baseUrl}/api/v1/sessions/${sessionId}/pdf/download${query}`;
  },

  getPdfPreviewUrl(sessionId: number | string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const token = getStoredToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${baseUrl}/api/v1/sessions/${sessionId}/pdf/preview${query}`;
  },

  async downloadPdfBlob(sessionId: number | string, customFilename?: string): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const url = `${baseUrl}/api/v1/sessions/${sessionId}/pdf/download`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Không có quyền tải báo cáo phiên phỏng vấn này.");
      }
      throw new Error("Báo cáo phiên không tồn tại hoặc đã bị xóa.");
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = customFilename || `session_${sessionId}_report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return true;
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/historyApi";