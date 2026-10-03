"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useGetServerLogsQuery } from "@/redux/api/admin/auditApi"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type TrafficPoint = {
  minute: string
  requests: number
  errors: number
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "var(--primary)",
  },
  errors: {
    label: "Lỗi response",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

function getMinuteKey(date: Date) {
  date.setSeconds(0, 0)
  return date.getTime().toString()
}

function formatMinuteLabel(value: string) {
  return new Date(Number(value)).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCount(value: number) {
  return value.toLocaleString("vi-VN")
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("10m")
  const { data: serverLogsData, isLoading, isError } = useGetServerLogsQuery({ limit: 100 })

  React.useEffect(() => {
    if (isMobile) setTimeRange("5m")
  }, [isMobile])

  const filteredData = React.useMemo<TrafficPoint[]>(() => {
    const minutesToInclude = timeRange === "1m" ? 1 : timeRange === "5m" ? 5 : 10
    const latestMinute = new Date()
    latestMinute.setSeconds(0, 0)
    const requestsByMinute = new Map<string, TrafficPoint>()

    for (let index = minutesToInclude - 1; index >= 0; index -= 1) {
      const minute = new Date(latestMinute)
      minute.setMinutes(latestMinute.getMinutes() - index)
      const key = getMinuteKey(minute)
      requestsByMinute.set(key, { minute: key, requests: 0, errors: 0 })
    }

    for (const route of serverLogsData?.routes ?? []) {
      const routeDate = new Date(route.timestamp)
      if (Number.isNaN(routeDate.getTime())) continue

      const key = getMinuteKey(routeDate)
      const point = requestsByMinute.get(key)
      if (!point) continue

      point.requests += 1
      if (route.status_code >= 400 || route.status === "failure" || route.level === "ERROR") {
        point.errors += 1
      }
    }

    return Array.from(requestsByMinute.values())
  }, [serverLogsData?.routes, timeRange])

  const requestCount = filteredData.reduce((total, point) => total + point.requests, 0)
  const errorCount = filteredData.reduce((total, point) => total + point.errors, 0)
  const rangeLabel = timeRange === "1m" ? "1 phút qua" : timeRange === "5m" ? "5 phút qua" : "10 phút qua"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Lưu lượng API và lỗi response</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Hoạt động server trong {rangeLabel.toLowerCase()}
          </span>
          <span className="@[540px]/card:hidden">{rangeLabel}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="10m">10 phút qua</ToggleGroupItem>
            <ToggleGroupItem value="5m">5 phút qua</ToggleGroupItem>
            <ToggleGroupItem value="1m">1 phút qua</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue placeholder="10 phút qua" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="10m" className="rounded-lg">10 phút qua</SelectItem>
              <SelectItem value="5m" className="rounded-lg">5 phút qua</SelectItem>
              <SelectItem value="1m" className="rounded-lg">1 phút qua</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-3 flex items-center justify-between gap-3 px-2 text-sm sm:px-0">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Tổng request</span>
            <span className="font-semibold tabular-nums">
              {isLoading ? "Đang tải..." : isError ? "Không tải được dữ liệu" : formatCount(requestCount)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Response lỗi</span>
            <span className="font-semibold tabular-nums text-destructive">{formatCount(errorCount)}</span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={0.85} />
                <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="fillErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-errors)" stopOpacity={0.65} />
                <stop offset="95%" stopColor="var(--color-errors)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="minute"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatMinuteLabel}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatMinuteLabel(String(value))}
                  formatter={(value, name) => (
                    <span className="font-mono font-medium tabular-nums">
                      {formatCount(Number(value))} {name === "errors" ? "lỗi" : "requests"}
                    </span>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="requests"
              type="natural"
              fill="url(#fillRequests)"
              stroke="var(--color-requests)"
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="errors"
              type="natural"
              fill="url(#fillErrors)"
              stroke="var(--color-errors)"
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
