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
import { ActivityIcon, DatabaseIcon, TrendingUpIcon, UsersIcon } from "lucide-react"

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "—"
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
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng người dùng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(data?.total_users)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <UsersIcon />
              {isLoading || isError ? "—" : "Toàn hệ thống"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCount(data?.active_users)} tài khoản đang hoạt động{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Bao gồm cả tài khoản mới đăng ký</div>
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
              <ActivityIcon />
              {isLoading || isError ? "—" : `${activeRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatCount(data?.total_users)} tài khoản tổng cộng{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tỷ lệ người dùng đang hoạt động</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Phiên phỏng vấn hoàn tất</CardDescription>
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
          <div className="text-muted-foreground">Tỷ lệ hoàn thành phiên phỏng vấn</div>
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
            <DatabaseIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Nội dung phục vụ các phiên phỏng vấn</div>
        </CardFooter>
      </Card>
    </div>
  )
}
