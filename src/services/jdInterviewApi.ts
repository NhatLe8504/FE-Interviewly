import { request } from "./apiClient";

export interface ScriptItem {
  order_index: number;
  section_type: string;
  competency_name: string;
  question_text: string;
  rationale: string;
  difficulty: number;
  expected_signals: string[];
  red_flags: string[];
  sample_good_answer?: string | null;
  follow_up_probes: string[];
}

export interface InterviewScriptResult {
  script_id: string;
  job_id: string;
  role: string;
  seniority: string;
  total_questions: number;
  estimated_minutes: number;
  questions: ScriptItem[];
  warnings: string[];
}

export interface JDJobStatusResponse {
  job_id: string;
  status: "PENDING" | "INGESTING" | "NORMALIZED" | "ANALYZING" | "PLANNING" | "GENERATING" | "VALIDATING" | "COMPLETED" | "FAILED" | "RETRYING";
  stage: string;
  progress_pct: number;
  result?: InterviewScriptResult | null;
  error?: string | null;
}

export interface JDStartSessionResponse {
  session_id: number;
  first_question: string;
  script_id: string;
  role: string;
  seniority: string;
  total_questions: number;
  estimated_minutes: number;
  all_questions: string[];
}

export const jdInterviewApi = {
  submitText: async (
    text: string,
    durationMinutes = 45,
    difficulty?: number,
    language = "vi"
  ): Promise<JDJobStatusResponse> => {
    return request<JDJobStatusResponse>("/api/v1/interviews/from-jd/text", {
      method: "POST",
      body: JSON.stringify({
        text,
        duration_minutes: durationMinutes,
        difficulty,
        language,
      }),
    });
  },

  submitUrl: async (
    url: string,
    durationMinutes = 45,
    difficulty?: number,
    language = "vi"
  ): Promise<JDJobStatusResponse> => {
    return request<JDJobStatusResponse>("/api/v1/interviews/from-jd/url", {
      method: "POST",
      body: JSON.stringify({
        url,
        duration_minutes: durationMinutes,
        difficulty,
        language,
      }),
    });
  },

  submitFile: async (
    file: File,
    durationMinutes = 45,
    difficulty?: number,
    language = "vi"
  ): Promise<JDJobStatusResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("duration_minutes", durationMinutes.toString());
    if (difficulty) {
      formData.append("difficulty", difficulty.toString());
    }
    formData.append("language", language);

    return request<JDJobStatusResponse>("/api/v1/interviews/from-jd/file", {
      method: "POST",
      body: formData,
    });
  },

  getJobStatus: async (jobId: string): Promise<JDJobStatusResponse> => {
    return request<JDJobStatusResponse>(`/api/v1/interviews/from-jd/jobs/${jobId}/status`, {
      method: "GET",
    });
  },

  startSession: async (
    jobId: string,
    mode: "text" | "voice" = "text",
    bargeInEnabled = false
  ): Promise<JDStartSessionResponse> => {
    return request<JDStartSessionResponse>(`/api/v1/interviews/from-jd/jobs/${jobId}/start-session`, {
      method: "POST",
      body: JSON.stringify({
        mode,
        barge_in_enabled: bargeInEnabled,
      }),
    });
  },
};
