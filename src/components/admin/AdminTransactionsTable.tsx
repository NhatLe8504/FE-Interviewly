"use client"

import Link from "next/link"
import { ArrowUpRightIcon, RefreshCwIcon } from "lucide-react"

import { useGetPaymentsQuery } from "@/redux/api/admin/paymentApi"
import type { PaymentAdminOut } from "@/types/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatPrice(amount: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency === "VND" ? "VND" : "USD",
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount)
}

function formatDate(value?: string | null) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getStatus(status: PaymentAdminOut["status"]) {
  switch (status?.toLowerCase()) {
    case "success":
      return { label: "Thành công", className: "text-emerald-600 border-emerald-200 bg-emerald-50" }
    case "pending":
      return { label: "Đang chờ", className: "text-amber-600 border-amber-200 bg-amber-50" }
    case "refunded":
      return { label: "Đã hoàn tiền", className: "text-sky-600 border-sky-200 bg-sky-50" }
    default:
      return { label: "Thất bại", className: "text-destructive border-destructive/20 bg-destructive/5" }
  }
}

function getUserLabel(transaction: PaymentAdminOut) {
  return transaction.user_name || transaction.user_email || `Người dùng #${transaction.user_id ?? "—"}`
}

export function AdminTransactionsTable() {
  const { data, isLoading, isFetching, isError, refetch } = useGetPaymentsQuery({ limit: 10 })
  const transactions = data?.items ?? []

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Giao dịch gần đây</CardTitle>
        <CardDescription>10 giao dịch mới nhất trong hệ thống thanh toán.</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCwIcon className={isFetching ? "size-4 animate-spin" : "size-4"} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/admin/payments">
              <span className="hidden sm:inline">Xem tất cả</span>
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[220px]">Người dùng</TableHead>
                <TableHead className="min-w-[150px]">Gói dịch vụ</TableHead>
                <TableHead className="min-w-[120px]">Cổng thanh toán</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Đang tải giao dịch...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tải được dữ liệu giao dịch.
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Chưa có giao dịch nào.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const status = getStatus(transaction.status)

                  return (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-foreground">
                            {getUserLabel(transaction)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{transaction.transaction_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {transaction.plan_name || "Gói Interviewly"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(transaction.payment_gateway || transaction.bank_code || "—").toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatPrice(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatDate(transaction.paid_at || transaction.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
