import { request } from "./apiClient";
import {
  ProfileOut,
  ProfileUpdateIn,
  ChangePasswordIn,
  MessageOut,
} from "@/types/profile";

export const profileApi = {
  /**
   * Fetches the current user profile from GET /api/v1/profile
   */
  async getMyProfile(): Promise<ProfileOut> {
    return request<ProfileOut>("/api/v1/profile", {
      method: "GET",
    });
  },

  /**
   * Updates user profile fields via PATCH /api/v1/profile
   */
  async updateProfile(payload: ProfileUpdateIn): Promise<ProfileOut> {
    return request<ProfileOut>("/api/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Changes the current user password via POST /api/v1/profile/change-password
   */
  async changePassword(payload: ChangePasswordIn): Promise<MessageOut> {
    return request<MessageOut>("/api/v1/profile/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
