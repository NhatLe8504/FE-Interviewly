import { request } from "@/services/apiClient";
import { store } from "@/redux/store";
import { billingApiSlice } from "@/redux/api/billingApi";

export interface SubscriptionPlanAdmin {
  plan_id: number;
  plan_name: string;
  price: number;
  billing_cycle: "free" | "weekly" | "monthly" | "quarterly" | "yearly";
  feature_limits: {
    interview_turns?: number;
    ai_feedback?: string;
    pdf_reports?: boolean;
    speech_analysis?: boolean;
    max_cv_saved?: number;
    [key: string]: any;
  };
  is_active: boolean;
  created_at?: string;
  subscribers_count: number;
}

export interface SubscriptionPlanCreateIn {
  plan_name: string;
  price: number;
  billing_cycle: string;
  feature_limits?: Record<string, any>;
  is_active?: boolean;
}

export interface SubscriptionPlanUpdateIn {
  plan_name?: string;
  price?: number;
  billing_cycle?: string;
  feature_limits?: Record<string, any>;
  is_active?: boolean;
}

export interface UserSubscriptionAdmin {
  user_subscription_id: number;
  user_id: number;
  user_email?: string | null;
  user_name?: string | null;
  plan_id: number;
  plan_name?: string | null;
  status: "active" | "expired" | "cancelled" | "past_due";
  auto_renew: boolean;
  start_date: string;
  end_date?: string | null;
  created_at?: string;
}

export interface UserSubscriptionPage {
  items: UserSubscriptionAdmin[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserSubscriptionUpdateIn {
  status?: string;
  auto_renew?: boolean;
  end_date?: string;
}

export const subscriptionAdminApi = {
  getPlans: () => request<SubscriptionPlanAdmin[]>("/api/v1/admin/plans"),

  createPlan: async (data: SubscriptionPlanCreateIn) => {
    const res = await request<SubscriptionPlanAdmin>("/api/v1/admin/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
    try {
      store.dispatch(billingApiSlice.util.invalidateTags(["Subscription"]));
    } catch {
      // ignore
    }
    return res;
  },

  updatePlan: async (planId: number, data: SubscriptionPlanUpdateIn) => {
    const res = await request<SubscriptionPlanAdmin>(`/api/v1/admin/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    try {
      store.dispatch(billingApiSlice.util.invalidateTags(["Subscription"]));
    } catch {
      // ignore
    }
    return res;
  },

  deletePlan: async (planId: number) => {
    const res = await request<void>(`/api/v1/admin/plans/${planId}`, {
      method: "DELETE",
    });
    try {
      store.dispatch(billingApiSlice.util.invalidateTags(["Subscription"]));
    } catch {
      // ignore
    }
    return res;
  },

  getUserSubscriptions: (params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== "all") sp.set("status", params.status);
    if (params?.search) sp.set("search", params.search);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return request<UserSubscriptionPage>(`/api/v1/admin/user-subscriptions${qs}`);
  },

  updateUserSubscription: (userSubId: number, data: UserSubscriptionUpdateIn) =>
    request<UserSubscriptionAdmin>(`/api/v1/admin/user-subscriptions/${userSubId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
