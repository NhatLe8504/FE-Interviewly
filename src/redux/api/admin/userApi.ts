import { baseApi } from "../baseApi";
import type {
  UserAdminOut,
  UserListPageOut,
  UserAdminCreateIn,
  UserStatusUpdateIn,
  UserRoleUpdateIn,
  UserFilterParams,
} from "@/types/admin";

export const adminUserApiSlice = baseApi.injectEndpoints({
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
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
} = adminUserApiSlice;
