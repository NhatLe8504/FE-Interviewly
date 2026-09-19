export type ExperienceLevel =
  | "intern"
  | "fresher"
  | "junior"
  | "mid"
  | "middle"
  | "senior"
  | "lead";

export type QuestionType = "behavioral" | "technical" | "situational";

export type LanguageCode = "vi" | "en";

export interface DomainOut {
  domain_id: number;
  domain_name: string;
  description: string | null;
  created_at?: string | null;
}

export interface RoleOut {
  role_id: number;
  domain_id: number;
  role_name: string;
  description: string | null;
  created_at?: string | null;
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
}

export interface QuestionDetailOut extends QuestionOut {
  star_template: StarTemplateOut | null;
  sample_answer?: string | null;
  rubric_criteria?: RubricCriterion[];
  follow_up_questions?: string[];
  tips?: string[];
}

export interface QuestionPageOut {
  items: QuestionOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface QuestionFilterParams {
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

export interface QuestionSetItem {
  set_id: number;
  title: string;
  description: string;
  domain_id: number;
  domain_name: string;
  role_id: number;
  role_name: string;
  experience_level: string;
  tech_stack: string[];
  language: string;
  target_difficulty: number;
  estimated_duration_minutes: number;
  is_curated: boolean;
  is_active: boolean;
  moderation_status: QuestionModerationStatus | "draft";
  source: QuestionSource | "imported_doc" | "imported_url";
  source_metadata?: {
    url?: string | null;
    doc_name?: string | null;
    extracted_keywords?: string[];
  };
  questions: QuestionDetailOut[];
  question_count: number;
  practice_count: number;
  avg_score: number;
  pass_rate: number;
  created_at?: string | null;
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
