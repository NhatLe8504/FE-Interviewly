"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  SlidersHorizontal,
  X,
  Globe,
  Clock,
  Zap,
  Terminal,
  Server,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { ServerRouteLog } from "@/redux/api/admin/auditApi";

interface AuditLogDataTableProps {
  items: ServerRouteLog[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export function AuditLogDataTable({
  items = [],
  isLoading = false,
  isFetching = false,
  onRefresh,
}: AuditLogDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selectedLog, setSelectedLog] = useState<ServerRouteLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Available unique HTTP methods
  const uniqueMethods = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.method) set.add(item.method.toUpperCase());
    });
    return Array.from(set).sort();
  }, [items]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return items.filter((log) => {
      // 1. Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesPath = log.path.toLowerCase().includes(q);
        const matchesMethod = log.method.toLowerCase().includes(q);
        const matchesIp = log.client_ip.toLowerCase().includes(q);
        const matchesStatus = String(log.status_code).includes(q);
        const matchesSummary = log.summary.toLowerCase().includes(q);
        const matchesUser = log.user_id ? String(log.user_id).includes(q) : false;

        if (!matchesPath && !matchesMethod && !matchesIp && !matchesStatus && !matchesSummary && !matchesUser) {
          return false;
        }
      }

      // 2. Method filter
      if (selectedMethod !== "all" && log.method.toUpperCase() !== selectedMethod.toUpperCase()) {
        return false;
      }

      // 3. Status group filter
      if (selectedStatusGroup !== "all") {
        if (selectedStatusGroup === "2xx" && (log.status_code < 200 || log.status_code >= 300)) return false;
        if (selectedStatusGroup === "3xx" && (log.status_code < 300 || log.status_code >= 400)) return false;
        if (selectedStatusGroup === "4xx" && (log.status_code < 400 || log.status_code >= 500)) return false;
        if (selectedStatusGroup === "5xx" && log.status_code < 500) return false;
      }

      return true;
    });
  }, [items, searchTerm, selectedMethod, selectedStatusGroup]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedMethod("all");
    setSelectedStatusGroup("all");
    setPage(1);
    toast.info("Đã đặt lại toàn bộ bộ lọc tìm kiếm.");
  };

  const hasActiveFilters =
    searchTerm !== "" || selectedMethod !== "all" || selectedStatusGroup !== "all";

  // Export CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        "Log ID",
        "Timestamp",
        "Method",
        "Route Path",
        "Query",
        "Status Code",
        "Duration (ms)",
        "Client IP",
        "User ID",
        "User Agent",
      ];

      const rows = filteredLogs.map((log) => [
        `ROUTE-${log.id}`,
        `"${new Date(log.timestamp).toISOString()}"`,
        `"${log.method}"`,
        `"${log.path}"`,
        `"${log.query || ""}"`,
        `"${log.status_code}"`,
        `"${log.duration_ms}"`,
        `"${log.client_ip}"`,
        `"${log.user_id ? log.user_id : "N/A"}"`,
        `"${(log.user_agent || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `interviewly_route_logs_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Đã xuất ${filteredLogs.length} bản ghi route log sang file CSV!`);
    } catch {
      toast.error("Không thể xuất file CSV. Vui lòng thử lại.");
    }
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopied(true);
    toast.success("Đã sao chép chi tiết request route log vào clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Method badge
  const renderMethodBadge = (method: string) => {
    const m = method.toUpperCase();
    switch (m) {
      case "GET":
        return <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20 font-mono text-[11px] px-2 py-0">GET</Badge>;
      case "POST":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-mono text-[11px] px-2 py-0">POST</Badge>;
      case "PUT":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20 font-mono text-[11px] px-2 py-0">PUT</Badge>;
      case "DELETE":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20 font-mono text-[11px] px-2 py-0">DELETE</Badge>;
      case "PATCH":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20 font-mono text-[11px] px-2 py-0">PATCH</Badge>;
      default:
        return <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0">{m}</Badge>;
    }
  };

  // Response status badge
  const renderStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return (
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono text-xs font-bold gap-1">
          <CheckCircle2 className="size-3" />
          <span>{code} OK</span>
        </Badge>
      );
    }
    if (code >= 400 && code < 500) {
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono text-xs font-bold gap-1">
          <AlertTriangle className="size-3" />
          <span>{code}</span>
        </Badge>
      );
    }
    if (code >= 500) {
      return (
        <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 font-mono text-xs font-bold gap-1">
          <XCircle className="size-3" />
          <span>{code} ERR</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {code}
      </Badge>
    );
  };

  // Latency duration pill
  const renderLatency = (ms: number) => {
    const formatted = `${ms.toFixed(1)}ms`;
    if (ms < 50) {
      return <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatted}</span>;
    }
    if (ms < 250) {
      return <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">{formatted}</span>;
    }
    return <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{formatted}</span>;
  };

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Search & Filter Bar */}
      <Card className="shadow-xs border bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Route Path / IP */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Tìm theo route path (ví dụ: /api/v1/auth/login), IP hoặc mã HTTP..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Actions: Export CSV & Manual Refresh */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-9 gap-1.5 text-xs"
                disabled={filteredLogs.length === 0}
                title="Tải toàn bộ kết quả lọc ra file CSV"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Xuất CSV</span>
              </Button>

              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isFetching || isLoading}
                  className="h-9 gap-1.5 text-xs"
                  title="Tải lại danh sách route log mới nhất từ server"
                >
                  <RefreshCw
                    className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Làm mới</span>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 font-medium">
              <SlidersHorizontal className="size-3.5" />
              <span>Lọc HTTP:</span>
            </div>

            {/* Method Filter */}
            <div className="w-[140px]">
              <Select
                value={selectedMethod}
                onValueChange={(val) => {
                  setSelectedMethod(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Method</SelectItem>
                  {uniqueMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Group Filter */}
            <div className="w-[160px]">
              <Select
                value={selectedStatusGroup}
                onValueChange={(val) => {
                  setSelectedStatusGroup(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Mã Response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Response</SelectItem>
                  <SelectItem value="2xx">2xx (Thành công)</SelectItem>
                  <SelectItem value="3xx">3xx (Redirect)</SelectItem>
                  <SelectItem value="4xx">4xx (Lỗi Client)</SelectItem>
                  <SelectItem value="5xx">5xx (Lỗi Server)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <X className="size-3.5" />
                <span>Xóa lọc</span>
              </Button>
            )}

            <div className="ml-auto text-muted-foreground font-mono text-[11px]">
              Hiển thị <strong className="text-foreground">{filteredLogs.length}</strong> / {items.length} requests (10 phút gần đây)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-xs border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[160px] text-xs font-bold">Thời gian</TableHead>
                <TableHead className="w-[90px] text-xs font-bold">Method</TableHead>
                <TableHead className="min-w-[280px] text-xs font-bold">Đường dẫn Route API</TableHead>
                <TableHead className="w-[120px] text-xs font-bold">Trạng thái Response</TableHead>
                <TableHead className="w-[100px] text-xs font-bold">Độ trễ</TableHead>
                <TableHead className="w-[130px] text-xs font-bold">Client IP</TableHead>
                <TableHead className="w-[110px] text-xs font-bold">Người gọi</TableHead>
                <TableHead className="w-[70px] text-right text-xs font-bold">Xem</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Globe className="size-5" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        Không có request route nào phù hợp
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Chưa ghi nhận traffic API nào khớp với điều kiện tìm kiếm hoặc bộ lọc.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-2 text-xs"
                        >
                          Xóa bộ lọc để xem tất cả
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    onClick={() => {
                      setSelectedLog(log);
                      setIsDetailOpen(true);
                    }}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    {/* Timestamp */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px]">
                          {new Date(log.timestamp).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </TableCell>

                    {/* Method */}
                    <TableCell>{renderMethodBadge(log.method)}</TableCell>

                    {/* Route Path */}
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[340px]" title={log.path}>
                          {log.path}
                        </span>
                        {log.query && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={log.query}>
                            ?{log.query}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Response Status */}
                    <TableCell>{renderStatusBadge(log.status_code)}</TableCell>

                    {/* Latency */}
                    <TableCell>{renderLatency(log.duration_ms)}</TableCell>

                    {/* IP */}
                    <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={log.client_ip}>
                      {log.client_ip}
                    </TableCell>

                    {/* User ID */}
                    <TableCell className="text-xs">
                      {log.user_id ? (
                        <Badge variant="outline" className="font-mono text-[11px] gap-1 px-1.5 py-0">
                          <User className="size-2.5 text-primary" />
                          #{log.user_id}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Guest</span>
                      )}
                    </TableCell>

                    {/* Action Eye */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                setSelectedLog(log);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              <span className="sr-only">Xem chi tiết</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Xem chi tiết request/response</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-muted/20 text-xs">
            <div className="text-muted-foreground">
              Hiển thị{" "}
              <strong className="text-foreground">
                {Math.min(filteredLogs.length, (page - 1) * pageSize + 1)}
              </strong>{" "}
              -{" "}
              <strong className="text-foreground">
                {Math.min(filteredLogs.length, page * pageSize)}
              </strong>{" "}
              trong tổng số <strong className="text-foreground">{filteredLogs.length}</strong> requests
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Trang trước</span>
              </Button>

              <div className="px-2 font-mono text-xs text-muted-foreground">
                Trang <strong className="text-foreground">{page}</strong> / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 gap-1 text-xs"
              >
                <span>Trang sau</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Route Detail Dialog */}
      {selectedLog && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <div className="flex items-center gap-2">
                  {renderMethodBadge(selectedLog.method)}
                  {renderStatusBadge(selectedLog.status_code)}
                  <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
                    {selectedLog.duration_ms.toFixed(1)}ms
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  #ROUTE-{selectedLog.id}
                </span>
              </div>
              <DialogTitle className="text-base font-mono font-bold text-foreground mt-2 break-all">
                {selectedLog.method} {selectedLog.path}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                {new Date(selectedLog.timestamp).toISOString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-1">
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Client IP:</span>
                  <span className="font-mono font-bold text-foreground">{selectedLog.client_ip}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">User ID (Authenticated):</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedLog.user_id ? `#${selectedLog.user_id}` : "Khách / Không có token"}
                  </span>
                </div>
              </div>

              <div className="bg-card p-3 rounded-lg border space-y-1">
                <span className="text-muted-foreground block text-[11px]">User Agent:</span>
                <p className="font-mono text-xs text-foreground break-all">{selectedLog.user_agent}</p>
              </div>

              {selectedLog.query && (
                <div className="bg-card p-3 rounded-lg border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Query Parameters:</span>
                  <p className="font-mono text-xs text-foreground break-all">?{selectedLog.query}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">JSON Payload Record:</span>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-[160px]">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="text-xs gap-1.5"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Đã chép" : "Sao chép JSON"}</span>
              </Button>
              <Button size="sm" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}