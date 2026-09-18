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
import { TrendingUpIcon, CheckCircle2, Crown, CreditCard } from "lucide-react";

export function PaymentSectionCards({
  totalRevenue = 0,
  successCount = 0,
  totalTransactions = 0,
  payingUsersCount = 0,
}: {
  totalRevenue?: number;
  successCount?: number;
  totalTransactions?: number;
  payingUsersCount?: number;
}) {
  const formattedRevenue = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalRevenue || 0);

  const avgOrderValue =
    successCount > 0 ? Math.round(totalRevenue / successCount) : 0;

  const formattedAov = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(avgOrderValue);

  const successRate =
    totalTransactions > 0
      ? Math.round((successCount / totalTransactions) * 100)
      : 100;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Card 1: Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng Doanh Thu</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedRevenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              Thực thu
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Thu từ các gói dịch vụ{" "}
            <TrendingUpIcon className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Tính trên các giao dịch thành công
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Successful Transactions */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Giao Dịch Thành Công</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {successCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              {successRate}% tỷ lệ
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {successCount} / {totalTransactions} giao dịch{" "}
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Khởi tạo qua các cổng thanh toán
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Paying Pro Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Khách Hàng Trả Phí</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {payingUsersCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              Tài khoản VIP
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ứng viên kích hoạt gói{" "}
            <Crown className="size-4 text-amber-500" />
          </div>
          <div className="text-muted-foreground">
            Tài khoản đã nâng cấp Pro hoặc Cấp Tốc
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Average Order Value */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Giá Trị Đơn Trung Bình (AOV)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedAov}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              Bình quân
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Chi tiêu trên mỗi đơn{" "}
            <CreditCard className="size-4 text-primary" />
          </div>
          <div className="text-muted-foreground">
            Tính trên các hóa đơn đã thanh toán
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
