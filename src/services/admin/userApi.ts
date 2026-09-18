import { store } from "@/redux/store";
import { adminUserApiSlice } from "@/redux/api/admin/userApi";
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
};
