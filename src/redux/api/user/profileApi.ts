import { baseApi } from "../baseApi";
import type {
  ProfileOut,
  ProfileUpdateIn,
  ChangePasswordIn,
  MessageOut,
  UserCareerProfileOut,
  SkillEvidenceItem,
} from "@/types/profile";

export const profileApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProfileOut, void>({
      query: () => "/api/v1/profile",
      providesTags: ["Profile"],
    }),

    getMySkillProfile: builder.query<UserCareerProfileOut, void>({
      query: () => "/api/v1/profile/skills",
      providesTags: ["Profile"],
    }),

    getMySkillEvidence: builder.query<SkillEvidenceItem[], string>({
      query: (skillId) => `/api/v1/profile/skills/${encodeURIComponent(skillId)}/evidence`,
    }),

    updateProfile: builder.mutation<ProfileOut, ProfileUpdateIn>({
      query: (data) => ({
        url: "/api/v1/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),

    changePassword: builder.mutation<MessageOut, ChangePasswordIn>({
      query: (data) => ({
        url: "/api/v1/profile/change-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
  useGetMySkillProfileQuery,
  useLazyGetMySkillProfileQuery,
  useGetMySkillEvidenceQuery,
  useLazyGetMySkillEvidenceQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApiSlice;
