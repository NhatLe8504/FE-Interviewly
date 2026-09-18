export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "STATUS_CHANGE"
  | "ROLE_ASSIGN"
  | "CONFIG_CHANGE"
  | "SYNC"
  | string;

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export type AuditStatus = "success" | "warning" | "failure" | "info";

export interface AuditLogItem {
  audit_id: number;
  user_id?: number | null;
  actor_name: string;
  actor_email: string;
  actor_role: "admin" | "candidate" | "system" | string;
  actor_avatar?: string | null;
  table_name: string;
  record_id?: number | string | null;
  action: AuditActionType;
  summary: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  status: AuditStatus;
  severity: AuditSeverity;
  created_at: string;
}

export interface AuditLogStats {
  totalEvents: number;
  dataMutations: number;
  securityEvents: number;
  warningAlerts: number;
  recentActiveUsers: number;
}