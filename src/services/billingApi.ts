import { request } from "./apiClient";
import type {
  SubscriptionPlan,
  CheckoutRequest,
  CheckoutResponse,
  UserSubscription,
  PaymentTransaction,
  QuotaInfo,
} from "@/types/billing";

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    plan_id: 1,
    plan_name: "Free",
    price: 0,
    billing_cycle: "free",
    feature_limits: {
      interview_turns: 5,
      ai_feedback: "basic",
      pdf_reports: false,
      speech_analysis: false,
      mock_interviews_per_month: 3,
      custom_scenarios: false,
      priority_support: false,
    },
    is_active: true,
    description: "Khám phá phỏng vấn AI với các tính năng cơ bản hoàn toàn miễn phí.",
  },
  {
    plan_id: 2,
    plan_name: "Pro Monthly",
    price: 99000,
    billing_cycle: "monthly",
    feature_limits: {
      interview_turns: 100,
      ai_feedback: "detailed",
      pdf_reports: true,
      speech_analysis: true,
      mock_interviews_per_month: "Không giới hạn",
      custom_scenarios: true,
      priority_support: true,
    },
    is_active: true,
    description: "Dành cho ứng viên đang tích cực tìm việc và muốn rèn luyện chuyên sâu mỗi ngày.",
  },
  {
    plan_id: 3,
    plan_name: "Pro Yearly",
    price: 899000,
    billing_cycle: "yearly",
    feature_limits: {
      interview_turns: 1500,
      ai_feedback: "detailed",
      pdf_reports: true,
      speech_analysis: true,
      mock_interviews_per_month: "Không giới hạn",
      custom_scenarios: true,
      priority_support: true,
    },
    is_active: true,
    description: "Tiết kiệm 20% - Giải pháp trọn gói dài hạn giúp bạn tự tin chinh phục mọi kỳ phỏng vấn.",
  },
];

export const billingApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const plans = await request<SubscriptionPlan[]>("/api/v1/billing/plans");
      if (Array.isArray(plans) && plans.length > 0) {
        return plans;
      }
      return DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  },

  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return request<CheckoutResponse>("/api/v1/billing/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMySubscription(): Promise<UserSubscription | null> {
    return request<UserSubscription | null>("/api/v1/billing/subscriptions/me");
  },

  async getPaymentHistory(limit: number = 50): Promise<PaymentTransaction[]> {
    return request<PaymentTransaction[]>(`/api/v1/billing/payments/history?limit=${limit}`);
  },

  async getQuota(feature: string = "interview_turns"): Promise<QuotaInfo> {
    return request<QuotaInfo>(`/api/v1/billing/quota?feature=${feature}`);
  },
};
