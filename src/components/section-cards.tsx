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
import { useGetServerLogsQuery } from "@/redux/api/admin/auditApi"
import { useGetAdminStatsQuery } from "@/redux/api/admin/statsApi"
import { ActivityIcon, DatabaseIcon, GaugeIcon, TrendingUpIcon } from "lucide-react"

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "—"
}

function formatDuration(value?: number) {
  return typeof value === "number" ? `${Math.round(value)} ms` : "—"
}

export function SectionCards() {
  const { data, isLoading, isError } = useGetAdminStatsQuery()
  const { data: serverLogsData } = useGetServerLogsQuery({ limit: 1 })
  const activeRate =
    data && data.total_users > 0
      ? Math.round((data.active_users / data.total_users) * 100)
      : 0
  const completionRate =
    data && data.total_sessions > 0
      ? Math.round((data.completed_sessions / data.total_sessions) * 100)
      : 0
  const requestStats = serverLogsData?.stats
  const apiHealthRate =
    requestStats && requestStats.total_requests > 0
      ? Math.round((requestStats.success_count / requestStats.total_requests) * 100)
      : 0
  const statusLabel = isLoading ? "Đang tải" : isError ? "Lỗi dữ liệu" : "Trực tiếp"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Người dùng hoạt động</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.active_users)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ActivityIcon />
              {isLoading || isError ? "—" : `${activeRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCount(data?.active_users)} / {formatCount(data?.total_users)} tài khoản{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tỷ lệ tài khoản đang hoạt động</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Phiên đã hoàn tất</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.completed_sessions)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {isLoading || isError ? "—" : `${completionRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCount(data?.total_sessions)} phiên luyện tập{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tỷ lệ hoàn thành phỏng vấn</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Kho câu hỏi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.total_questions)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <DatabaseIcon />
              Nội dung
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sẵn sàng cho luyện tập{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tổng số câu hỏi trong hệ thống</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sức khỏe API</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {requestStats ? `${apiHealthRate}%` : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <GaugeIcon />
              {requestStats ? `${requestStats.total_requests} requests` : statusLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Phản hồi trung bình {formatDuration(requestStats?.avg_duration_ms)}{" "}
            <GaugeIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tỷ lệ request không lỗi gần đây</div>
        </CardFooter>
      </Card>
    </div>
  )
}
