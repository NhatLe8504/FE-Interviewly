"use client";

import React from "react";
import {
  AuditLogSectionCards,
  ServerTerminalLog,
  AuditLogDataTable,
} from "@/components/admin/audit-logs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileClock, RefreshCw, ShieldCheck, Terminal, Globe, Server } from "lucide-react";
import { toast } from "sonner";
import { useGetServerLogsQuery, useGetAuditLogsQuery } from "@/redux/api/admin/auditApi";

export function AuditLogsClient() {
  // 100% REAL BACKEND DATA: Poll server logs every 5000ms (5 seconds)
  const {
    data: serverLogsData,
    isLoading: isServerLogsLoading,
    isFetching: isServerLogsFetching,
    refetch: refetchServerLogs,
  } = useGetServerLogsQuery(undefined, {
    pollingInterval: 5000,
  });

  // Query database audit logs for mutation counts
  const {
    data: dbAuditData,
    refetch: refetchDbAudit,
  } = useGetAuditLogsQuery({ limit: 10 });

  const handleManualRefresh = () => {
    refetchServerLogs();
    refetchDbAudit();
    toast.success("Đã đồng bộ và làm mới dữ liệu nhật ký server thời gian thực!");
  };

  const routes = serverLogsData?.routes || [];
  const terminalLines = serverLogsData?.terminal_lines || [];
  const stats = serverLogsData?.stats;
  const totalDbAudits = dbAuditData?.total || 0;

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs border border-primary/20">
            <Server className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Nhật ký Tuyến đường API &amp; Console Server
              </h1>
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold text-xs px-2 py-0.5"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 5s Polling
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                Lưu 10 phút gần đây
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Giám sát lưu lượng API, trạng thái response HTTP và log console máy chủ thời gian thực (100% dữ liệu thật từ Backend).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isServerLogsFetching}
            className="gap-1.5 text-xs h-8"
            title="Tải lại ngay lập tức từ backend"
          >
            <RefreshCw className={`size-3.5 ${isServerLogsFetching ? "animate-spin" : ""}`} />
            <span>{isServerLogsFetching ? "Đang cập nhật..." : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
        {/* Section Cards: Real 24h Traffic KPIs */}
        <AuditLogSectionCards
          stats={stats}
          totalDbAudits={totalDbAudits}
        />

        {/* Real-time Server Terminal Log Console (Updates every 5 seconds) */}
        <div className="px-4 lg:px-6">
          <ServerTerminalLog
            lines={terminalLines}
            isFetching={isServerLogsFetching}
            onRefresh={refetchServerLogs}
            retentionMinutes={stats?.retention_minutes ?? 10}
            uptimeSeconds={stats?.uptime_seconds ?? 0}
          />
        </div>

        {/* Route Logs Data Table & Response Statuses */}
        <AuditLogDataTable
          items={routes}
          isLoading={isServerLogsLoading}
          isFetching={isServerLogsFetching}
          onRefresh={refetchServerLogs}
        />
      </div>
    </div>
  );
}