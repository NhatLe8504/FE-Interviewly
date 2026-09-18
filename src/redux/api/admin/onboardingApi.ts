import { baseApi } from "../baseApi";
import type {
  OnboardingSummaryStats,
  DomainStatItem,
  RoleStatItem,
  LevelStatItem,
  AcquisitionChannelStat,
  OnboardedUserRecord,
} from "@/components/admin/onboarding/types";

export interface AdminOnboardingStatsResponse {
  summary: OnboardingSummaryStats;
  channels: AcquisitionChannelStat[];
  domains: DomainStatItem[];
  roles: RoleStatItem[];
  levels: LevelStatItem[];
  candidates: OnboardedUserRecord[];
}

export const adminOnboardingApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOnboardingStats: builder.query<AdminOnboardingStatsResponse, void>({
      query: () => "/api/v1/admin/onboarding/stats",
      providesTags: ["AdminStats" as any],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminOnboardingStatsQuery } = adminOnboardingApiSlice;