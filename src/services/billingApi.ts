import { store } from "@/redux/store";
import { billingApiSlice } from "@/redux/api/billingApi";
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
      const plans = await store
        .dispatch(billingApiSlice.endpoints.getPlans.initiate())
        .unwrap();
      if (Array.isArray(plans) && plans.length > 0) {
        return plans;
      }
      return DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  },

  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return store
      .dispatch(billingApiSlice.endpoints.createCheckout.initiate(data))
      .unwrap();
  },

  async getMySubscription(): Promise<UserSubscription | null> {
    try {
      return await store
        .dispatch(billingApiSlice.endpoints.getMySubscription.initiate())
        .unwrap();
    } catch {
      return null;
    }
  },

  async getPaymentHistory(limit: number = 50): Promise<PaymentTransaction[]> {
    try {
      return await store
        .dispatch(billingApiSlice.endpoints.getPaymentHistory.initiate(limit))
        .unwrap();
    } catch {
      return [];
    }
  },

  async getQuota(feature: string = "interview_turns"): Promise<QuotaInfo> {
    return store
      .dispatch(billingApiSlice.endpoints.getQuota.initiate(feature))
      .unwrap();
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/billingApi";