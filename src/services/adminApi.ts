import { adminUserService } from "./admin/userApi";
import { adminPaymentService } from "./admin/paymentApi";
import { adminStatsService } from "./admin/statsApi";

export const adminApi = {
  ...adminUserService,
  ...adminPaymentService,
  ...adminStatsService,
};

export * from "@/redux/api/admin";
export * from "./admin";
