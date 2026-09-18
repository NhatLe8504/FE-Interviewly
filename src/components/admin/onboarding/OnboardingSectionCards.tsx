"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type { OnboardingSummaryStats } from "./types";

interface OnboardingSectionCardsProps {
  summary: OnboardingSummaryStats;
}

export function OnboardingSectionCards({ summary }: OnboardingSectionCardsProps) {
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Onboarded Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            <span>Ứng viên đã Onboard</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground">
            {summary.total_users_completed.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold text-xs">
              <TrendingUp className="size-3" />
              +16.8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>{summary.total_users_started.toLocaleString("vi-VN")} người dùng bắt đầu</span>
          </div>
          <div className="text-muted-foreground">
            Khảo sát định hướng phỏng vấn thành công
          </div>
        </CardFooter>
      </Card>

      {/* Completion Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Tỷ lệ hoàn thành Onboarding</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-400">
            {summary.overall_completion_rate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold text-xs">
              <TrendingUp className="size-3" />
              Phễu tốt
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Tỷ lệ rơi rụng tổng thể chỉ 10.6%</span>
          </div>
          <div className="text-muted-foreground">
            Nguồn hàng đầu: {summary.top_acquisition_channel}
          </div>
        </CardFooter>
      </Card>

      {/* Average Time Spent */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Clock className="size-4 text-blue-500" />
            <span>Thời gian hoàn tất trung bình</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground">
            {formatSeconds(summary.avg_time_seconds)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-semibold text-xs">
              Nhanh gọn
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Trung bình 6 bước thiết lập</span>
          </div>
          <div className="text-muted-foreground">
            Tối ưu hóa trải nghiệm không gây phiền toái
          </div>
        </CardFooter>
      </Card>

      {/* Top Domain */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Briefcase className="size-4 text-amber-500" />
            <span>Ngành nghề quan tâm số 1</span>
          </CardDescription>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground truncate max-w-[200px]" title={summary.top_domain_name}>
            {summary.top_domain_name}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-semibold text-xs">
              {summary.top_domain_percentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Chiếm gần 50% tổng ứng viên</span>
          </div>
          <div className="text-muted-foreground">
            Theo sau là Marketing (20%) &amp; Tài chính (12%)
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}