import { store } from "@/redux/store";
import { interviewApiSlice } from "@/redux/api/interviewApi";
import { getStoredToken } from "./apiClient";
import type {
  StartSessionIn,
  SessionOut,
  TurnSubmitIn,
  TurnOut,
  RubricEvaluationOut,
  SessionResultOut,
} from "@/types/interview";

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
  barge_in_enabled?: boolean;
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
  mode?: "text" | "voice";
  barge_in_enabled?: boolean;
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
   * Fetch active domains from catalog via RTK Query
   */
  async getDomains(): Promise<CatalogDomain[]> {
    return store
      .dispatch(interviewApiSlice.endpoints.getDomains.initiate())
      .unwrap();
  },

  /**
   * Fetch roles for a specific domain via RTK Query
   */
  async getRoles(domainId?: number | string): Promise<CatalogRole[]> {
    return store
      .dispatch(interviewApiSlice.endpoints.getRoles.initiate(domainId))
      .unwrap();
  },

  /**
   * Check current user quota via RTK Query
   */
  async checkSubscriptionQuota(): Promise<SubscriptionQuota> {
    return store
      .dispatch(interviewApiSlice.endpoints.checkSubscriptionQuota.initiate())
      .unwrap();
  },

  /**
   * Khởi tạo phiên phỏng vấn mới với AI via RTK Query
   */
  async startSession(
    payload: StartSessionIn | StartSessionPayload
  ): Promise<SessionOut | SessionResponse> {
    return store
      .dispatch(interviewApiSlice.endpoints.startSession.initiate(payload))
      .unwrap();
  },

  /**
   * Lấy thông tin trạng thái phiên hiện tại via RTK Query
   */
  async getSession(sessionId: string | number): Promise<SessionResponse & SessionOut> {
    return store
      .dispatch(interviewApiSlice.endpoints.getSession.initiate(sessionId))
      .unwrap();
  },

  /**
   * Gửi câu trả lời của ứng viên cho lượt hiện tại via RTK Query
   */
  async submitTurn(
    sessionId: string | number,
    param2: number | TurnSubmitIn | SubmitTurnPayload,
    param3?: TurnSubmitIn | SubmitTurnPayload
  ): Promise<TurnOut> {
    const turnNumber = typeof param2 === "number" ? param2 : 1;
    const data = ((typeof param2 === "object" ? param2 : param3) || {
      answer_text: "",
      duration_seconds: 0,
    }) as (TurnSubmitIn & SubmitTurnPayload);

    return store
      .dispatch(
        interviewApiSlice.endpoints.submitTurn.initiate({
          sessionId,
          turnNumber,
          data,
        })
      )
      .unwrap();
  },

  /**
   * Lấy kết quả chấm điểm Rubric cho 1 turn cụ thể via RTK Query
   */
  async getTurnEvaluation(
    sessionId: string | number,
    turnId: string
  ): Promise<RubricEvaluationOut> {
    return store
      .dispatch(
        interviewApiSlice.endpoints.getTurnEvaluation.initiate({
          sessionId,
          turnId,
        })
      )
      .unwrap();
  },

  /**
   * Hoàn thành phiên và lấy bảng điểm tổng kết toàn phiên via RTK Query
   */
  async getSessionResult(sessionId: string | number): Promise<SessionResultOut> {
    return store
      .dispatch(interviewApiSlice.endpoints.getSessionResult.initiate(sessionId))
      .unwrap();
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

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/interviewApi";
