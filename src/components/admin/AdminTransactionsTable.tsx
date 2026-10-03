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

type TopUser = {
  key: string
  userId?: number | null
  name: string
  email: string
  transactionCount: number
  totalSpent: number
  latestPlan: string
  lastPayment?: string | null
}

function getUserLabel(transaction: PaymentAdminOut) {
  return transaction.user_name || transaction.user_email || `Người dùng #${transaction.user_id ?? "—"}`
}

function getTopUsers(transactions: PaymentAdminOut[]): TopUser[] {
  const users = new Map<string, TopUser>()

  for (const transaction of transactions) {
    if (transaction.status?.toLowerCase() !== "success") continue

    const key = transaction.user_id
      ? `id:${transaction.user_id}`
      : `email:${transaction.user_email || transaction.transaction_id}`
    const current = users.get(key)
    const transactionDate = transaction.paid_at || transaction.created_at

    if (!current) {
      users.set(key, {
        key,
        userId: transaction.user_id,
        name: getUserLabel(transaction),
        email: transaction.user_email || "",
        transactionCount: 1,
        totalSpent: transaction.amount,
        latestPlan: transaction.plan_name || "Gói Interviewly",
        lastPayment: transactionDate,
      })
      continue
    }

    current.transactionCount += 1
    current.totalSpent += transaction.amount
    if (
      transactionDate &&
      (!current.lastPayment || new Date(transactionDate).getTime() > new Date(current.lastPayment).getTime())
    ) {
      current.lastPayment = transactionDate
      current.latestPlan = transaction.plan_name || current.latestPlan
    }
  }

  return Array.from(users.values())
    .sort((first, second) => second.totalSpent - first.totalSpent)
    .slice(0, 10)
}

export function AdminTransactionsTable() {
  const { data, isLoading, isFetching, isError, refetch } = useGetPaymentsQuery({ limit: 100 })
  const topUsers = getTopUsers(data?.items ?? [])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Top người dùng theo chi tiêu</CardTitle>
        <CardDescription>
          Xếp hạng theo tổng giao dịch thanh toán thành công gần đây.
        </CardDescription>
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
            <Link href="/admin/users">
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
                <TableHead className="text-center">Giao dịch</TableHead>
                <TableHead className="min-w-[150px]">Gói gần nhất</TableHead>
                <TableHead className="text-right">Tổng chi tiêu</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Đang tải dữ liệu người dùng...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không tải được dữ liệu thanh toán.
                  </TableCell>
                </TableRow>
              ) : topUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Chưa có giao dịch thành công để xếp hạng người dùng.
                  </TableCell>
                </TableRow>
              ) : (
                topUsers.map((user, index) => {

                  return (
                    <TableRow key={user.key}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="max-w-[240px] truncate text-xs text-muted-foreground">
                            {user.email || `ID #${user.userId ?? "—"}`}
                          </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold tabular-nums">
                        {user.transactionCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                          {user.latestPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatPrice(user.totalSpent)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatDate(user.lastPayment)}
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
