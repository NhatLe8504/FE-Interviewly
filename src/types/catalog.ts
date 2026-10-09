import type { DeliveryMetrics } from "@/types/delivery";

export type ExperienceLevel =
  | "intern"
  | "fresher"
  | "junior"
  | "mid"
  | "middle"
  | "senior"
  | "lead";


export type QuestionCategory = "technical" | "soft_skills" | "introduction";

export interface QuizOption {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface QuizData {
  options: QuizOption[];
  explanation: string;
}

export interface MultiModalScoreBreakdown {
  quiz_score: number;      // max 15
  quiz_max: number;        // 15
  text_score: number;      // max 35
  text_max: number;        // 35
  voice_score: number;     // max 50
  voice_max: number;       // 50
  total_score: number;     // max 100
}

export interface MultiModalQuestionAnswer {
  quiz_option_id?: string | null;
  is_quiz_correct?: boolean | null;
  text_answer?: string;
  text_word_count?: number;
  voice_audio_url?: string | null;
  voice_duration_seconds?: number;
  submitted_at?: string;
}

export interface AIEvaluationResult {
  score: number; // 0 - 100
  passed: boolean;
  general_feedback: string;
  star_breakdown?: {
    situation_score: number;
    situation_feedback: string;
    task_score: number;
    task_feedback: string;
    action_score: number;
    action_feedback: string;
    result_score: number;
    result_feedback: string;
  };
  rubric_scores?: {
    criterion_id: string;
    criterion_name: string;
    score: number;
    max_score: number;
    level_label: string;
    feedback: string;
  }[];
  strengths?: string[];
  improvements?: string[];
  feedback?: string;
  text_feedback?: string;
  text_strengths?: string[];
  text_improvements?: string[];
  voice_feedback?: string;
  voice_strengths?: string[];
  voice_improvements?: string[];
  transcript?: string;
  delivery_metrics?: DeliveryMetrics | null;
  sample_better_answer?: string;
  modal_breakdown?: MultiModalScoreBreakdown;
  /** ID bản đánh giá do server lưu cho câu trả lời này (nếu đã đăng nhập). */
  evaluation_id?: number;
  /** Danh sách ID các phần đánh giá server đã lưu (nội dung và/hoặc giọng nói). */
  evaluation_ids?: number[];
}

export type QuestionType = "behavioral" | "technical" | "situational";

export type LanguageCode = "vi" | "en";

export interface DomainOut {
  domain_id: number;
  domain_name: string;
  description: string | null;
  is_active?: boolean;
  created_at?: string | null;
}

export interface RoleOut {
  role_id: number;
  domain_id: number;
  role_name: string;
  description: string | null;
  is_active?: boolean;
  created_at?: string | null;
}

export type CatalogStatusFilter = "active" | "archived" | "all";

export interface DomainAdminSummary extends DomainOut {
  is_active: boolean;
  role_count: number;
  active_role_count: number;
  question_count: number;
}

export interface DomainAdminSummaryPage {
  items: DomainAdminSummary[];
  total: number;
  active_domains: number;
  archived_domains: number;
  active_roles: number;
  total_questions: number;
}

export interface RoleAdminSummary extends RoleOut {
  is_active: boolean;
  question_count: number;
}

export interface DomainAdminDetail {
  domain: DomainAdminSummary;
  roles: RoleAdminSummary[];
}

export interface StarTemplateOut {
  star_template_id: number;
  title: string;
  situation_guide: string | null;
  task_guide: string | null;
  action_guide: string | null;
  result_guide: string | null;
  language: string;
  created_at?: string | null;
}

export interface RubricLevelDescriptor {
  score_range: string;
  label: string;
  description: string;
}

export interface RubricCriterion {
  criterion_id: string;
  title: string;
  description: string;
  weight: number;
  descriptors: {
    poor: RubricLevelDescriptor;
    average: RubricLevelDescriptor;
    good: RubricLevelDescriptor;
    excellent: RubricLevelDescriptor;
  };
}

export type QuestionModerationStatus = "pending" | "approved" | "rejected";
export type QuestionSource = "admin_manual" | "admin_ai" | "user_ai" | "user_manual";

export interface QuestionOut {
  question_id: number;
  domain_id: number;
  domain_name?: string;
  role_id: number | null;
  role_name?: string;
  experience_level: string | null;
  language: string;
  question_type: QuestionType | string;
  question_text: string;
  star_template_id: number | null;
  is_active: boolean;
  category?: QuestionCategory | string;
  moderation_status?: QuestionModerationStatus;
  moderated_by?: number | null;
  moderated_at?: string | null;
  moderation_reason?: string | null;
  source?: QuestionSource;
  practice_id?: number | null;
  intent?: string | null;
  difficulty?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  /** Nhãn kỹ năng chuẩn hóa theo taxonomy, phục vụ skill tracking. */
  skill_ids?: string[];
}

export interface QuestionDetailOut extends QuestionOut {
  star_template: StarTemplateOut | null;
  sample_answer?: string | null;
  rubric_criteria?: RubricCriterion[];
  follow_up_questions?: string[];
  tips?: string[];
  quiz_data?: QuizData | null;
}

export interface QuestionPageOut {
  items: QuestionOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface SkillOptionOut {
  id: string;
  name: string;
  category: string;
  role_tracks: string[];
}

export interface SkillSuggestionOut {
  suggested_skill_ids: string[];
  reason?: string | null;
}

export interface QuestionFilterParams {
  category?: string | null;
  domain_id?: number | null;
  role_id?: number | null;
  level?: string | null;
  type?: string | null;
  language?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

// ==========================================
// QUESTION SET (BỘ CÂU HỎI PHỎNG VẤN)
// ==========================================

export interface QuestionSetOut {
  set_id: number;
  title: string;
  description: string;
  domain_id: number;
  domain_name: string | null;
  role_id: number | null;
  role_name: string | null;
  experience_level: string;
  tech_stack: string[];
  language: string;
  target_difficulty: number;
  estimated_duration_minutes: number;
  is_curated: boolean;
  is_active: boolean;
  question_count: number;
  practice_count: number;
  avg_score: number;
  pass_rate: number;
  created_at?: string | null;
}

export interface QuestionSetDetailOut extends QuestionSetOut {
  questions: QuestionDetailOut[];
}

export interface QuestionSetItem extends QuestionSetOut {
  moderation_status?: QuestionModerationStatus | "draft";
  source?: QuestionSource | "imported_doc" | "imported_url";
  source_metadata?: {
    url?: string | null;
    doc_name?: string | null;
    extracted_keywords?: string[];
  };
  questions?: QuestionDetailOut[];
  updated_at?: string | null;
}

export interface QuestionSetPageOut {
  items: QuestionSetItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface QuestionSetFilterParams {
  domain_id?: number | null;
  role_id?: number | null;
  level?: string | null;
  tech?: string | null;
  language?: string | null;
  difficulty?: number | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}


export interface PracticeHistoryQuestionSummary {
  question_id: number;
  question_text: string;
  score: number;
  passed: boolean;
  quiz_score?: number;
  text_score?: number;
  voice_score?: number;
  evaluation_ids?: number[];
}

export interface PracticeHistoryItem {
  history_id: number | string;
  user_id?: number | null;
  session_title: string;
  source_type: "set" | "basket" | "single" | string;
  source_id?: string | null;
  domain_id?: number | null;
  domain_name?: string | null;
  role_name?: string | null;
  total_questions: number;
  evaluated_count: number;
  average_score: number;
  quiz_score_avg?: number | null;
  text_score_avg?: number | null;
  voice_score_avg?: number | null;
  duration_seconds: number;
  questions_summary: PracticeHistoryQuestionSummary[];
  created_at?: string | null;
}

export interface LeaderboardItem {
  rank: number;
  user_id: number | string;
  user_name: string;
  avatar_url?: string | null;
  is_pro: boolean;
  score: number;
  duration_seconds: number;
  completed_at?: string | null;
}

export interface QuestionSetReviewItem {
  review_id: number | string;
  set_id: number | string;
  user_id?: number | null;
  user_name: string;
  avatar_url?: string | null;
  is_pro: boolean;
  rating: number;
  comment: string;
  created_at?: string | null;
}

export interface QuestionSetReviewsPage {
  set_id: number | string;
  average_rating: number;
  total_reviews: number;
  reviews: QuestionSetReviewItem[];
}
