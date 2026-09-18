"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Download,
  Shield,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/admin/ui/table";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import type { PaymentAdminOut } from "@/types/admin";

export function PaymentDataTable({
  items = [],
  isLoading = false,
  isFetching = false,
  onRefresh,
}: {
  items: PaymentAdminOut[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedTxn, setSelectedTxn] = useState<PaymentAdminOut | null>(null);

  // Client-side search & filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        String(item.transaction_id).includes(searchTerm.trim()) ||
        item.gateway_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.user_name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.user_email?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.plan_name?.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchGateway =
        selectedGateway === "all" ||
        item.payment_gateway?.toLowerCase() === selectedGateway.toLowerCase();

      const matchStatus =
        selectedStatus === "all" ||
        item.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchGateway && matchStatus;
    });
  }, [items, searchTerm, selectedGateway, selectedStatus]);

  const totalFilteredCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / limit));
  const offset = (page - 1) * limit;
  const paginatedItems = filteredItems.slice(offset, offset + limit);

  const formatPrice = (amount: number, currency: string = "VND") => {
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

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Search & Filter Controls Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3.5">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm theo mã GD, khách hàng, gói..."
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Filter className="size-3.5" />
              <span>Lọc:</span>
            </div>

            {/* Gateway Filter */}
            <Select
              value={selectedGateway}
              onValueChange={(val) => {
                setSelectedGateway(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="Cổng thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cổng</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
                <SelectItem value="xgate">XGate</SelectItem>
                <SelectItem value="vietqr">VietQR</SelectItem>
                <SelectItem value="momo">Ví MoMo</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Hoàn tiền</SelectItem>
              </SelectContent>
            </Select>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isFetching}
                className="h-9 text-xs gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Mã GD</TableHead>
              <TableHead className="w-[260px]">Khách hàng</TableHead>
              <TableHead>Gói cước</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Cổng thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                  <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                  <span>Đang tải dữ liệu giao dịch thanh toán...</span>
                </TableCell>
              </TableRow>
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                  <Receipt className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-foreground text-sm">Không có giao dịch nào phù hợp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Thử thay đổi từ khóa hoặc bộ lọc trạng thái cổng thanh toán.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((txn) => {
                const isSuccess = txn.status?.toLowerCase() === "success";
                const isPending = txn.status?.toLowerCase() === "pending";
                const isFailed = txn.status?.toLowerCase() === "failed";

                return (
                  <TableRow key={txn.transaction_id} className="hover:bg-muted/40 transition-colors">
                    {/* Transaction ID */}
                    <TableCell className="font-mono text-xs font-bold">
                      <span className="text-foreground">#{txn.transaction_id}</span>
                      <div className="text-[10px] font-normal text-muted-foreground truncate max-w-28">
                        {txn.gateway_transaction_id}
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 shrink-0">
                          <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                            {getInitials(txn.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-44">
                            {txn.user_name || "Khách hàng"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-44">
                            {txn.user_email || "--"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Plan */}
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-xs border-primary/30 text-foreground">
                        {txn.plan_name || "Gói dịch vụ Pro"}
                      </Badge>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-semibold tabular-nums text-foreground">
                      {formatPrice(txn.amount, txn.currency)}
                    </TableCell>

                    {/* Gateway Badge */}
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="uppercase font-bold text-[10px] tracking-wider"
                      >
                        {txn.payment_gateway}
                      </Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        variant={isSuccess ? "default" : isPending ? "secondary" : "destructive"}
                        className="gap-1.5 text-[11px] font-semibold"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isSuccess ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"
                          }`}
                        />
                        {isSuccess ? "Thành công" : isPending ? "Đang chờ" : isFailed ? "Thất bại" : "Hoàn tiền"}
                      </Badge>
                    </TableCell>

                    {/* Paid Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(txn.paid_at || txn.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setSelectedTxn(txn)}
                        title="Xem chi tiết hóa đơn"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Hiển thị <strong>{filteredItems.length > 0 ? offset + 1 : 0}</strong> -{" "}
            <strong>{Math.min(offset + limit, totalFilteredCount)}</strong> trên tổng số{" "}
            <strong>{totalFilteredCount}</strong> giao dịch
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Trang trước</span>
            </Button>

            <span className="px-2 font-medium">
              Trang {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 text-xs"
            >
              <span>Trang sau</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* TRANSACTION DETAIL DIALOG */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        {selectedTxn && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Receipt className="size-5" />
                </div>
                <div>
                  <DialogTitle>Chi Tiết Giao Dịch #{selectedTxn.transaction_id}</DialogTitle>
                  <DialogDescription className="text-xs">
                    Mã tham chiếu cổng: {selectedTxn.gateway_transaction_id}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 text-xs divide-y">
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Số tiền thanh toán:</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(selectedTxn.amount, selectedTxn.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Khách hàng:</span>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{selectedTxn.user_name || "Khách hàng"}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedTxn.user_email || "--"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Gói dịch vụ kích hoạt:</span>
                <Badge variant="outline" className="font-semibold">
                  {selectedTxn.plan_name || "Pro Plan"}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Cổng thanh toán:</span>
                <Badge variant="secondary" className="uppercase font-bold text-[10px]">
                  {selectedTxn.payment_gateway}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge
                  variant={
                    selectedTxn.status === "success"
                      ? "default"
                      : selectedTxn.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedTxn.status === "success" ? "Thành công" : selectedTxn.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Thời điểm tạo:</span>
                <span>{formatDate(selectedTxn.created_at)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Thời điểm thanh toán:</span>
                <span>{formatDate(selectedTxn.paid_at)}</span>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedTxn(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
