import { request } from "@/services/apiClient";

export interface InterviewTurnAdmin {
  turn_id: number;
  turn_number: number;
  speaker: string;
  question_text?: string | null;
  transcribed_text?: string | null;
  audio_file_url?: string | null;
  evaluation_score?: number | null;
  evaluation_feedback?: string | null;
  star_analysis?: Record<string, any> | null;
  wpm?: number | null;
  filler_words_count?: number | null;
}

export interface InterviewSessionAdmin {
  session_id: number;
  candidate_id: number;
  candidate_name?: string | null;
  candidate_email?: string | null;
  domain_id?: number | null;
  domain_name?: string | null;
  role_id?: number | null;
  role_name?: string | null;
  experience_level?: string | null;
  language: string;
  mode: string;
  status: string;
  total_score?: number | null;
  turns_count: number;
  started_at: string;
  completed_at?: string | null;
}

export interface InterviewSessionDetailPage extends InterviewSessionAdmin {
  turns: InterviewTurnAdmin[];
}

export interface InterviewSessionPage {
  items: InterviewSessionAdmin[];
  total: number;
  limit: number;
  offset: number;
}

export const interviewAdminApi = {
  getInterviews: (params?: {
    status?: string;
    candidate_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== "all") sp.set("status", params.status);
    if (params?.candidate_id) sp.set("candidate_id", String(params.candidate_id));
    if (params?.search) sp.set("search", params.search);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return request<InterviewSessionPage>(`/api/v1/admin/interviews${qs}`);
  },

  getInterviewDetail: (sessionId: number) =>
    request<InterviewSessionDetailPage>(`/api/v1/admin/interviews/${sessionId}`),
};
