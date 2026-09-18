export type InterviewLevel = "intern" | "fresher" | "junior" | "middle" | "senior" | "lead";

export type InterviewLanguage = "vi" | "en";

export type InterviewMode = "text" | "voice";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export type QuestionSourceMode = "auto_random" | "manual" | "mixed";

export interface StageConfigIn {
  stage_key: string;
  source_mode: QuestionSourceMode;
  min_turns: number;
  max_turns: number;
  selected_question_ids?: number[];
  difficulty_filter?: number;
}

export interface QuestionIntentContext {
  question_id: number;
  intent: string;
  stage_key: string;
  difficulty?: number;
  topic_label?: string;
}

export interface StartSessionIn {
  domain_id?: number | null;
  role_id?: number | null;
  role_name?: string;
  level: InterviewLevel | string;
  language: InterviewLanguage | string;
  mode?: InterviewMode;
  barge_in_enabled?: boolean;
  stage_configs?: StageConfigIn[];
  selected_question_ids?: number[];
  practice_id?: number;
}

export interface SessionOut {
  session_id: string;
  user_id: number;
  domain_id: number;
  role_id: number;
  level: string;
  language: string;
  barge_in_enabled?: boolean;
  status: SessionStatus;
  current_turn: number;
  max_turns: number;
  created_at: string;
  updated_at?: string;
}

export interface TurnSubmitIn {
  answer_text: string;
  duration_seconds: number;
  audio_blob?: Blob;
  audio_url?: string;
}

export interface TurnOut {
  turn_id: string;
  session_id: string;
  turn_number: number;
  question_text: string;
  answer_text: string | null;
  duration_seconds: number | null;
  status: "pending" | "answered" | "evaluated";
  is_followup: boolean;
  created_at: string;
}

export interface StarAnalysis {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
}

export interface SpeechQualityMetrics {
  effective_wpm: number;
  total_words: number;
  pause_duration_seconds: number;
  filler_count: number;
  filler_words: string[];
  speech_pace_status: "slow" | "optimal" | "fast";
}

export interface RubricEvaluationOut {
  turn_id: string;
  turn_number?: number;
  question_text?: string;
  answer_text?: string;
  clarity_score: number;
  structure_score: number;
  evidence_score: number;
  star_analysis: StarAnalysis;
  feedback: string;
  sample_better_answer: string;
  speech_metrics?: SpeechQualityMetrics;
}

export interface SessionResultOut {
  session_id: string;
  overall_score: number;
  clarity_score: number;
  structure_score: number;
  evidence_score: number;
  star_mastery_percent: number;
  turns_evaluated: number;
  summary_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  turn_evaluations: RubricEvaluationOut[];
  speech_summary?: {
    avg_wpm: number;
    total_filler_words: number;
    total_speaking_time_seconds: number;
  };
}

export interface SSETokenPayload {
  token: string;
}

export interface SSEQuestionDonePayload {
  turn_id: string;
  turn_number: number;
  question_text: string;
  is_last_question: boolean;
}
