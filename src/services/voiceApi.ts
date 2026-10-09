import { request } from "./apiClient";

export interface VoiceOptionItem {
  id: string;
  name: string;
  provider: "edge" | "elevenlabs" | "browser";
  language: string;
  gender: string;
  description: string;
  is_default: boolean;
  is_premium: boolean;
  is_locked: boolean;
  lock_reason?: string | null;
}

export interface STTEngineItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  is_default: boolean;
  is_premium: boolean;
  is_locked: boolean;
  lock_reason?: string | null;
}

export interface VoiceOptionsResponse {
  is_premium_user: boolean;
  voices: VoiceOptionItem[];
  stt_engines: STTEngineItem[];
}

export const voiceApi = {
  getVoiceOptions: async (): Promise<VoiceOptionsResponse> => {
    return request<VoiceOptionsResponse>("/api/v1/voice/options", {
      method: "GET",
    });
  },

  uploadUserTurnAudio: async (
    sessionId: number | string,
    turnId: number,
    audioBlob: Blob
  ): Promise<{ status: string; audio_url: string }> => {
    const formData = new FormData();
    const filename = `turn_${turnId}_user.webm`;
    formData.append("file", audioBlob, filename);

    return request<{ status: string; audio_url: string }>(
      `/api/v1/interviews/sessions/${sessionId}/turns/${turnId}/user-audio`,
      {
        method: "POST",
        body: formData,
      }
    );
  },
};
