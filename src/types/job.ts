export interface JobCompany {
  company_id: number;
  company_name: string;
  slug: string;
  logo_url?: string | null;
  location?: string | null;
}

export interface JobItem {
  job_id: string;
  title: string;
  slug: string;
  seniority: string;
  employment_type: string;
  workplace_type: string;
  location?: string | null;
  salary_display: string;
  salary_min?: number | null;
  salary_max?: number | null;
  skills_required: string[];
  technologies: string[];
  via_source?: string | null;
  original_apply_url: string;
  posted_at?: string | null;
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
}

export interface JobSkillMatch {
  job_id: string;
  match_score_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
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
  page?: number;
  limit?: number;
}
