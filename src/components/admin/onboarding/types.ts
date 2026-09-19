export interface DomainStatItem {
  domain_id: number;
  domain_name: string;
  code: string;
  user_count: number;
  percentage: number;
  color: string;
  top_roles: string[];
}

export interface RoleStatItem {
  role_id: number;
  role_name: string;
  domain_name: string;
  user_count: number;
  percentage: number;
}

export interface LevelStatItem {
  level_key: string;
  level_label: string;
  user_count: number;
  percentage: number;
  color: string;
}

export type AcquisitionChannelType =
  | "facebook"
  | "tiktok"
  | "youtube"
  | "ai_recommendation"
  | "google_search"
  | "referral"
  | "other";

export interface AcquisitionChannelStat {
  channel_key: AcquisitionChannelType | string;
  channel_name: string;
  user_count: number;
  percentage: number;
  pro_conversion_rate: number; // percentage of users who converted to Pro
  growth_rate: string; // e.g. "+32% MoM"
  color: string;
  icon_name: string;
  description: string;
}

export interface OnboardedUserRecord {
  user_id: number;
  full_name: string;
  email: string;
  domain_name: string;
  role_name: string;
  experience_level: string;
  target_goal: string;
  acquisition_channel: AcquisitionChannelType | string;
  language: "vi" | "en" | string;
  mic_verified: boolean;
  time_spent_seconds: number;
  completed_at: string;
  status: "completed" | "in_progress" | "abandoned";
}

export interface OnboardingSummaryStats {
  total_users_started: number;
  total_users_completed: number;
  overall_completion_rate: number; // percentage
  avg_time_seconds: number;
  top_domain_name: string;
  top_domain_percentage: number;
  top_acquisition_channel: string;
  top_channel_percentage: number;
}