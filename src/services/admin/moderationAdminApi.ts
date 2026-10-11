import { request } from "@/services/apiClient";

export interface ModerationItem {
  log_id: number;
  admin_id: number;
  target_type: "question" | "answer" | "user" | "session" | "comment";
  target_id?: number | null;
  action: "flag" | "approve" | "reject" | "remove" | "warn";
  reason?: string | null;
  created_at?: string | null;
}

export interface ModerationPage {
  items: ModerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ModerationCreateIn {
  target_type: string;
  action: string;
  target_id?: number | null;
  reason?: string | null;
}

export const moderationAdminApi = {
  getLogs: (params?: { target_type?: string; limit?: number; offset?: number }) => {
    const sp = new URLSearchParams();
    if (params?.target_type && params.target_type !== "all") sp.set("target_type", params.target_type);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return request<ModerationPage>(`/api/v1/admin/moderation${qs}`);
  },

  createAction: (data: ModerationCreateIn) =>
    request<ModerationItem>("/api/v1/admin/moderation", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
