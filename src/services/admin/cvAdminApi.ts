import { request } from "@/services/apiClient";

export interface CvDocumentAdmin {
  id: number;
  user_id: number;
  user_name?: string | null;
  user_email?: string | null;
  title: string;
  template_id: string;
  color_theme: string;
  font_family: string;
  ats_score?: number | null;
  skills_count: number;
  experiences_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface CvDocumentDetailAdmin extends CvDocumentAdmin {
  personal_info: Record<string, any>;
  summary?: string | null;
  work_experiences: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;
  skills: string[];
  educations: Array<Record<string, any>>;
  certifications: Array<Record<string, any>>;
}

export interface CvDocumentPage {
  items: CvDocumentAdmin[];
  total: number;
  limit: number;
  offset: number;
}

export interface AtsRulesConfig {
  keyword_weight: number;
  metrics_weight: number;
  base_score: number;
  min_passing_score: number;
  required_sections: string[];
  standard_action_verbs: string[];
  pro_cv_limit: number;
  free_cv_limit: number;
}

export const cvAdminApi = {
  getCvs: (params?: {
    search?: string;
    template_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.template_id && params.template_id !== "all") sp.set("template_id", params.template_id);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return request<CvDocumentPage>(`/api/v1/admin/cvs${qs}`);
  },

  getCvDetail: (cvId: number) =>
    request<CvDocumentDetailAdmin>(`/api/v1/admin/cvs/${cvId}`),

  getAtsRules: () =>
    request<AtsRulesConfig>("/api/v1/admin/ats-rules"),

  updateAtsRules: (data: AtsRulesConfig) =>
    request<AtsRulesConfig>("/api/v1/admin/ats-rules", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

