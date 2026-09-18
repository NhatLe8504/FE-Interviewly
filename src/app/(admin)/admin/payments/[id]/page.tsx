"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Shield,
  Coins,
} from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/admin/ui/avatar";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { AdminPageHeader } from "@/components/admin";
import { useGetPaymentQuery } from "@/redux/api/admin/paymentApi";

export default function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const txnId = parseInt(resolvedParams.id, 10);

  const { data: txn, isLoading, isFetching, refetch, error } = useGetPaymentQuery(txnId, {
    skip: isNaN(txnId),
  });

  const formatPrice = (amount?: number, currency: string = "VND") => {
    if (typeof amount !== "number") return "--";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency === "VND" ? "VND" : "USD",
    }).format(amount);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "--";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };


  const getBankDetails = (bankCode?: string | null) => {
    const code = (bankCode || "MB").toUpperCase();
    const banks: Record<string, { name: string; logo: string; short: string }> = {
      MB: { name: "MB Bank", short: "MB", logo: "https://api.vietqr.io/img/MB.png" },
      VCB: { name: "Vietcombank", short: "VCB", logo: "https://api.vietqr.io/img/VCB.png" },
      BIDV: { name: "BIDV", short: "BIDV", logo: "https://api.vietqr.io/img/BIDV.png" },
      TCB: { name: "Techcombank", short: "TCB", logo: "https://api.vietqr.io/img/TCB.png" },
      VPB: { name: "VPBank", short: "VPB", logo: "https://api.vietqr.io/img/VPB.png" },
      MOMO: { name: "Ví MoMo", short: "MOMO", logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" },
    };
    return (
      banks[code] || {
        name: `${code} Bank`,
        short: code.slice(0, 3),
        logo: `https://api.vietqr.io/img/${code}.png`,
      }
    );
  };

  const isSuccess = txn?.status?.toLowerCase() === "success";
  const isPending = txn?.status?.toLowerCase() === "pending";

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-5xl mx-auto w-full">
      <AdminPageHeader
        title={txn ? `Chi Tiết Giao Dịch #${txn.transaction_id}` : "Chi Tiết Giao Dịch"}
        backHref="/admin/payments"
        backLabel="Quay lại danh sách thanh toán"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>
      </AdminPageHeader>

      {isLoading ? (
        <Card className="p-12 text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm font-medium text-foreground">Đang tải chi tiết hóa đơn giao dịch...</p>
        </Card>
      ) : error || !txn ? (
        <Card className="p-12 text-center border-destructive/30 shadow-lg">
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1.5">
            Không tìm thấy giao dịch #{txnId}
          </h2>
          <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Mã giao dịch này không tồn tại trong hệ thống hoặc đã bị hủy bỏ.
          </p>
          <Button size="sm" asChild className="text-xs">
            <Link href="/admin/payments">Về danh sách thanh toán</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main Transaction Summary Banner */}
          <Card className="overflow-hidden shadow-xs border-border">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/5 border-b p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Receipt className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold text-foreground">
                        Giao dịch #{txn.transaction_id}
                      </CardTitle>
                      <Badge
                        variant={isSuccess ? "default" : isPending ? "secondary" : "destructive"}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isSuccess ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-destructive"
                          }`}
                        />
                        {isSuccess ? "Thành công" : isPending ? "Đang chờ" : "Thất bại"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      Mã tham chiếu cổng: <span className="font-mono font-semibold text-foreground">{txn.gateway_transaction_id}</span>
                    </CardDescription>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Tổng tiền thanh toán</p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">
                    {formatPrice(txn.amount, txn.currency)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-3.5 text-xs">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
                  <CreditCard className="size-4 text-primary" />
                  <span>Thông Tin Thanh Toán</span>
                </h3>

                                <div className="flex justify-between py-1 border-b items-center">
                  <span className="text-muted-foreground">TK chuyển tới:</span>
                  {(() => {
                    const bank = getBankDetails(txn.sender_bank);
                    const accNo = txn.sender_account || "Chưa ghi nhận";
                    return (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7 rounded-lg border border-border bg-white dark:bg-zinc-900 shrink-0 after:hidden p-0.5 shadow-2xs">
                          <AvatarImage src={bank.logo} alt={bank.name} className="size-full object-contain rounded-none" />
                          <AvatarFallback className="rounded-md text-[9px] font-bold bg-muted text-muted-foreground uppercase size-full flex items-center justify-center">
                            {bank.short}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">{bank.name} - </span>
                        <span className="font-mono font-bold text-foreground">{accNo}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Cổng thanh toán:</span>
                  <Badge variant="secondary" className="uppercase font-bold text-[10px] tracking-wider">
                    {txn.payment_gateway}
                  </Badge>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Gói cước kích hoạt:</span>
                  <Badge variant="outline" className="font-semibold text-foreground">
                    {txn.plan_name || "Gói Pro"}
                  </Badge>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Thời gian khởi tạo:</span>
                  <span className="text-foreground">{formatDate(txn.created_at)}</span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Thời gian hoàn tất:</span>
                  <span className="text-foreground font-medium">{formatDate(txn.paid_at)}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Mã gói thuê bao (Subscription ID):</span>
                  <span className="font-mono font-bold text-foreground">#{txn.user_subscription_id}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3.5 text-xs">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
                  <User className="size-4 text-primary" />
                  <span>Thông Tin Khách Hàng</span>
                </h3>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Mã ID khách hàng:</span>
                  <span className="font-mono font-bold text-foreground">
                    {txn.user_id ? `#${txn.user_id}` : "--"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Tên người dùng:</span>
                  <span className="font-semibold text-foreground">{txn.user_name || "Khách hàng"}</span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{txn.user_email || "--"}</span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Loại tiền tệ:</span>
                  <span className="font-bold uppercase text-foreground">{txn.currency}</span>
                </div>

                <div className="pt-2">
                  {txn.user_id && (
                    <Button variant="outline" size="sm" asChild className="w-full text-xs">
                      <Link href={`/admin/users/${txn.user_id}`}>
                        Xem hồ sơ khách hàng #{txn.user_id}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
