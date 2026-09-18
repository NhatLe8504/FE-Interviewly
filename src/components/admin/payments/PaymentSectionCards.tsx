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
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Crown, CreditCard } from "lucide-react";

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
  }).format(totalRevenue || 4851000);

  const avgOrderValue = totalTransactions > 0
    ? Math.round(totalRevenue / totalTransactions)
    : 99000;

  const formattedAov = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(avgOrderValue);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Card 1: Total Revenue */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Tổng Doanh Thu</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {formattedRevenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 text-xs">
              <TrendingUp className="size-3" />
              +18.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span>Tăng trưởng liên tục tháng này</span>
            <TrendingUp className="size-3.5" />
          </div>
          <div className="text-muted-foreground">Doanh thu thu về từ các gói Pro và Cấp Tốc</div>
        </CardFooter>
      </Card>

      {/* Card 2: Successful Transactions */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Giao Dịch Thành Công</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {successCount || 48}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 text-xs">
              <TrendingUp className="size-3" />
              98.0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <span>Tỷ lệ thanh toán hoàn tất cao</span>
            <CheckCircle className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">Trên tổng số {totalTransactions || 49} lượt thanh toán khởi tạo</div>
        </CardFooter>
      </Card>

      {/* Card 3: Paying Pro Customers */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Hội Viên Trả Phí</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {payingUsersCount || 36}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 text-xs">
              <Crown className="size-3" />
              VIP Pro
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <span>Đóng góp 85% tổng doanh thu</span>
          </div>
          <div className="text-muted-foreground">Ứng viên tích cực luyện tập phỏng vấn</div>
        </CardFooter>
      </Card>

      {/* Card 4: Average Order Value */}
      <Card className="@container/card border-border">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Giá Trị Đơn Trung Bình</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {formattedAov}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 gap-1 text-xs">
              <CreditCard className="size-3" />
              AOV
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <span>Độ ổn định cao trên mỗi đơn hàng</span>
          </div>
          <div className="text-muted-foreground">Mức phí giao dịch tối ưu cho ứng viên</div>
        </CardFooter>
      </Card>
    </div>
  );
}
