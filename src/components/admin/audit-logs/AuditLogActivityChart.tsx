"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Activity } from "lucide-react";

// Generate realistic trend data for audit activity
const generateActivityData = () => {
  const points = [];
  const now = new Date("2026-09-19T00:00:00Z");

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Weekly fluctuation pattern
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseMutations = isWeekend ? 15 + Math.floor(Math.random() * 12) : 38 + Math.floor(Math.random() * 25);
    const baseSecurity = isWeekend ? 8 + Math.floor(Math.random() * 10) : 22 + Math.floor(Math.random() * 18);

    points.push({
      date: dateStr,
      mutations: baseMutations,
      security: baseSecurity,
    });
  }

  return points;
};

const activityData = generateActivityData();

const chartConfig = {
  events: {
    label: "Sự kiện",
  },
  mutations: {
    label: "Biến động dữ liệu (CUD)",
    color: "var(--primary)",
  },
  security: {
    label: "Bảo mật & Phân quyền",
    color: "var(--chart-2, #8b5cf6)",
  },
} satisfies ChartConfig;

export function AuditLogActivityChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-09-19T00:00:00Z");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return activityData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [timeRange]);

  return (
    <Card className="@container/card shadow-xs border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span>Xu hướng Hoạt động &amp; Biến động Dữ liệu</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Tần suất các thao tác thay đổi dữ liệu (CUD) và kiểm soát truy cập theo thời gian
          </CardDescription>
        </div>

        <CardAction>
          <div className="hidden sm:block">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(val) => {
                if (val) setTimeRange(val);
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="7d" className="text-xs px-2.5 h-8">
                7 ngày qua
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="text-xs px-2.5 h-8">
                30 ngày qua
              </ToggleGroupItem>
              <ToggleGroupItem value="90d" className="text-xs px-2.5 h-8">
                90 ngày qua
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="sm:hidden w-[130px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
                <SelectItem value="90d">90 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMutations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mutations)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mutations)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillSecurity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-security)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-security)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="security"
              type="natural"
              fill="url(#fillSecurity)"
              stroke="var(--color-security)"
              stackId="a"
            />
            <Area
              dataKey="mutations"
              type="natural"
              fill="url(#fillMutations)"
              stroke="var(--color-mutations)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}