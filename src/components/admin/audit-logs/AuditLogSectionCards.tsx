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
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Database,
} from "lucide-react";

interface AuditLogSectionCardsProps {
  stats?: {
    total_requests: number;
    success_count: number;
    client_error_count: number;
    server_error_count: number;
    avg_duration_ms: number;
    retention_minutes?: number;
  };
  totalDbAudits?: number;
}

export function AuditLogSectionCards({
  stats,
  totalDbAudits = 0,
}: AuditLogSectionCardsProps) {
  const totalReq = stats?.total_requests ?? 0;
  const successReq = stats?.success_count ?? 0;
  const clientErr = stats?.client_error_count ?? 0;
  const serverErr = stats?.server_error_count ?? 0;
  const totalErr = clientErr + serverErr;
  const avgDuration = stats?.avg_duration_ms ?? 0;
  const retentionMin = stats?.retention_minutes ?? 10;

  const successRate = totalReq > 0 ? ((successReq / totalReq) * 100).toFixed(1) : "100.0";
  const errorRate = totalReq > 0 ? ((totalErr / totalReq) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total API Requests (Live 10m) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Globe className="size-4 text-primary" />
            <span>Lượt gọi API gần đây</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground">
            {totalReq.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary bg-primary/10 font-semibold text-xs">
              <Clock className="size-3" />
              {retentionMin}m buffer
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Toàn bộ route traffic thời gian thực</span>
          </div>
          <div className="text-muted-foreground">
            {totalDbAudits > 0 ? `${totalDbAudits.toLocaleString("vi-VN")} bản ghi audit trong CSDL` : `Tự động dọn dẹp sau ${retentionMin} phút`}
          </div>
        </CardFooter>
      </Card>

      {/* Success Rate (2xx) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Tỷ lệ Response thành công</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-400">
            {successRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold text-xs">
              <TrendingUp className="size-3" />
              {successReq} OK
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>HTTP Status Code 2xx &amp; 3xx</span>
          </div>
          <div className="text-muted-foreground">
            Hệ thống backend phản hồi ổn định
          </div>
        </CardFooter>
      </Card>

      {/* Errors / Warnings (4xx / 5xx) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-500" />
            <span>Lỗi &amp; Cảnh báo (4xx / 5xx)</span>
          </CardDescription>
          <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${totalErr > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
            {totalErr.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 font-semibold text-xs ${
                totalErr > 0
                  ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                  : "border-slate-300 text-muted-foreground"
              }`}
            >
              {errorRate}% traffic
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>{clientErr} lỗi client (4xx) &bull; {serverErr} lỗi server (5xx)</span>
          </div>
          <div className="text-muted-foreground">
            Theo dõi truy cập trái phép &amp; 404
          </div>
        </CardFooter>
      </Card>

      {/* Average Latency */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Zap className="size-4 text-blue-500" />
            <span>Độ trễ trung bình (Latency)</span>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground">
            {avgDuration} <span className="text-base font-normal text-muted-foreground">ms</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-semibold text-xs">
              <Activity className="size-3" />
              FastAPI
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Thời gian xử lý luồng HTTP pipeline</span>
          </div>
          <div className="text-muted-foreground">
            Bao gồm kết nối DB &amp; Redis Cache
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}