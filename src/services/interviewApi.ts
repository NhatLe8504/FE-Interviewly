import { request, getStoredToken } from "./apiClient";
import {
  StartSessionIn,
  SessionOut,
  TurnSubmitIn,
  TurnOut,
  RubricEvaluationOut,
  SessionResultOut,
} from "@/types/interview";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const interviewApi = {
  /**
   * Khởi tạo phiên phỏng vấn mới với AI
   */
  async startSession(payload: StartSessionIn): Promise<SessionOut> {
    return request<SessionOut>("/api/v1/interviews/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy thông tin trạng thái phiên hiện tại
   */
  async getSession(sessionId: string): Promise<SessionOut> {
    return request<SessionOut>(`/api/v1/interviews/sessions/${sessionId}`, {
      method: "GET",
    });
  },

  /**
   * Gửi câu trả lời của ứng viên cho lượt hiện tại (Text hoặc FormData nếu có Audio Blob)
   */
  async submitTurn(sessionId: string, payload: TurnSubmitIn): Promise<TurnOut> {
    if (payload.audio_blob) {
      const formData = new FormData();
      formData.append("answer_text", payload.answer_text);
      formData.append("duration_seconds", String(payload.duration_seconds));
      formData.append("audio_file", payload.audio_blob, "answer.webm");

      const token = getStoredToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/interviews/sessions/${sessionId}/turns`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Nộp câu trả lời thất bại (HTTP ${res.status})`);
      }
      return res.json();
    }

    return request<TurnOut>(`/api/v1/interviews/sessions/${sessionId}/turns`, {
      method: "POST",
      body: JSON.stringify({
        answer_text: payload.answer_text,
        duration_seconds: payload.duration_seconds,
      }),
    });
  },

  /**
   * Lấy kết quả chấm điểm Rubric cho 1 turn cụ thể
   */
  async getTurnEvaluation(sessionId: string, turnId: string): Promise<RubricEvaluationOut> {
    return request<RubricEvaluationOut>(
      `/api/v1/interviews/sessions/${sessionId}/turns/${turnId}/evaluation`,
      { method: "GET" }
    );
  },

  /**
   * Hoàn thành phiên và lấy bảng điểm tổng kết toàn phiên
   */
  async getSessionResult(sessionId: string): Promise<SessionResultOut> {
    return request<SessionResultOut>(
      `/api/v1/interviews/sessions/${sessionId}/result`,
      { method: "GET" }
    );
  },

  /**
   * Lấy URL SSE endpoint kèm query token phục vụ EventSource
   */
  getStreamUrl(sessionId: string): string {
    const token = getStoredToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${API_BASE_URL}/api/v1/interviews/sessions/${sessionId}/stream${tokenQuery}`;
  },
};