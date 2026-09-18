"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/admin/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/admin/ui/toggle-group";
import { TrendingUp, Coins, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  transactionsCount: number;
}

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--color-revenue, #d98236)",
  },
} satisfies ChartConfig;

export function RevenueAreaChart({
  data,
  totalRevenue = 0,
}: {
  data: DailyRevenuePoint[];
  totalRevenue?: number;
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("30d");

  // Filter data according to timeRange
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [data, timeRange]);

  const rangeTotal = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [filteredData]);

  const formattedRangeTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(rangeTotal || totalRevenue);

  return (
    <Card className="@container/chart overflow-hidden shadow-xs border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Coins className="size-4 text-amber-500" />
              <span>Biểu Đồ Tăng Trưởng Doanh Thu</span>
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Tổng doanh thu phát sinh trong kỳ: <strong className="text-foreground">{formattedRangeTotal}</strong>
          </CardDescription>
        </div>

        <CardAction>
          {isMobile ? (
            <Select value={timeRange} onValueChange={(val) => setTimeRange(val as any)}>
              <SelectTrigger className="w-36 text-xs h-8">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">90 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
                <SelectItem value="7d">7 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(val) => val && setTimeRange(val as any)}
              className="border rounded-lg p-0.5 bg-muted/30"
            >
              <ToggleGroupItem value="90d" className="text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-xs">
                90 ngày qua
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-xs">
                30 ngày qua
              </ToggleGroupItem>
              <ToggleGroupItem value="7d" className="text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-xs">
                7 ngày qua
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d98236" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#d98236" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("vi-VN", {
                  month: "numeric",
                  day: "numeric",
                });
              }}
              className="text-[11px] fill-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "#d98236", strokeWidth: 1.5, strokeDasharray: "4 4" }}
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
                  formatter={(value) => [
                    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Number(value)
                    ),
                    " Doanh thu ngày",
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="#d98236"
              strokeWidth={2.5}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
