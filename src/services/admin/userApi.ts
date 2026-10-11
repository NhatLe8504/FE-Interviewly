import { store } from "@/redux/store";
import { adminUserApiSlice } from "@/redux/api/admin/userApi";
import { request } from "@/services/apiClient";
import type {
  UserAdminOut,
  UserListPageOut,
  UserAdminCreateIn,
  UserFilterParams,
  UserStatus,
  UserRole,
} from "@/types/admin";

export const adminUserService = {
  async getUsers(params?: UserFilterParams): Promise<UserListPageOut> {
    return store.dispatch(adminUserApiSlice.endpoints.getUsers.initiate(params)).unwrap();
  },

  async getUser(userId: number): Promise<UserAdminOut> {
    return store.dispatch(adminUserApiSlice.endpoints.getUser.initiate(userId)).unwrap();
  },

  async createUser(data: UserAdminCreateIn): Promise<UserAdminOut> {
    return store.dispatch(adminUserApiSlice.endpoints.createUser.initiate(data)).unwrap();
  },

  async updateUserStatus(userId: number, status: UserStatus | string): Promise<UserAdminOut> {
    return store
      .dispatch(adminUserApiSlice.endpoints.updateUserStatus.initiate({ userId, status }))
      .unwrap();
  },

  async updateUserRole(userId: number, role: UserRole | string): Promise<UserAdminOut> {
    return store
      .dispatch(adminUserApiSlice.endpoints.updateUserRole.initiate({ userId, role }))
      .unwrap();
  },

  async resetPassword(
    userId: number,
    newPassword?: string
  ): Promise<{ status: string; message: string; user_id: number; temporary_password?: string }> {
    return request(`/api/v1/admin/users/${userId}/reset-password`, {
      method: "POST",
      body: newPassword ? JSON.stringify({ new_password: newPassword }) : undefined,
    });
  },

  async verifyEmail(
    userId: number
  ): Promise<{ status: string; message: string; user_id: number }> {
    return request(`/api/v1/admin/users/${userId}/verify-email`, {
      method: "POST",
    });
  },
};

