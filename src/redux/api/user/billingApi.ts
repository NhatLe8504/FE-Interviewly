import { baseApi } from "../baseApi";
import type {
  SubscriptionPlan,
  CheckoutRequest,
  CheckoutResponse,
  UserSubscription,
  PaymentTransaction,
  QuotaInfo,
} from "@/types/billing";

export const billingApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/api/v1/billing/plans",
      providesTags: ["Subscription"],
    }),

    createCheckout: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "/api/v1/billing/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription", "Quota"],
    }),

    getMySubscription: builder.query<UserSubscription | null, void>({
      query: () => "/api/v1/billing/subscriptions/me",
      providesTags: ["Subscription"],
    }),

    getPaymentHistory: builder.query<PaymentTransaction[], number | undefined>({
      query: (limit = 50) => `/api/v1/billing/payments/history?limit=${limit}`,
    }),

    getQuota: builder.query<QuotaInfo, string | undefined>({
      query: (feature = "interview_turns") => `/api/v1/billing/quota?feature=${feature}`,
      providesTags: ["Quota"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlansQuery,
  useCreateCheckoutMutation,
  useGetMySubscriptionQuery,
  useGetPaymentHistoryQuery,
  useGetQuotaQuery,
} = billingApiSlice;