export type CvTemplateId =
  | "modern_tech"
  | "minimalist_ats"
  | "executive_leader"
  | "creative_product"
  | "compact_swiss";

export type CvColorTheme = "navy" | "emerald" | "crimson" | "indigo" | "amber" | "slate";

export type CvFontFamily = "inter" | "roboto" | "merriweather" | "playfair" | "fira_code";

export interface CvPersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  avatar_url: string;
}

export interface CvWorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  highlights: string[];
}

export interface CvProject {
  id: string;
  name: string;
  role: string;
  start_date: string;
  end_date: string;
  technologies: string[];
  link: string;
  description: string;
  highlights: string[];
}

export interface CvEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
  honors: string;
}

export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date: string;
  credential_id: string;
  url: string;
}

export interface CvDocument {
  id: number;
  user_id: number;
  target_job_id?: string | null;
  target_job_title?: string | null;
  target_company_name?: string | null;
  template_id: CvTemplateId;
  title: string;
  color_theme: CvColorTheme;
  font_family: CvFontFamily;
  personal_info: CvPersonalInfo;
  summary: string;
  work_experiences: CvWorkExperience[];
  projects: CvProject[];
  skills: string[];
  educations: CvEducation[];
  certifications: CvCertification[];
  section_order: string[];
  ats_score?: number | null;
  ats_feedback?: CvAtsScoreResponse | null;
  created_at: string;
  updated_at: string;
}

export interface CvListItem {
  id: number;
  user_id: number;
  title: string;
  template_id: CvTemplateId;
  color_theme: CvColorTheme;
  target_job_id?: string | null;
  target_job_title?: string | null;
  target_company_name?: string | null;
  ats_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CvCreatePayload {
  title?: string;
  template_id?: CvTemplateId;
  color_theme?: CvColorTheme;
  font_family?: CvFontFamily;
  target_job_id?: string | null;
  target_jd_text?: string | null;
  load_from_user_skills?: boolean;
}

export interface CvUpdatePayload {
  title?: string;
  template_id?: CvTemplateId;
  color_theme?: CvColorTheme;
  font_family?: CvFontFamily;
  personal_info?: Partial<CvPersonalInfo>;
  summary?: string;
  work_experiences?: CvWorkExperience[];
  projects?: CvProject[];
  skills?: string[];
  educations?: CvEducation[];
  certifications?: CvCertification[];
  section_order?: string[];
  target_job_id?: string | null;
}

export type SelectionRefineAction =
  | "star_metrics"
  | "tailor_to_job"
  | "strong_verbs"
  | "shorten"
  | "custom";

export interface CvSelectionRefinePayload {
  selected_text: string;
  action: SelectionRefineAction;
  custom_instruction?: string;
  context_section?: string;
  target_job_id?: string | null;
  target_jd_text?: string | null;
}

export interface CvSelectionRefineResponse {
  original_text: string;
  refined_text: string;
  action: string;
  explanation: string;
}

export interface CvGenerateDraftPayload {
  target_job_id?: string | null;
  target_jd_text?: string | null;
  role_title?: string | null;
  experience_level?: string | null;
  user_provided_skills?: string[];
  use_system_skills?: boolean;
  current_cv_data?: Partial<CvDocument> | null;
}

export interface CvAtsScoreResponse {
  ats_score: number;
  match_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: string[];
  summary_verdict: string;
}

export interface UserSkillsSummaryResponse {
  user_id: number;
  full_name: string;
  email: string;
  target_domain?: string | null;
  experience_level?: string | null;
  skills: string[];
  skill_details: Array<{
    skill_id: string;
    level: string;
    ability_score: number;
    evidence_count: number;
  }>;
  evidences: string[];
}
