import { baseApi } from "../baseApi";
import type {
  PaymentAdminOut,
  PaymentListPageOut,
  PaymentFilterParams,
  XGateSyncResult,
} from "@/types/admin";

export const adminPaymentApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentListPageOut, PaymentFilterParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "all") queryParams.append("status", params.status);
        if (params?.gateway && params.gateway !== "all") queryParams.append("gateway", params.gateway);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/payments${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ transaction_id }) => ({
                type: "AdminPayments" as const,
                id: transaction_id,
              })),
              { type: "AdminPayments", id: "LIST" },
            ]
          : [{ type: "AdminPayments", id: "LIST" }],
    }),

    getPayment: builder.query<PaymentAdminOut, number>({
      query: (txnId) => `/api/v1/admin/payments/${txnId}`,
      providesTags: (_result, _error, id) => [{ type: "AdminPayments", id }],
    }),

    syncXGate: builder.mutation<XGateSyncResult, void>({
      query: () => ({
        url: "/api/v1/admin/payments/sync-xgate",
        method: "POST",
      }),
      invalidatesTags: [{ type: "AdminPayments", id: "LIST" }, "AdminStats"],
    }),

    updatePaymentStatus: builder.mutation<
      PaymentAdminOut,
      { transactionId: number; status: string }
    >({
      query: ({ transactionId, status }) => ({
        url: `/api/v1/admin/payments/${transactionId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { transactionId }) => [
        { type: "AdminPayments", id: transactionId },
        { type: "AdminPayments", id: "LIST" },
        "AdminStats",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useSyncXGateMutation,
  useUpdatePaymentStatusMutation,
} = adminPaymentApiSlice;
