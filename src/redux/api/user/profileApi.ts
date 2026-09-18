import { baseApi } from "../baseApi";
import type {
  ProfileOut,
  ProfileUpdateIn,
  ChangePasswordIn,
  MessageOut,
} from "@/types/profile";

export const profileApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProfileOut, void>({
      query: () => "/api/v1/profile",
      providesTags: ["Profile"],
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
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApiSlice;