export type BillingCycle = "free" | "weekly" | "monthly" | "yearly";

export interface PlanFeatureLimits {
  interview_turns?: number;
  ai_feedback?: "basic" | "detailed" | "advanced" | string;
  pdf_reports?: boolean;
  speech_analysis?: boolean;
  mock_interviews_per_month?: number | string;
  custom_scenarios?: boolean;
  priority_support?: boolean;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  plan_id: number;
  plan_name: string;
  price: number;
  billing_cycle: BillingCycle;
  feature_limits: PlanFeatureLimits;
  is_active: boolean;
  description?: string;
}

export interface CheckoutRequest {
  plan_id: number;
  payment_gateway?: "vnpay" | "momo" | "stripe";
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

export interface QuotaInfo {
  has_active_subscription: boolean;
  plan_name: string;
  quota_allowed: boolean;
  remaining_quota: number;
  feature: string;
}

