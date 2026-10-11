import { request } from "@/services/apiClient";

export interface SystemSettings {
  ai_model: string;
  ai_temperature: number;
  ai_max_tokens: number;
  ai_interviewer_persona: string;
  tts_provider: string;
  tts_default_voice: string;
  stt_provider: string;
  audio_retention_hours: number;
  max_upload_size_mb: number;
  smtp_host: string;
  smtp_port: number;
  smtp_sender_name: string;
  smtp_sender_email: string;
  maintenance_mode: boolean;
  updated_at?: string | null;
}

export interface SystemSettingsUpdateIn {
  ai_model?: string;
  ai_temperature?: number;
  ai_max_tokens?: number;
  ai_interviewer_persona?: string;
  tts_provider?: string;
  tts_default_voice?: string;
  stt_provider?: string;
  audio_retention_hours?: number;
  max_upload_size_mb?: number;
  smtp_host?: string;
  smtp_port?: number;
  smtp_sender_name?: string;
  smtp_sender_email?: string;
  maintenance_mode?: boolean;
}

export interface SystemHealth {
  database_connected: boolean;
  redis_connected: boolean;
  audio_storage_size_mb: number;
  server_time: string;
  active_connections: number;
  version: string;
}

export const settingsAdminApi = {
  getSettings: () => request<SystemSettings>("/api/v1/admin/settings"),

  updateSettings: (data: SystemSettingsUpdateIn) =>
    request<SystemSettings>("/api/v1/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getHealth: () => request<SystemHealth>("/api/v1/admin/settings/health"),
};
