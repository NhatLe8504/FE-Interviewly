"use client"

import {
  ActivityIcon,
  CircleHelpIcon,
  CircleDollarSignIcon,
  UserCheckIcon,
} from "lucide-react"

import { useGetAdminStatsQuery } from "@/redux/api/admin/statsApi"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "—"
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getRate(value?: number, total?: number) {
  if (!value || !total) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

export function AdminSystemOverview() {
  const { data, isLoading, isError } = useGetAdminStatsQuery()
  const activeRate = getRate(data?.active_users, data?.total_users)
  const completionRate = getRate(data?.completed_sessions, data?.total_sessions)

  return (
    <section className="px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Chỉ số hệ thống</CardTitle>
          <CardDescription>
            Theo dõi nhanh mức độ hoạt động của Interviewly.
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              <ActivityIcon aria-hidden="true" />
              {isLoading ? "Đang tải" : isError ? "Không khả dụng" : "Dữ liệu trực tiếp"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-6 @4xl/card:grid-cols-[1.2fr_1.2fr_0.8fr]">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <UserCheckIcon className="size-4 text-primary" aria-hidden="true" />
                Người dùng hoạt động
              </span>
              <span className="font-semibold tabular-nums">
                {formatCount(data?.active_users)} / {formatCount(data?.total_users)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${activeRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{activeRate}% tổng tài khoản</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <ActivityIcon className="size-4 text-emerald-600" aria-hidden="true" />
                Phiên đã hoàn tất
              </span>
              <span className="font-semibold tabular-nums">
                {formatCount(data?.completed_sessions)} / {formatCount(data?.total_sessions)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{completionRate}% tổng phiên</p>
          </div>

          <div className="grid grid-cols-2 gap-4 @4xl/card:grid-cols-1">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CircleHelpIcon className="size-3.5 text-violet-500" aria-hidden="true" />
                Ngân hàng câu hỏi
              </p>
              <p className="text-xl font-semibold tabular-nums">{formatCount(data?.total_questions)}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CircleDollarSignIcon className="size-3.5 text-amber-500" aria-hidden="true" />
                Tổng doanh thu
              </p>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(data?.total_revenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
