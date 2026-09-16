import { request } from "@/services/apiClient";
import {
  MOCK_DOMAINS,
  MOCK_ROLES,
} from "@/mock/practice";

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
      // Fallback to mock domains when backend catalog is not yet seeded
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

    // Map mock roles
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
          is_active: sub.is_active ?? true,
          remaining,
          can_start: plan === "pro" || remaining > 0,
        };
      }
    } catch {
      // Default to allowed fallback for client-side demo
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
   * Initialize a new interview session
   */
  async startSession(payload: StartSessionPayload): Promise<SessionResponse> {
    try {
      const session = await request<SessionResponse>("/api/v1/interviews/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return session;
    } catch {
      // Fallback graceful local session if backend interview service is unavailable
      const localId = `sess-${Date.now().toString(36)}`;
      return {
        session_id: localId,
        level: payload.level,
        language: payload.language,
        mode: payload.mode,
        status: "in_progress",
        role_name: payload.role_name || "Software Engineer",
        current_turn: {
          turn_id: `t1-${Date.now()}`,
          session_id: localId,
          turn_number: 1,
          question_text:
            payload.language === "vi"
              ? "Hãy giới thiệu về bản thân và một dự án tiêu biểu mà bạn tự hào nhất."
              : "Tell me about yourself and a notable project you are most proud of.",
          speaker: "ai",
          duration_seconds: 0,
          star_tip:
            "Nêu rõ bối cảnh dự án (Situation), mục tiêu của bạn (Task), các bước bạn đã giải quyết (Action) và kết quả định lượng đạt được (Result).",
        },
      };
    }
  },

  /**
   * Get session details
   */
  async getSession(sessionId: number | string): Promise<SessionResponse | null> {
    try {
      return await request<SessionResponse>(`/api/v1/interviews/sessions/${sessionId}`, {
        method: "GET",
      });
    } catch {
      return null;
    }
  },

  /**
   * Submit an answer turn
   */
  async submitTurn(
    sessionId: number | string,
    turnNumber: number,
    payload: SubmitTurnPayload
  ): Promise<SubmitTurnResponse> {
    try {
      const response = await request<SubmitTurnResponse>(
        `/api/v1/interviews/sessions/${sessionId}/turns?turn_number=${turnNumber}`,
        {
          method: "POST",
          body: JSON.stringify({
            answer_text: payload.answer_text,
            duration_seconds: payload.duration_seconds,
            pause_duration_seconds: payload.pause_duration_seconds || 0,
            audio_url: payload.audio_url || null,
          }),
        }
      );
      return response;
    } catch {
      // Fallback for simulation
      const isLast = turnNumber >= 4;
      const followUpQuestionsVi = [
        "Trong thử thách lớn nhất của dự án đó, bạn đã giải quyết sự cố kỹ thuật bất ngờ như thế nào?",
        "Nếu được làm lại từ đầu với công nghệ hoặc kiến trúc khác, bạn sẽ cải tiến điều gì?",
        "Bạn đã phối hợp với các thành viên khác hoặc giải quyết bất đồng quan điểm ra sao?",
      ];
      const followUpQuestionsEn = [
        "What was the most difficult technical bottleneck you encountered and how did you resolve it?",
        "If you could redesign the system architecture today, what would you do differently?",
        "How did you collaborate with your teammates and align on conflicting engineering priorities?",
      ];

      const questionList = followUpQuestionsVi;
      const nextQuestion = questionList[(turnNumber - 1) % questionList.length];

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
              question_text: nextQuestion,
              speaker: "ai",
              star_tip:
                "Tập trung nhấn mạnh hành động trực tiếp của bạn và số liệu định lượng (Action & Result).",
            },
      };
    }
  },

  /**
   * Get SSE streaming URL for an interview session
   */
  getSessionStreamUrl(sessionId: number | string): string {
    return `${API_BASE_URL}/api/v1/interviews/sessions/${sessionId}/stream`;
  },
};
