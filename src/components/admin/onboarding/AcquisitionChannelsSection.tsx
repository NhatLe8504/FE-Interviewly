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
  Share2,
  TrendingUp,
  Award,
  Zap,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { ChannelBrandIcon } from "./BrandLogos";
import type { AcquisitionChannelStat } from "./types";

interface AcquisitionChannelsSectionProps {
  channels: AcquisitionChannelStat[];
}

export function AcquisitionChannelsSection({
  channels,
}: AcquisitionChannelsSectionProps) {
  const [selectedChannelKey, setSelectedChannelKey] = useState<string | null>(null);

  const totalUsers = channels.reduce((acc, c) => acc + c.user_count, 0);

  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card shadow-xs border bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b bg-muted/20">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Share2 className="size-4 text-primary" />
                <span>Nguồn Tiếp Cận &amp; Kênh Quảng Cáo (Marketing &amp; Acquisition Channels)</span>
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-semibold text-xs">
                Kênh Marketing
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Thống kê nguồn ứng viên biết đến hệ thống từ khảo sát Onboarding: Facebook, TikTok, YouTube, Gợi ý AI, Google Search và Giới thiệu
            </CardDescription>
          </div>

          <CardAction className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {totalUsers.toLocaleString("vi-VN")} phản hồi
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Phân bổ lưu lượng người dùng mới theo kênh tiếp thị &amp; quảng cáo:</span>
            <span className="font-semibold text-foreground">TikTok (+48%) &amp; Gợi ý AI (+65%) tăng trưởng mạnh nhất</span>
          </div>

          {/* Channels Grid with authentic brand logos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {channels.map((chan) => {
              const isSelected = selectedChannelKey === chan.channel_key;
              return (
                <div
                  key={chan.channel_key}
                  onClick={() =>
                    setSelectedChannelKey(isSelected ? null : chan.channel_key)
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "bg-card hover:bg-muted/40 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Authentic Brand App Icon */}
                      <div className="size-11 rounded-xl bg-background border shadow-xs flex items-center justify-center shrink-0 p-1">
                        <ChannelBrandIcon channelKey={chan.channel_key} className="size-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground truncate max-w-[150px]">
                          {chan.channel_name.split("(")[0].trim()}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold"
                        >
                          {chan.growth_rate}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-base font-black text-foreground block">
                        {chan.percentage}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {chan.user_count} ứng viên
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden my-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${chan.percentage}%`,
                        backgroundColor: chan.color,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {chan.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Tỷ lệ nâng cấp PRO:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Zap className="size-3" />
                      {chan.pro_conversion_rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}