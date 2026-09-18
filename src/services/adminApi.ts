import { store } from "@/redux/store";
import { adminApiSlice } from "@/redux/api/adminApi";
import type {
  UserAdminOut,
  UserListPageOut,
  UserAdminCreateIn,
  SystemStatsOut,
  UserFilterParams,
  UserStatus,
  UserRole,
  PaymentAdminOut,
  PaymentListPageOut,
  PaymentFilterParams,
  XGateSyncResult,
} from "@/types/admin";

export const adminApi = {
  async getUsers(params?: UserFilterParams): Promise<UserListPageOut> {
    return store.dispatch(adminApiSlice.endpoints.getUsers.initiate(params)).unwrap();
  },

  async getUser(userId: number): Promise<UserAdminOut> {
    return store.dispatch(adminApiSlice.endpoints.getUser.initiate(userId)).unwrap();
  },

  async createUser(data: UserAdminCreateIn): Promise<UserAdminOut> {
    return store.dispatch(adminApiSlice.endpoints.createUser.initiate(data)).unwrap();
  },

  async updateUserStatus(userId: number, status: UserStatus | string): Promise<UserAdminOut> {
    return store
      .dispatch(adminApiSlice.endpoints.updateUserStatus.initiate({ userId, status }))
      .unwrap();
  },

  async updateUserRole(userId: number, role: UserRole | string): Promise<UserAdminOut> {
    return store
      .dispatch(adminApiSlice.endpoints.updateUserRole.initiate({ userId, role }))
      .unwrap();
  },

  async getAdminStats(): Promise<SystemStatsOut> {
    return store.dispatch(adminApiSlice.endpoints.getAdminStats.initiate()).unwrap();
  },
  async getPayments(params?: PaymentFilterParams): Promise<PaymentListPageOut> {
    return store.dispatch(adminApiSlice.endpoints.getPayments.initiate(params)).unwrap();
  },

  async getPayment(transactionId: number): Promise<PaymentAdminOut> {
    return store.dispatch(adminApiSlice.endpoints.getPayment.initiate(transactionId)).unwrap();
  },

  async syncXGate(): Promise<XGateSyncResult> {
    return store.dispatch(adminApiSlice.endpoints.syncXGate.initiate()).unwrap();
  },

  async updatePaymentStatus(transactionId: number, status: string): Promise<PaymentAdminOut> {
    return store.dispatch(adminApiSlice.endpoints.updatePaymentStatus.initiate({ transactionId, status })).unwrap();
  },

};

// Re-export RTK Query hooks for React component usage
export * from "@/redux/api/adminApi";
