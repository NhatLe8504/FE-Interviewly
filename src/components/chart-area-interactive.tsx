"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useGetPaymentsQuery } from "@/redux/api/admin/paymentApi"
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

type RevenuePoint = {
  date: string
  revenue: number
}

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { data: paymentsData, isLoading, isError } = useGetPaymentsQuery({ limit: 100 })

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const filteredData = React.useMemo<RevenuePoint[]>(() => {
    const daysToInclude = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const revenueByDate = new Map<string, number>()

    for (let index = daysToInclude - 1; index >= 0; index -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - index)
      revenueByDate.set(getDateKey(date), 0)
    }

    for (const transaction of paymentsData?.items ?? []) {
      if (transaction.status?.toLowerCase() !== "success") continue
      const transactionDate = transaction.paid_at || transaction.created_at
      if (!transactionDate) continue

      const key = getDateKey(new Date(transactionDate))
      if (revenueByDate.has(key)) {
        revenueByDate.set(key, (revenueByDate.get(key) || 0) + transaction.amount)
      }
    }

    return Array.from(revenueByDate, ([date, revenue]) => ({ date, revenue }))
  }, [paymentsData?.items, timeRange])

  const rangeRevenue = filteredData.reduce((total, point) => total + point.revenue, 0)
  const successfulPayments = (paymentsData?.items ?? []).filter(
    (transaction) => transaction.status?.toLowerCase() === "success"
  ).length
  const rangeLabel = timeRange === "30d" ? "30 ngày qua" : timeRange === "7d" ? "7 ngày qua" : "3 tháng qua"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Doanh thu theo thời gian</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Giao dịch thành công trong {rangeLabel.toLowerCase()}
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
            <ToggleGroupItem value="90d">3 tháng qua</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 ngày qua</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 ngày qua</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue placeholder="3 tháng qua" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">3 tháng qua</SelectItem>
              <SelectItem value="30d" className="rounded-lg">30 ngày qua</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-3 flex items-center justify-between gap-3 px-2 text-sm sm:px-0">
          <span className="text-muted-foreground">Tổng trong kỳ</span>
          <span className="font-semibold tabular-nums">
            {isLoading ? "Đang tải..." : isError ? "Không tải được dữ liệu" : formatCurrency(rangeRevenue)}
          </span>
          <span className="text-muted-foreground">{successfulPayments} giao dịch thành công</span>
        </div>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.85} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDateLabel}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDateLabel(String(value))}
                  formatter={(value) => (
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrency(Number(value))}
                    </span>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
