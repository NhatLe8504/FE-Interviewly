import { request } from "@/services/apiClient";

export interface StarTemplateAdmin {
  star_template_id: number;
  title: string;
  situation_guide?: string | null;
  task_guide?: string | null;
  action_guide?: string | null;
  result_guide?: string | null;
  language: "vi" | "en";
  created_at?: string | null;
}

export interface StarTemplateCreateIn {
  title: string;
  situation_guide?: string | null;
  task_guide?: string | null;
  action_guide?: string | null;
  result_guide?: string | null;
  language: string;
}

export interface StarTemplateUpdateIn {
  title?: string;
  situation_guide?: string | null;
  task_guide?: string | null;
  action_guide?: string | null;
  result_guide?: string | null;
  language?: string;
}

export const starTemplateAdminApi = {
  getStarTemplates: (language?: string) => {
    const qs = language ? `?language=${encodeURIComponent(language)}` : "";
    return request<StarTemplateAdmin[]>(`/api/v1/admin/star-templates${qs}`);
  },

  createStarTemplate: (data: StarTemplateCreateIn) =>
    request<StarTemplateAdmin>("/api/v1/admin/star-templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStarTemplate: (templateId: number, data: StarTemplateUpdateIn) =>
    request<StarTemplateAdmin>(`/api/v1/admin/star-templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteStarTemplate: (templateId: number) =>
    request<void>(`/api/v1/admin/star-templates/${templateId}`, {
      method: "DELETE",
    }),
};
