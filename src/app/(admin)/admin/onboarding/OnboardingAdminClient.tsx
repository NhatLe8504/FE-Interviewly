"use client";

import React, { useMemo } from "react";
import {
  OnboardingSectionCards,
  OnboardingStatsSection,
  AcquisitionChannelsSection,
  OnboardedUsersTable,
  MOCK_ONBOARDING_SUMMARY,
  MOCK_DOMAIN_STATS,
  MOCK_ROLE_STATS,
  MOCK_LEVEL_STATS,
  MOCK_ACQUISITION_CHANNELS,
  MOCK_ONBOARDED_USERS,
} from "@/components/admin/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, RefreshCw, Sparkles, Share2, Layers, Database } from "lucide-react";
import { toast } from "sonner";
import { useGetAdminOnboardingStatsQuery } from "@/redux/api/admin/onboardingApi";

export function OnboardingAdminClient() {
  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminOnboardingStatsQuery(undefined, {
    pollingInterval: 10000,
  });

  const summary = useMemo(() => {
    if (apiData?.summary && apiData.summary.total_users_completed > 0) {
      return apiData.summary;
    }
    return MOCK_ONBOARDING_SUMMARY;
  }, [apiData]);

  const channels = useMemo(() => {
    if (apiData?.channels && apiData.channels.length > 0) {
      return apiData.channels;
    }
    return MOCK_ACQUISITION_CHANNELS;
  }, [apiData]);

  const domains = useMemo(() => {
    if (apiData?.domains && apiData.domains.length > 0) {
      return apiData.domains;
    }
    return MOCK_DOMAIN_STATS;
  }, [apiData]);

  const roles = useMemo(() => {
    if (apiData?.roles && apiData.roles.length > 0) {
      return apiData.roles;
    }
    return MOCK_ROLE_STATS;
  }, [apiData]);

  const levels = useMemo(() => {
    if (apiData?.levels && apiData.levels.length > 0) {
      return apiData.levels;
    }
    return MOCK_LEVEL_STATS;
  }, [apiData]);

  const candidates = useMemo(() => {
    if (apiData?.candidates && apiData.candidates.length > 0) {
      return apiData.candidates;
    }
    return MOCK_ONBOARDED_USERS;
  }, [apiData]);

  const handleRefresh = () => {
    refetch();
    toast.success("Đã đồng bộ số liệu khảo sát Onboarding & Kênh Marketing từ CSDL!");
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Top Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs border border-primary/20">
            <Compass className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Khảo Sát Onboarding &amp; Nguồn Tiếp Cận Khách Hàng
              </h1>
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 text-primary bg-primary/10 font-semibold text-xs px-2 py-0.5"
              >
                <Database className="size-3 text-emerald-500" />
                Live Database Data
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {summary.overall_completion_rate}% hoàn thành
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Thu thập tỉ lệ ngành nghề, chức danh vị trí, trình độ kinh nghiệm và phân tích nguồn khách hàng (Facebook, TikTok, YouTube, Gợi ý AI...).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching || isLoading}
            className="gap-1.5 text-xs h-8"
            title="Tính toán và làm mới lại toàn bộ chỉ số onboarding từ CSDL"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Đang đồng bộ..." : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
        {/* Section Cards: Onboarding KPIs */}
        <OnboardingSectionCards summary={summary} />

        {/* Customer Acquisition & Marketing Channels (FB, TikTok, YouTube, AI...) */}
        <AcquisitionChannelsSection channels={channels} />

        {/* Analytics Distribution Section: Domains, Roles, Levels */}
        <OnboardingStatsSection
          domains={domains}
          roles={roles}
          levels={levels}
        />

        {/* Onboarded User Survey Records Table */}
        <OnboardedUsersTable users={candidates} />
      </div>
    </div>
  );
}