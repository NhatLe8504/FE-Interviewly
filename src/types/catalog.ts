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
