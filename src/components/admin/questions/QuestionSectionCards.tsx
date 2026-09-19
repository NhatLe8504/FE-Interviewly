"use client";

import React from "react";
import { Badge } from "@/components/admin/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  TrendingUpIcon,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function QuestionSectionCards({
  totalQuestions = 1280,
  approvedCount = 1154,
  pendingCount = 86,
  totalPracticeSessions = 45678,
  starCoverageRate = 96.5,
}: {
  totalQuestions?: number;
  approvedCount?: number;
  pendingCount?: number;
  totalPracticeSessions?: number;
  starCoverageRate?: number;
}) {
  const approvalRate =
    totalQuestions > 0 ? ((approvedCount / totalQuestions) * 100).toFixed(1) : "90.2";

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Card 1: Total Questions */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng Số Câu Hỏi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalQuestions.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs gap-1">
              <TrendingUpIcon className="size-3 text-emerald-500" />
              +14.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kho đề phỏng vấn đa ngành{" "}
            <HelpCircle className="size-4 text-primary" />
          </div>
          <div className="text-muted-foreground">
            Bao gồm IT, Finance, Marketing, Sales & HR
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Approved Questions */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Đã Phê Duyệt</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-400">
            {approvedCount.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
              {approvalRate}% đã duyệt
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sẵn sàng cho ứng viên luyện tập{" "}
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Đạt chuẩn kiểm duyệt chuyên môn
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Pending Review */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Chờ Kiểm Duyệt</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-600 dark:text-amber-400">
            {pendingCount.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">
              Cần xử lý
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Đóng góp từ AI & Cộng đồng{" "}
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-muted-foreground">
            Cần gán nhãn STAR và thẩm định Rubric
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Practice Sessions */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng Lượt Luyện Tập</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPracticeSessions.toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              {starCoverageRate}% có STAR
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tương tác AI Coach tích cực{" "}
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="text-muted-foreground">
            Tăng 18.5% so với chu kỳ trước
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
