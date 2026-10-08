import { request } from "./apiClient";
import {
  JobDetail,
  JobFilterMetadata,
  JobFilterParams,
  JobListResponse,
  JobSkillMatch,
  StartPracticeResponse,
} from "@/types/job";

export const jobsApi = {
  getJobs: async (params?: JobFilterParams): Promise<JobListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.keyword) searchParams.set("keyword", params.keyword);
    if (params?.domain_id) searchParams.set("domain_id", String(params.domain_id));
    if (params?.seniority) searchParams.set("seniority", params.seniority);
    if (params?.workplace_type) searchParams.set("workplace_type", params.workplace_type);
    if (params?.technology) searchParams.set("technology", params.technology);
    if (params?.location) searchParams.set("location", params.location);
    if (params?.source_id) searchParams.set("source_id", params.source_id);
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/jobs?${queryString}` : "/api/v1/jobs";
    return request<JobListResponse>(endpoint);
  },

  getJobDetail: async (jobId: string): Promise<JobDetail> => {
    return request<JobDetail>(`/api/v1/jobs/${jobId}`);
  },

  getFilterMetadata: async (): Promise<JobFilterMetadata> => {
    return request<JobFilterMetadata>("/api/v1/jobs/metadata/filters");
  },

  getSkillMatch: async (jobId: string): Promise<JobSkillMatch> => {
    return request<JobSkillMatch>(`/api/v1/jobs/${jobId}/skill-match`);
  },

  startPractice: async (jobId: string): Promise<StartPracticeResponse> => {
    return request<StartPracticeResponse>(`/api/v1/jobs/${jobId}/start-practice`, {
      method: "POST",
    });
  },

  syncJobs: async (query?: string): Promise<{ status: string; synced_jobs: number }> => {
    const endpoint = query ? `/api/v1/jobs/sync?query=${encodeURIComponent(query)}` : "/api/v1/jobs/sync";
    return request<{ status: string; synced_jobs: number }>(endpoint, {
      method: "POST",
    });
  },
};
