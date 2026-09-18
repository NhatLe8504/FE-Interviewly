import { baseApi } from "./baseApi";
import type {
  UserAdminOut,
  UserListPageOut,
  UserAdminCreateIn,
  UserStatusUpdateIn,
  UserRoleUpdateIn,
  SystemStatsOut,
  AuditLogPageOut,
  ModerationPageOut,
  UserFilterParams,
  PaymentAdminOut,
  PaymentListPageOut,
  PaymentFilterParams,
  XGateSyncResult,
} from "@/types/admin";

export const adminApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserListPageOut, UserFilterParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.role && params.role !== "all") queryParams.append("role", params.role);
        if (params?.status && params.status !== "all") queryParams.append("status", params.status);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/users${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ user_id }) => ({ type: "AdminUsers" as const, id: user_id })),
              { type: "AdminUsers", id: "LIST" },
            ]
          : [{ type: "AdminUsers", id: "LIST" }],
    }),

    getUser: builder.query<UserAdminOut, number>({
      query: (userId) => `/api/v1/admin/users/${userId}`,
      providesTags: (_result, _error, id) => [{ type: "AdminUsers", id }],
    }),

    createUser: builder.mutation<UserAdminOut, UserAdminCreateIn>({
      query: (body) => ({
        url: "/api/v1/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminUsers", id: "LIST" }, "AdminStats"],
    }),

    updateUserStatus: builder.mutation<UserAdminOut, { userId: number; status: string }>({
      query: ({ userId, status }) => ({
        url: `/api/v1/admin/users/${userId}/status`,
        method: "PATCH",
        body: { status } as UserStatusUpdateIn,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "AdminUsers", id: userId },
        { type: "AdminUsers", id: "LIST" },
        "AdminStats",
      ],
    }),

    updateUserRole: builder.mutation<UserAdminOut, { userId: number; role: string }>({
      query: ({ userId, role }) => ({
        url: `/api/v1/admin/users/${userId}/role`,
        method: "PATCH",
        body: { role } as UserRoleUpdateIn,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "AdminUsers", id: userId },
        { type: "AdminUsers", id: "LIST" },
        "AdminStats",
      ],
    }),

    getAdminStats: builder.query<SystemStatsOut, void>({
      query: () => "/api/v1/admin/stats",
      providesTags: ["AdminStats"],
    }),

    getAuditLogs: builder.query<AuditLogPageOut, { tableName?: string; limit?: number; offset?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.tableName) queryParams.append("table_name", params.tableName);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/audit-logs${qs ? `?${qs}` : ""}`;
      },
    }),

    
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
              ...result.items.map(({ transaction_id }) => ({ type: "AdminPayments" as const, id: transaction_id })),
              { type: "AdminPayments", id: "LIST" },
            ]
          : [{ type: "AdminPayments", id: "LIST" }],
    }),

    
    syncXGate: builder.mutation<XGateSyncResult, void>({
      query: () => ({
        url: "/api/v1/admin/payments/sync-xgate",
        method: "POST",
      }),
      invalidatesTags: [{ type: "AdminPayments", id: "LIST" }, "AdminStats"],
    }),

    updatePaymentStatus: builder.mutation<PaymentAdminOut, { transactionId: number; status: string }>({
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

    getPayment: builder.query<PaymentAdminOut, number>({
      query: (txnId) => `/api/v1/admin/payments/${txnId}`,
      providesTags: (_result, _error, id) => [{ type: "AdminPayments", id }],
    }),

    getModerationLogs: builder.query<ModerationPageOut, { targetType?: string; limit?: number; offset?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.targetType) queryParams.append("target_type", params.targetType);
        if (typeof params?.limit === "number") queryParams.append("limit", String(params.limit));
        if (typeof params?.offset === "number") queryParams.append("offset", String(params.offset));
        const qs = queryParams.toString();
        return `/api/v1/admin/moderation${qs ? `?${qs}` : ""}`;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetAdminStatsQuery,
  useGetAuditLogsQuery,
  useGetModerationLogsQuery,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useSyncXGateMutation,
  useUpdatePaymentStatusMutation,
} = adminApiSlice;
