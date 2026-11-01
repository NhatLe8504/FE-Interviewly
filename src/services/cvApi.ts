import { request } from "./apiClient";
import {
  CvAtsScoreResponse,
  CvCreatePayload,
  CvDocument,
  CvGenerateDraftPayload,
  CvGenerationJob,
  CvGenerationNotification,
  CvTemplateId,
  CvColorTheme,
  CvListItem,
  CvSelectionRefinePayload,
  CvSelectionRefineResponse,
  CvUpdatePayload,
  UserSkillsSummaryResponse,
} from "@/types/cv";

export const cvApi = {
  startGeneration: async (targetJobId: string): Promise<CvGenerationJob> =>
    request<CvGenerationJob>("/api/v1/cvs/generation-jobs", {
      method: "POST",
      body: JSON.stringify({ target_job_id: targetJobId }),
    }),

  getGeneration: async (jobId: string): Promise<CvGenerationJob> =>
    request<CvGenerationJob>(`/api/v1/cvs/generation-jobs/${encodeURIComponent(jobId)}`),

  submitGenerationAnswers: async (
    jobId: string,
    answers: Record<string, string>,
    templateId: CvTemplateId,
    colorTheme: CvColorTheme
  ): Promise<CvGenerationJob> =>
    request<CvGenerationJob>(`/api/v1/cvs/generation-jobs/${encodeURIComponent(jobId)}/answers`, {
      method: "POST",
      body: JSON.stringify({ answers, template_id: templateId, color_theme: colorTheme }),
    }),

  retryGeneration: async (jobId: string): Promise<CvGenerationJob> =>
    request<CvGenerationJob>(`/api/v1/cvs/generation-jobs/${encodeURIComponent(jobId)}/retry`, { method: "POST" }),

  editGenerationAnswers: async (jobId: string): Promise<CvGenerationJob> =>
    request<CvGenerationJob>(`/api/v1/cvs/generation-jobs/${encodeURIComponent(jobId)}/edit-answers`, { method: "POST" }),

  getGenerationNotifications: async (): Promise<CvGenerationNotification[]> =>
    request<CvGenerationNotification[]>("/api/v1/cvs/generation-jobs/notifications"),

  acknowledgeGenerationNotification: async (jobId: string): Promise<void> => {
    await request<void>(`/api/v1/cvs/generation-jobs/${encodeURIComponent(jobId)}/notification-read`, { method: "POST" });
  },

  getUserSkillsSummary: async (): Promise<UserSkillsSummaryResponse> => {
    return request<UserSkillsSummaryResponse>("/api/v1/cvs/user-skills-summary");
  },

  listCvs: async (): Promise<CvListItem[]> => {
    return request<CvListItem[]>("/api/v1/cvs");
  },

  getCv: async (id: number): Promise<CvDocument> => {
    return request<CvDocument>(`/api/v1/cvs/${id}`);
  },

  createCv: async (payload: CvCreatePayload): Promise<CvDocument> => {
    return request<CvDocument>("/api/v1/cvs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCv: async (id: number, payload: CvUpdatePayload): Promise<CvDocument> => {
    return request<CvDocument>(`/api/v1/cvs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteCv: async (id: number): Promise<void> => {
    await request<void>(`/api/v1/cvs/${id}`, {
      method: "DELETE",
    });
  },

  generateDraft: async (payload: CvGenerateDraftPayload): Promise<Partial<CvDocument>> => {
    return request<Partial<CvDocument>>("/api/v1/cvs/generate-draft", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  refineSelection: async (
    payload: CvSelectionRefinePayload
  ): Promise<CvSelectionRefineResponse> => {
    return request<CvSelectionRefineResponse>("/api/v1/cvs/refine-selection", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  calculateAtsScore: async (
    id: number,
    targetJobId?: string | null,
    targetJdText?: string | null
  ): Promise<CvAtsScoreResponse> => {
    return request<CvAtsScoreResponse>(`/api/v1/cvs/${id}/ats-score`, {
      method: "POST",
      body: JSON.stringify({
        target_job_id: targetJobId,
        target_jd_text: targetJdText,
      }),
    });
  },
};
