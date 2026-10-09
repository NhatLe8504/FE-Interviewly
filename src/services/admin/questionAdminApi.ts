import { request } from "@/services/apiClient";
import type {
  QuestionDetailOut,
  QuestionOut,
  QuestionPageOut,
  QuestionSetDetailOut,
  QuestionSetPageOut,
  DomainOut,
  RoleOut,
  SkillOptionOut,
  SkillSuggestionOut,
} from "@/types/catalog";

export interface QuestionAdminCreateIn {
  domain_id: number;
  question_text: string;
  question_type: "behavioral" | "technical" | "situational";
  language?: "vi" | "en";
  role_id?: number | null;
  experience_level?: string | null;
  star_template_id?: number | null;
  quiz_data?: any;
  sample_answer?: string | null;
  follow_up_questions?: string[] | null;
  tips?: string[] | null;
  skill_ids?: string[] | null;
}

export interface QuestionAdminUpdateIn {
  domain_id?: number | null;
  question_text?: string | null;
  question_type?: "behavioral" | "technical" | "situational" | null;
  language?: "vi" | "en" | null;
  role_id?: number | null;
  experience_level?: string | null;
  star_template_id?: number | null;
  is_active?: boolean | null;
  quiz_data?: any;
  sample_answer?: string | null;
  follow_up_questions?: string[] | null;
  tips?: string[] | null;
  skill_ids?: string[] | null;
}

export interface QuestionSetAdminCreateIn {
  title: string;
  description: string;
  domain_id: number;
  role_id?: number | null;
  experience_level?: string | null;
  tech_stack?: string[] | null;
  language?: string;
  target_difficulty?: number;
  estimated_duration_minutes?: number;
  is_curated?: boolean;
  is_active?: boolean;
  question_ids?: number[] | null;
}

export interface QuestionSetAdminUpdateIn {
  title?: string | null;
  description?: string | null;
  domain_id?: number | null;
  role_id?: number | null;
  experience_level?: string | null;
  tech_stack?: string[] | null;
  language?: string | null;
  target_difficulty?: number | null;
  estimated_duration_minutes?: number | null;
  is_curated?: boolean | null;
  is_active?: boolean | null;
  question_ids?: number[] | null;
}

export const questionAdminApi = {
  // Questions
  async getQuestions(params: { domain_id?: number; level?: string; search?: string; limit?: number; offset?: number } = {}): Promise<QuestionPageOut> {
    const q = new URLSearchParams();
    if (params.domain_id) q.set("domain_id", String(params.domain_id));
    if (params.level && params.level !== "all") q.set("level", params.level);
    if (params.limit) q.set("limit", String(params.limit));
    if (params.offset) q.set("offset", String(params.offset));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<QuestionPageOut>(`/api/v1/catalog/questions${qs}`);
  },

  async getQuestionDetail(id: number | string): Promise<QuestionDetailOut> {
    return request<QuestionDetailOut>(`/api/v1/catalog/questions/${id}`);
  },

  async createQuestion(data: QuestionAdminCreateIn): Promise<QuestionDetailOut> {
    return request<QuestionDetailOut>("/api/v1/admin/questions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateQuestion(id: number | string, data: QuestionAdminUpdateIn): Promise<QuestionDetailOut> {
    return request<QuestionDetailOut>(`/api/v1/admin/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteQuestion(id: number | string): Promise<void> {
    return request<void>(`/api/v1/admin/questions/${id}`, {
      method: "DELETE",
    });
  },

  // Question Sets
  async getQuestionSets(params: { domain_id?: number; level?: string; search?: string; limit?: number; offset?: number } = {}): Promise<QuestionSetPageOut> {
    const q = new URLSearchParams();
    if (params.domain_id) q.set("domain_id", String(params.domain_id));
    if (params.level && params.level !== "all") q.set("level", params.level);
    if (params.search) q.set("search", params.search);
    if (params.limit) q.set("limit", String(params.limit));
    if (params.offset) q.set("offset", String(params.offset));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<QuestionSetPageOut>(`/api/v1/catalog/question-sets${qs}`);
  },

  async getQuestionSetDetail(setId: number | string): Promise<QuestionSetDetailOut> {
    return request<QuestionSetDetailOut>(`/api/v1/catalog/question-sets/${setId}`);
  },

  async createQuestionSet(data: QuestionSetAdminCreateIn): Promise<QuestionSetDetailOut> {
    return request<QuestionSetDetailOut>("/api/v1/admin/question-sets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateQuestionSet(setId: number | string, data: QuestionSetAdminUpdateIn): Promise<QuestionSetDetailOut> {
    return request<QuestionSetDetailOut>(`/api/v1/admin/question-sets/${setId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteQuestionSet(setId: number | string): Promise<void> {
    return request<void>(`/api/v1/admin/question-sets/${setId}`, {
      method: "DELETE",
    });
  },

  // Metadata helpers
  async getDomains(): Promise<DomainOut[]> {
    return request<DomainOut[]>("/api/v1/catalog/domains");
  },

  async getRoles(domainId?: number | null): Promise<RoleOut[]> {
    const qs = domainId ? `?domain_id=${domainId}` : "";
    return request<RoleOut[]>(`/api/v1/catalog/roles${qs}`);
  },

  // Skill tags
  async getSkills(): Promise<SkillOptionOut[]> {
    return request<SkillOptionOut[]>("/api/v1/admin/skills");
  },

  async suggestSkillIds(questionText: string): Promise<SkillSuggestionOut> {
    return request<SkillSuggestionOut>("/api/v1/admin/questions/skill-suggestions", {
      method: "POST",
      body: JSON.stringify({ question_text: questionText }),
    });
  },
};
