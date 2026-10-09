export interface JobCompany {
  company_id: number;
  company_name: string;
  slug: string;
  logo_url?: string | null;
  company_logo_url?: string | null;
  company_banner_url?: string | null;
  branding_source_url?: string | null;
  branding_license_url?: string | null;
  branding_reuse_allowed?: boolean;
  location?: string | null;
}

export interface JobItem {
  job_id: string;
  source_id?: string | null;
  title: string;
  slug: string;
  seniority: string;
  employment_type: string;
  workplace_type: string;
  location?: string | null;
  salary_display: string;
  salary_currency?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  skills_required: string[];
  thumbnail_url?: string | null;
  technologies: string[];
  via_source?: string | null;
  original_apply_url: string;
  posted_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  first_seen_at?: string | null;
  last_synced_at?: string | null;
  expires_at?: string | null;
  country_codes?: string[];
  is_global_remote?: boolean;
  company?: JobCompany | null;
}

export interface JobDetail extends JobItem {
  raw_description: string;
  cleaned_jd_text: string;
  created_at: string;
}

export interface JobListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: JobItem[];
}

export interface JobFilterMetadata {
  seniorities: string[];
  workplace_types: string[];
  top_technologies: string[];
  locations?: string[];
  countries?: { id: string; name: string }[];
  sources?: { id: string; name: string }[];
  sort_options?: { id: string; name: string }[];
}

export interface JobSkillMatch {
  job_id: string;
  match_score_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
  has_candidate_skills?: boolean;
}

export interface JobReadinessRequirement {
  skill_id: string;
  name: string;
  importance: "must" | "nice";
  required_level: string;
  user_level: string;
  status: "met" | "partial" | "gap" | "unknown";
  confidence: number;
  level_assumed: boolean;
}

export interface JobReadinessAssessment {
  job_id: string;
  match_percent: number;
  verdict: "ready" | "almost" | "not_ready" | "insufficient_data";
  data_coverage: number;
  requirements: JobReadinessRequirement[];
  explanation: string;
  recommended_skills: string[];
  analysis_engine?: "jev" | "heuristic";
}

export interface StartPracticeResponse {
  interview_id: string;
  job_id: string;
  redirect_url: string;
}

export interface JobFilterParams {
  keyword?: string;
  domain_id?: number;
  seniority?: string;
  workplace_type?: string;
  technology?: string;
  location?: string;
  source_id?: string;
  country_code?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}
