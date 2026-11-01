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
  icon?: string;
}

export interface CatalogRole {
  id: number;
  domain_id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface SubscriptionQuota {
  plan: "free" | "pro" | string;
  used_interviews?: number;
  limit_interviews?: number;
  is_active: boolean;
  remaining?: number;
  can_start?: boolean;
  voice_minutes?: {
    total: number;
    used: number;
    remaining: number;
    allowed: boolean;
  };
  cv_generations?: {
    total: number;
    used: number;
    remaining: number;
    allowed: boolean;
  };
  reset_date?: string | null;
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
  intent?: string;
  context?: string;
  interviewer_audio_url?: string;
  followup_level?: number;
  star_phase?: string;
  is_completion?: boolean;
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

export interface AnswerResponse {
  turn_id: number | string;
  ai_feedback?: string;
  next_question?: string;
  is_completion?: boolean;
  rubric_evaluation?: {
    relevance_score?: number;
    clarity_score?: number;
    depth_score?: number;
    total_score?: number;
    actionable_tip?: string;
  };
}

export interface EvaluationResult {
  session_id: number | string;
  total_score: number;
  overall_feedback: string;
  radar_chart?: Record<string, number>;
  detailed_feedback?: Array<{
    turn_number: number;
    question: string;
    answer: string;
    score: number;
    tip: string;
  }>;
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
