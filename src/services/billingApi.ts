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
    plan_type: "subscription",
    feature_limits: {
      interview_turns: 5,
      voice_minutes: 15,
      cv_generations: 1,
      ai_feedback: "basic",
      pdf_reports: false,
      speech_analysis: false,
      mock_interviews_per_month: 3,
      custom_scenarios: false,
      priority_support: false,
    },
    is_active: true,
    description: "15 phút phỏng vấn giọng nói AI & 1 lượt tạo CV chuẩn ATS hoàn toàn miễn phí.",
  },
  {
    plan_id: 4,
    plan_name: "Sprint 7 Ngày (Cấp Tốc)",
    price: 49000,
    billing_cycle: "weekly",
    plan_type: "subscription",
    feature_limits: {
      interview_turns: 35,
      voice_minutes: 60,
      cv_generations: 3,
      ai_feedback: "detailed",
      pdf_reports: true,
      speech_analysis: true,
      mock_interviews_per_month: "60 phút / 7 ngày",
      custom_scenarios: true,
      priority_support: true,
    },
    is_active: true,
    description: "60 phút phỏng vấn thích ứng • 3 lượt tạo CV AI • Toàn quyền Pro trong 7 ngày.",
  },
  {
    plan_id: 2,
    plan_name: "Pro Monthly",
    price: 99000,
    billing_cycle: "monthly",
    plan_type: "subscription",
    feature_limits: {
      interview_turns: 100,
      voice_minutes: 300,
      cv_generations: 15,
      ai_feedback: "detailed",
      pdf_reports: true,
      speech_analysis: true,
      mock_interviews_per_month: "300 phút (~10 phiên)",
      custom_scenarios: true,
      priority_support: true,
    },
    is_active: true,
    description: "300 phút phỏng vấn giọng nói • 15 lượt tạo CV AI • Toàn quyền Pro 30 ngày.",
  },
  {
    plan_id: 3,
    plan_name: "Pro Yearly",
    price: 899000,
    billing_cycle: "yearly",
    plan_type: "subscription",
    feature_limits: {
      interview_turns: 1500,
      voice_minutes: 4000,
      cv_generations: 200,
      ai_feedback: "detailed",
      pdf_reports: true,
      speech_analysis: true,
      mock_interviews_per_month: "4.000 phút",
      custom_scenarios: true,
      priority_support: true,
    },
    is_active: true,
    description: "4.000 phút phỏng vấn giọng nói • 200 lượt tạo CV AI • Tiết kiệm 25% trọn năm.",
  },
  // Add-ons
  {
    plan_id: 101,
    plan_name: "Gói Nạp +30 Phút Phỏng Vấn",
    price: 29000,
    billing_cycle: "one_time",
    plan_type: "addon",
    feature_limits: {
      voice_minutes: 30,
      cv_generations: 0,
    },
    is_active: true,
    description: "Cộng thêm 30 phút luyện tập phỏng vấn giọng nói AI vào tài khoản hiện tại.",
  },
  {
    plan_id: 102,
    plan_name: "Gói Nạp +60 Phút Phỏng Vấn",
    price: 49000,
    billing_cycle: "one_time",
    plan_type: "addon",
    feature_limits: {
      voice_minutes: 60,
      cv_generations: 0,
    },
    is_active: true,
    description: "Cộng thêm 60 phút luyện tập phỏng vấn giọng nói AI vào tài khoản hiện tại.",
  },
  {
    plan_id: 103,
    plan_name: "Gói Nạp +120 Phút Phỏng Vấn",
    price: 89000,
    billing_cycle: "one_time",
    plan_type: "addon",
    feature_limits: {
      voice_minutes: 120,
      cv_generations: 0,
    },
    is_active: true,
    description: "Cộng thêm 120 phút luyện tập phỏng vấn giọng nói AI với giá ưu đãi tiết kiệm.",
  },
  {
    plan_id: 104,
    plan_name: "Gói Nạp +3 Lượt Tạo CV AI",
    price: 19000,
    billing_cycle: "one_time",
    plan_type: "addon",
    feature_limits: {
      voice_minutes: 0,
      cv_generations: 3,
    },
    is_active: true,
    description: "Cộng thêm 3 lượt sinh CV chuẩn ATS và tối ưu hóa từ JD bằng AI.",
  },
  {
    plan_id: 105,
    plan_name: "Gói Nạp +10 Lượt Tạo CV AI",
    price: 49000,
    billing_cycle: "one_time",
    plan_type: "addon",
    feature_limits: {
      voice_minutes: 0,
      cv_generations: 10,
    },
    is_active: true,
    description: "Cộng thêm 10 lượt sinh CV chuẩn ATS và tối ưu hóa từ JD bằng AI.",
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
