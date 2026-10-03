"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGetAdminStatsQuery } from "@/redux/api/admin/statsApi"
import { TrendingUpIcon } from "lucide-react"

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "—"
}

function formatRevenue(value?: number) {
  if (typeof value !== "number") return "—"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function SectionCards() {
  const { data, isLoading, isError } = useGetAdminStatsQuery()
  const activeRate =
    data && data.total_users > 0
      ? Math.round((data.active_users / data.total_users) * 100)
      : 0
  const completionRate =
    data && data.total_sessions > 0
      ? Math.round((data.completed_sessions / data.total_sessions) * 100)
      : 0
  const statusLabel = isLoading ? "Đang tải" : isError ? "Lỗi dữ liệu" : "Trực tiếp"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRevenue(data?.total_revenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {statusLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Doanh thu giao dịch thành công{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Cập nhật từ hệ thống thanh toán
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Người dùng hoạt động</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.active_users)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {isLoading || isError ? "—" : `${activeRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tài khoản đang hoạt động{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Tỷ lệ trên tổng số người dùng
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Phiên phỏng vấn</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.total_sessions)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {isLoading || isError ? "—" : `${completionRate}% hoàn tất`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCount(data?.completed_sessions)} phiên đã hoàn tất{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Theo dõi hoạt động luyện tập</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng người dùng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.total_users)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {formatCount(data?.total_questions)} câu hỏi
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kho nội dung đang vận hành{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Số liệu được lấy trực tiếp từ hệ thống</div>
        </CardFooter>
      </Card>
    </div>
  )
}
