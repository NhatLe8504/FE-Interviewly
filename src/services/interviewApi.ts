import { store } from "@/redux/store";
import { interviewApiSlice } from "@/redux/api/interviewApi";
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

export const interviewApi = {
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
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/interviewApi";
