"use client"

import Link from "next/link"
import { ArrowUpRightIcon, RefreshCwIcon } from "lucide-react"

import { useGetAuditLogsQuery } from "@/redux/api/admin/auditApi"
import type { AuditLogOut } from "@/types/admin"
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

function getAction(action: AuditLogOut["action"]) {
  switch (action?.toUpperCase()) {
    case "CREATE":
      return { label: "Tạo mới", className: "text-emerald-600 border-emerald-200 bg-emerald-50" }
    case "UPDATE":
    case "STATUS_CHANGE":
      return { label: "Cập nhật", className: "text-sky-600 border-sky-200 bg-sky-50" }
    case "DELETE":
      return { label: "Xóa", className: "text-destructive border-destructive/20 bg-destructive/5" }
    case "LOGIN":
      return { label: "Đăng nhập", className: "text-violet-600 border-violet-200 bg-violet-50" }
    default:
      return { label: action || "Hoạt động", className: "text-muted-foreground border-border bg-muted/40" }
  }
}

function getActorLabel(log: AuditLogOut) {
  return log.user_id ? `Người dùng #${log.user_id}` : "Hệ thống"
}

function getEventCategory(action: AuditLogOut["action"]) {
  const securityActions = ["LOGIN", "LOGOUT", "PASSWORD_CHANGE", "ROLE_ASSIGN"]

  return securityActions.includes(action?.toUpperCase())
    ? { label: "Bảo mật", className: "text-violet-600 border-violet-200 bg-violet-50" }
    : { label: "Dữ liệu", className: "text-slate-600 border-slate-200 bg-slate-50" }
}

export function AdminTransactionsTable() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAuditLogsQuery({ limit: 10 })
  const auditLogs = data?.items ?? []

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Hoạt động quản trị gần đây</CardTitle>
        <CardDescription>
          10 thay đổi dữ liệu mới nhất trong hệ thống{data?.total ? ` · ${data.total} sự kiện` : ""}.
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
            <Link href="/admin/audit-logs">
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
                <TableHead className="min-w-[180px]">Hoạt động</TableHead>
                <TableHead className="min-w-[170px]">Module / bản ghi</TableHead>
                <TableHead className="min-w-[150px]">Người thực hiện</TableHead>
                <TableHead>Loại sự kiện</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Đang tải hoạt động...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không tải được nhật ký hoạt động.
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Chưa có hoạt động quản trị nào.
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => {
                  const action = getAction(log.action)
                  const category = getEventCategory(log.action)

                  return (
                    <TableRow key={log.audit_id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-foreground">
                            {action.label} bản ghi
                          </p>
                          <p className="max-w-[240px] truncate text-xs text-muted-foreground">
                            Audit #{log.audit_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{log.table_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          Bản ghi #{log.record_id ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getActorLabel(log)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={category.className}>
                          {category.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
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
