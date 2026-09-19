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
import { useIsMobile } from "@/hooks/use-mobile";
import type { QuestionDailyPoint } from "@/mock/adminQuestionsMock";

const chartConfig = {
  practiceSessions: {
    label: "Lượt luyện tập",
    color: "var(--primary)",
  },
  newQuestions: {
    label: "Câu hỏi mới",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function QuestionInteractiveChart({
  data = [],
}: {
  data: QuestionDailyPoint[];
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    const startStr = startDate.toISOString().split("T")[0];

    return data.filter((item) => item.date >= startStr);
  }, [data, timeRange]);

  const totalFilteredSessions = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.practiceSessions, 0);
  }, [filteredData]);

  const totalFilteredNewQuestions = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.newQuestions, 0);
  }, [filteredData]);

  return (
    <Card className="@container/chart">
      <CardHeader>
        <CardTitle>Xu Hướng Luyện Tập & Bổ Sung Câu Hỏi</CardTitle>
        <CardDescription>
          Thống kê {filteredData.length} ngày gần nhất · {totalFilteredSessions.toLocaleString("vi-VN")} lượt luyện · {totalFilteredNewQuestions} câu hỏi mới
        </CardDescription>
        <CardAction>
          <div className="hidden sm:block">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(val) => val && setTimeRange(val)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="90d">3 tháng</ToggleGroupItem>
              <ToggleGroupItem value="30d">30 ngày</ToggleGroupItem>
              <ToggleGroupItem value="7d">7 ngày</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="sm:hidden">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">3 tháng</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="7d">7 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPractice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillNewQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
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
                  month: "numeric",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              fontSize={11}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="practiceSessions"
              type="natural"
              fill="url(#fillPractice)"
              stroke="var(--primary)"
              strokeWidth={2}
              name="Lượt luyện tập"
            />
            <Area
              dataKey="newQuestions"
              type="natural"
              fill="url(#fillNewQuestions)"
              stroke="var(--chart-2)"
              strokeWidth={2}
              name="Câu hỏi mới"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
