import { store } from "@/redux/store";
import { adminPaymentApiSlice } from "@/redux/api/admin/paymentApi";
import type {
  PaymentAdminOut,
  PaymentListPageOut,
  PaymentFilterParams,
  XGateSyncResult,
} from "@/types/admin";

export const adminPaymentService = {
  async getPayments(params?: PaymentFilterParams): Promise<PaymentListPageOut> {
    return store.dispatch(adminPaymentApiSlice.endpoints.getPayments.initiate(params)).unwrap();
  },

  async getPayment(transactionId: number): Promise<PaymentAdminOut> {
    return store.dispatch(adminPaymentApiSlice.endpoints.getPayment.initiate(transactionId)).unwrap();
  },

  async syncXGate(): Promise<XGateSyncResult> {
    return store.dispatch(adminPaymentApiSlice.endpoints.syncXGate.initiate()).unwrap();
  },

  async updatePaymentStatus(transactionId: number, status: string): Promise<PaymentAdminOut> {
    return store
      .dispatch(adminPaymentApiSlice.endpoints.updatePaymentStatus.initiate({ transactionId, status }))
      .unwrap();
  },
};
