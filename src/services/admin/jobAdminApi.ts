import { request } from "@/services/apiClient";

export interface JobSourceAdmin {
  source_id: string;
  source_name: string;
  source_type: string;
  base_url: string;
  is_active: boolean;
  crawl_interval_m: number;
  last_synced_at?: string | null;
  created_at: string;
  postings_count: number;
}

export interface JobPostingAdmin {
  job_id: string;
  source_id: string;
  source_name?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  title: string;
  location?: string | null;
  salary_text?: string | null;
  url: string;
  is_active: boolean;
  created_at: string;
}

export interface JobPostingPage {
  items: JobPostingAdmin[];
  total: number;
  limit: number;
  offset: number;
}

export const jobAdminApi = {
  getJobs: (params?: {
    search?: string;
    source_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.source_id && params.source_id !== "all") sp.set("source_id", params.source_id);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return request<JobPostingPage>(`/api/v1/admin/jobs${qs}`);
  },

  getSources: () => request<JobSourceAdmin[]>("/api/v1/admin/jobs/sources"),

  toggleSource: (sourceId: string) =>
    request<JobSourceAdmin>(`/api/v1/admin/jobs/sources/${sourceId}/toggle`, {
      method: "PATCH",
    }),

  triggerCrawler: (sourceId?: string) => {
    const qs = sourceId ? `?source_id=${encodeURIComponent(sourceId)}` : "";
    return request<{ success: boolean; message: string; sources_count: number }>(
      `/api/v1/admin/jobs/crawler/trigger${qs}`,
      {
        method: "POST",
      },
    );
  },
};
