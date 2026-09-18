export type UserRole = "candidate" | "admin";
export type UserStatus = "active" | "suspended" | "deleted";

export interface UserAdminOut {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  preferred_language: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserAdminCreateIn {
  full_name: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: UserRole;
  status?: UserStatus;
  preferred_language?: string;
}

export interface UserStatusUpdateIn {
  status: UserStatus;
}

export interface UserRoleUpdateIn {
  role: UserRole;
}

export interface UserListPageOut {
  items: UserAdminOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface SystemStatsOut {
  total_users: number;
  active_users: number;
  total_sessions: number;
  completed_sessions: number;
  total_questions: number;
  total_revenue: number;
}

export interface AuditLogOut {
  audit_id: number;
  user_id?: number | null;
  table_name: string;
  record_id?: number | null;
  action: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface AuditLogPageOut {
  items: AuditLogOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface ModerationItemOut {
  log_id: number;
  admin_id: number;
  target_type: string;
  target_id?: number | null;
  action: string;
  reason?: string | null;
  created_at?: string | null;
}

export interface ModerationPageOut {
  items: ModerationItemOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}


export interface PaymentAdminOut {
  transaction_id: number;
  user_subscription_id: number;
  payment_gateway: string;
  gateway_transaction_id: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded" | string;
  paid_at?: string | null;
  created_at?: string | null;
  user_id?: number | null;
  user_email?: string | null;
  user_name?: string | null;
  plan_name?: string | null;
}

export interface PaymentListPageOut {
  items: PaymentAdminOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentFilterParams {
  status?: string;
  gateway?: string;
  limit?: number;
  offset?: number;
}


export interface PaymentStatusUpdateIn {
  status: string;
}

export interface XGateSyncResult {
  success: boolean;
  scanned_xgate_count: number;
  matched_count: number;
  new_confirmed_count: number;
  message: string;
}
