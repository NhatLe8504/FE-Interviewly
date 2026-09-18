"use client";

import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Briefcase,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
} from "lucide-react";
import type {
  DomainStatItem,
  RoleStatItem,
  LevelStatItem,
} from "./types";

interface OnboardingStatsSectionProps {
  domains: DomainStatItem[];
  roles: RoleStatItem[];
  levels: LevelStatItem[];
}

export function OnboardingStatsSection({
  domains,
  roles,
  levels,
}: OnboardingStatsSectionProps) {
  const [activeTab, setActiveTab] = useState("domains");

  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card shadow-xs border bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b bg-muted/20">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              <span>Phân Tích Tỉ Lệ Ngành Nghề, Chức Danh &amp; Cấp Bậc</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Thống kê cơ cấu ngành nghề mục tiêu, chức danh vị trí hot nhất và phân bổ trình độ ứng viên
            </CardDescription>
          </div>

          <CardAction>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 h-8 text-xs">
                <TabsTrigger value="domains" className="text-xs px-2.5">
                  <Briefcase className="size-3 mr-1.5 hidden sm:inline" />
                  Ngành nghề
                </TabsTrigger>
                <TabsTrigger value="roles" className="text-xs px-2.5">
                  <Layers className="size-3 mr-1.5 hidden sm:inline" />
                  Chức danh
                </TabsTrigger>
                <TabsTrigger value="levels" className="text-xs px-2.5">
                  <GraduationCap className="size-3 mr-1.5 hidden sm:inline" />
                  Cấp bậc
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardAction>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* TAB 1: DOMAINS DISTRIBUTION */}
          {activeTab === "domains" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tỉ lệ lựa chọn ngành nghề của 1,448 ứng viên đã onboard:</span>
                <span>Cập nhật thời gian thực</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain) => (
                  <div
                    key={domain.domain_id}
                    className="p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: domain.color }}
                        />
                        <span className="font-bold text-xs text-foreground">
                          {domain.domain_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <strong className="text-foreground">{domain.user_count}</strong>
                        <span className="text-muted-foreground">({domain.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${domain.percentage}%`,
                          backgroundColor: domain.color,
                        }}
                      />
                    </div>

                    {/* Top roles under this domain */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] text-muted-foreground mr-1">Vị trí hot:</span>
                      {domain.top_roles.map((r, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-normal"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROLES & POSITIONS */}
          {activeTab === "roles" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground mb-1">
                Top 10 vị trí / chức danh công việc được ứng viên chọn nhiều nhất khi đăng ký:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role, idx) => (
                  <div
                    key={role.role_id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-5 rounded-md bg-muted flex items-center justify-center font-mono font-bold text-[10px] text-muted-foreground shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{role.role_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{role.domain_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-right pl-3">
                      <div>
                        <span className="font-bold text-foreground block">{role.user_count}</span>
                        <span className="text-[10px] text-muted-foreground">{role.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE LEVELS */}
          {activeTab === "levels" && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Phân bổ trình độ và số năm kinh nghiệm thực tế của ứng viên:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {levels.map((lvl) => (
                  <div
                    key={lvl.level_key}
                    className="p-4 rounded-xl border bg-card text-center space-y-2 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: lvl.color }}
                    />
                    <Badge
                      variant="outline"
                      className="capitalize font-semibold text-xs mb-1"
                      style={{ borderColor: `${lvl.color}40`, color: lvl.color }}
                    >
                      {lvl.level_key}
                    </Badge>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {lvl.user_count.toLocaleString("vi-VN")}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{lvl.percentage}% tổng ứng viên</p>
                    <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                      {lvl.level_label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}