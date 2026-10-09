import { store } from "@/redux/store";
import { profileApiSlice } from "@/redux/api/profileApi";
import type {
  ProfileOut,
  ProfileUpdateIn,
  ChangePasswordIn,
  MessageOut,
  UserCareerProfileOut,
} from "@/types/profile";

export const profileApi = {
  /**
   * Fetches the current user profile from GET /api/v1/profile
   */
  async getMyProfile(): Promise<ProfileOut> {
    return store.dispatch(profileApiSlice.endpoints.getMyProfile.initiate()).unwrap();
  },

  /**
   * Fetches the detected user skill and career profile from GET /api/v1/profile/skills
   */
  async getMySkillProfile(): Promise<UserCareerProfileOut> {
    return store.dispatch(profileApiSlice.endpoints.getMySkillProfile.initiate()).unwrap();
  },

  /**
   * Updates user profile fields via PATCH /api/v1/profile
   */
  async updateProfile(payload: ProfileUpdateIn): Promise<ProfileOut> {
    return store.dispatch(profileApiSlice.endpoints.updateProfile.initiate(payload)).unwrap();
  },

  /**
   * Changes the current user password via POST /api/v1/profile/change-password
   */
  async changePassword(payload: ChangePasswordIn): Promise<MessageOut> {
    return store.dispatch(profileApiSlice.endpoints.changePassword.initiate(payload)).unwrap();
  },
};

// Re-export RTK Query hooks for direct component usage
export * from "@/redux/api/profileApi";
