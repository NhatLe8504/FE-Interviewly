import { request, getStoredToken } from "./apiClient";
import {
  StartSessionIn,
  SessionOut,
  TurnSubmitIn,
  TurnOut,
  RubricEvaluationOut,
  SessionResultOut,
} from "@/types/interview";
import { MOCK_DOMAINS, MOCK_ROLES } from "@/mock/practice";

export interface CatalogDomain {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface CatalogRole {
  id: number;
  domain_id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface SubscriptionQuota {
  plan: "free" | "pro";
  used_interviews: number;
  limit_interviews: number;
  is_active: boolean;
  remaining: number;
  can_start: boolean;
}

export interface StartSessionPayload {
  domain_id: number;
  role_id: number;
  role_name?: string;
  level: string;
  language: string;
  mode: "text" | "voice";
}

export interface TurnResponse {
  turn_id: number | string;
  session_id: number | string;
  turn_number: number;
  question_text: string;
  answer_text?: string;
  speaker?: string;
  duration_seconds?: number | null;
  star_tip?: string;
}

export interface SessionResponse {
  session_id: number | string;
  user_id?: number;
  level: string;
  language: string;
  mode: "text" | "voice";
  status: "in_progress" | "completed" | "abandoned";
  total_score?: number | null;
  current_turn?: TurnResponse | null;
  domain_id?: number;
  role_id?: number;
  role_name?: string;
  domain_name?: string;
}

export interface SubmitTurnPayload {
  answer_text: string;
  duration_seconds: number;
  pause_duration_seconds?: number;
  audio_url?: string;
  audio_blob?: Blob;
}

export interface SubmitTurnResponse {
  turn_id: number | string;
  session_id: number | string;
  turn_number: number;
  answer_text: string;
  next_turn?: TurnResponse | null;
  is_completed: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const interviewApi = {
  /**
   * Fetch active domains from catalog with fallback to mock data
   */
  async getDomains(): Promise<CatalogDomain[]> {
    try {
      const domains = await request<any[]>("/api/v1/catalog/domains", {
        method: "GET",
      });
      if (Array.isArray(domains) && domains.length > 0) {
        return domains.map((d, index) => ({
          id: d.id ?? d.domain_id ?? index + 1,
          name: d.name || d.label || `Domain ${index + 1}`,
          code: d.code || "",
          description: d.description || "",
        }));
      }
    } catch {
      // Fallback
    }

    return MOCK_DOMAINS.map((d, idx) => ({
      id: idx + 1,
      name: d.label,
      code: d.id,
      description: d.label,
    }));
  },

  /**
   * Fetch roles for a specific domain with fallback to mock data
   */
  async getRoles(domainId?: number | string): Promise<CatalogRole[]> {
    try {
      const endpoint = domainId
        ? `/api/v1/catalog/roles?domain_id=${domainId}`
        : "/api/v1/catalog/roles";
      const roles = await request<any[]>(endpoint, {
        method: "GET",
      });
      if (Array.isArray(roles) && roles.length > 0) {
        return roles.map((r, index) => ({
          id: r.id ?? r.role_id ?? index + 1,
          domain_id: Number(r.domain_id || domainId || 1),
          name: r.name || r.label || `Role ${index + 1}`,
          code: r.code || "",
          description: r.description || "",
        }));
      }
    } catch {
      // Fallback
    }

    const domainObj = MOCK_DOMAINS[typeof domainId === "number" ? domainId - 1 : 0] || MOCK_DOMAINS[0];
    const filtered = MOCK_ROLES.filter((r) => r.domainId === domainObj.id);
    return (filtered.length > 0 ? filtered : MOCK_ROLES).map((r, idx) => ({
      id: idx + 1,
      domain_id: typeof domainId === "number" ? domainId : 1,
      name: r.label,
      code: r.id,
      description: r.label,
    }));
  },

  /**
   * Check current user quota
   */
  async checkSubscriptionQuota(): Promise<SubscriptionQuota> {
    try {
      const sub = await request<any>("/api/v1/subscriptions/me", {
        method: "GET",
      });
      if (sub && typeof sub === "object") {
        const plan = sub.plan || "free";
        const used = sub.used_interviews ?? 0;
        const limit = sub.limit_interviews ?? (plan === "pro" ? 9999 : 3);
        const remaining = Math.max(0, limit - used);
        return {
          plan,
          used_interviews: used,
          limit_interviews: limit,
          is_active: sub.status === "active",
          remaining,
          can_start: remaining > 0 || plan === "pro",
        };
      }
    } catch {
      // Fallback
    }

    return {
      plan: "free",
      used_interviews: 1,
      limit_interviews: 3,
      is_active: true,
      remaining: 2,
      can_start: true,
    };
  },

  /**
   * Khởi tạo phiên phỏng vấn mới với AI
   */
  async startSession(payload: StartSessionIn | StartSessionPayload): Promise<SessionOut | SessionResponse> {
    try {
      return await request<SessionOut>("/api/v1/interviews/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback local simulation session
      const sid = `sess-${Date.now().toString(36)}`;
      return {
        session_id: sid,
        user_id: 1,
        domain_id: payload.domain_id,
        role_id: payload.role_id,
        level: payload.level,
        language: payload.language,
        mode: (payload as any).mode || "text",
        status: "in_progress",
        current_turn: 1 as any,
        max_turns: 5,
        created_at: new Date().toISOString(),
      };
    }
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
   * Gửi câu trả lời của ứng viên cho lượt hiện tại
   */
  async submitTurn(
    sessionId: string,
    payload: TurnSubmitIn | SubmitTurnPayload,
    turnNumber: number = 1
  ): Promise<any> {
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

    try {
      return await request<TurnOut>(`/api/v1/interviews/sessions/${sessionId}/turns`, {
        method: "POST",
        body: JSON.stringify({
          answer_text: payload.answer_text,
          duration_seconds: payload.duration_seconds,
        }),
      });
    } catch {
      // Fallback
      const isLast = turnNumber >= 4;
      return {
        turn_id: `t-${turnNumber + 1}-${Date.now()}`,
        session_id: sessionId,
        turn_number: turnNumber,
        answer_text: payload.answer_text,
        is_completed: isLast,
        next_turn: isLast
          ? null
          : {
              turn_id: `t-${turnNumber + 1}-${Date.now()}`,
              session_id: sessionId,
              turn_number: turnNumber + 1,
              question_text: "Bạn có thể chia sẻ cụ thể hơn về bài học rút ra từ dự án này?",
              speaker: "ai",
              star_tip: "Tập trung vào Action và Result.",
            },
      };
    }
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
  getStreamUrl(sessionId: string | number): string {
    const token = getStoredToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${API_BASE_URL}/api/v1/interviews/sessions/${sessionId}/stream${tokenQuery}`;
  },

  /**
   * Get SSE streaming URL for an interview session (alias)
   */
  getSessionStreamUrl(sessionId: number | string): string {
    return this.getStreamUrl(sessionId);
  },
};