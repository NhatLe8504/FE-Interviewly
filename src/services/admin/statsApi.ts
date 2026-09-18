import { store } from "@/redux/store";
import { adminStatsApiSlice } from "@/redux/api/admin/statsApi";
import type { SystemStatsOut } from "@/types/admin";

export const adminStatsService = {
  async getAdminStats(): Promise<SystemStatsOut> {
    return store.dispatch(adminStatsApiSlice.endpoints.getAdminStats.initiate()).unwrap();
  },
};
