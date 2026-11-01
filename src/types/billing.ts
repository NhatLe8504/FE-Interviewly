export type BillingCycle = "free" | "weekly" | "monthly" | "yearly" | "one_time";

export interface PlanFeatureLimits {
  interview_turns?: number;
  ai_feedback?: "basic" | "detailed" | "advanced" | string;
  pdf_reports?: boolean;
  speech_analysis?: boolean;
  mock_interviews_per_month?: number | string;
  custom_scenarios?: boolean;
  priority_support?: boolean;
  voice_minutes?: number;
  cv_generations?: number;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  plan_id: number;
  plan_name: string;
  price: number;
  billing_cycle: BillingCycle;
  plan_type?: "subscription" | "addon";
  feature_limits: PlanFeatureLimits;
  is_active: boolean;
  description?: string;
}

export interface CheckoutRequest {
  plan_id: number;
  payment_gateway?: "vnpay" | "momo" | "stripe" | "xgate";
  return_url?: string;
}

export interface CheckoutResponse {
  transaction_ref: string;
  payment_url: string;
  amount: number;
  currency: string;
}

export interface UserSubscription {
  user_subscription_id: number;
  user_id: number;
  plan_id: number;
  status: "active" | "expired" | "canceled" | "pending";
  auto_renew: boolean;
  start_date: string;
  end_date?: string | null;
  plan?: SubscriptionPlan | null;
}

export interface PaymentTransaction {
  transaction_id: number;
  user_subscription_id: number;
  payment_gateway: string;
  gateway_transaction_id: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded";
  paid_at?: string | null;
  created_at?: string | null;
}

export interface QuotaDetail {
  total: number;
  used: number;
  remaining: number;
  allowed: boolean;
}

export interface QuotaInfo {
  has_active_subscription?: boolean;
  is_active?: boolean;
  plan_name?: string;
  plan?: string;
  quota_allowed: boolean;
  remaining_quota?: number;
  feature?: string;
  voice_minutes?: QuotaDetail;
  cv_generations?: QuotaDetail;
  interviews_limit?: number | null;
  interviews_used?: number;
  reset_date?: string | null;
}
