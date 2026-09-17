import { baseApi } from "./baseApi";
import {
  RegisterIn,
  LoginIn,
  SendOtpIn,
  VerifyOtpIn,
  GoogleAuthIn,
  TokenOut,
  UserOut,
  MessageOut,
} from "@/types/auth";
import { setCredentials, setUser } from "../slices/authSlice";

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenOut, LoginIn>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Profile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.access_token) {
            dispatch(setCredentials({ token: data.access_token }));
            // Fetch user profile immediately
            dispatch(authApiSlice.endpoints.getMe.initiate());
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    register: builder.mutation<UserOut, RegisterIn>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    sendOtp: builder.mutation<MessageOut, SendOtpIn>({
      query: (data) => ({
        url: "/api/v1/auth/send-otp",
        method: "POST",
        body: {
          email: data.email,
          purpose: data.purpose || "verify_email",
        },
      }),
    }),

    verifyOtp: builder.mutation<MessageOut, VerifyOtpIn>({
      query: (data) => ({
        url: "/api/v1/auth/verify-otp",
        method: "POST",
        body: {
          email: data.email,
          otp: data.otp,
          purpose: data.purpose || "verify_email",
        },
      }),
    }),

    googleAuth: builder.mutation<TokenOut, GoogleAuthIn>({
      query: (data) => ({
        url: "/api/v1/auth/google",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Profile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.access_token) {
            dispatch(setCredentials({ token: data.access_token }));
            dispatch(authApiSlice.endpoints.getMe.initiate());
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    getMe: builder.query<UserOut, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setUser(data));
          }
        } catch {
          // Handle unauthorized
        }
      },
    }),

    checkHealth: builder.query<{ status: string; database?: string }, void>({
      query: () => "/health",
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGoogleAuthMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useCheckHealthQuery,
} = authApiSlice;