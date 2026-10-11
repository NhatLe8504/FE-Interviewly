"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  UserX,
  FileQuestion,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  moderationAdminApi,
  type ModerationCreateIn,
  type ModerationItem,
} from "@/services/admin/moderationAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";

const TARGET_TYPE_LABELS: Record<string, string> = {
  question: "Câu hỏi",
  answer: "Câu trả lời",
  user: "Tài khoản",
  session: "Phiên phỏng vấn",
  comment: "Bình luận",
};

const ACTION_BADGES: Record<string, { label: string; className: string }> = {
  approve: { label: "Phê duyệt", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none" },
  reject: { label: "Từ chối", className: "bg-rose-500/15 text-rose-600 border-none" },
  remove: { label: "Gỡ bỏ", className: "bg-rose-500/15 text-rose-600 border-none" },
  warn: { label: "Cảnh báo", className: "bg-amber-500/15 text-amber-600 border-none" },
  flag: { label: "Gắn cờ", className: "bg-orange-500/15 text-orange-600 border-none" },
};

export function AdminModerationClient() {
  const [logs, setLogs] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<ModerationCreateIn>({
    target_type: "question",
    action: "approve",
    target_id: 1,
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationAdminApi.getLogs({
        target_type: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
        limit: 50,
        offset: 0,
      });
      setLogs(data.items);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải nhật ký kiểm duyệt");
    } finally {
      setLoading(false);
    }
  }, [targetTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const reasonText = (log.reason || "").toLowerCase();
    const idText = String(log.target_id || "");
    return reasonText.includes(q) || idText.includes(q);
  });

  const handleOpenCreate = () => {
    setFormState({
      target_type: "question",
      action: "approve",
      target_id: undefined,
      reason: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await moderationAdminApi.createAction({
        target_type: formState.target_type,
        action: formState.action,
        target_id: formState.target_id ? Number(formState.target_id) : undefined,
        reason: formState.reason?.trim() || undefined,
      });
      toast.success("Đã ghi nhận hành động kiểm duyệt thành công");
      setDialogOpen(false);
      await fetchLogs();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi lưu hành động kiểm duyệt");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Action Handler
  const handleQuickAction = async (targetType: string, targetId: number | null | undefined, action: string, reason: string) => {
    try {
      await moderationAdminApi.createAction({
        target_type: targetType,
        target_id: targetId,
        action,
        reason,
      });
      toast.success(`Đã áp dụng hành động ${action}`);
      await fetchLogs();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi xử lý");
    }
  };

  const approveCount = logs.filter((l) => l.action === "approve").length;
  const violationCount = logs.filter((l) => ["warn", "remove", "reject", "flag"].includes(l.action)).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Kiểm Duyệt Nội Dung & Báo Cáo Vi Phạm"
        description="Giám sát và xử lý các nội dung câu hỏi, câu trả lời, tài khoản bị báo cáo vi phạm tiêu chuẩn cộng đồng."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-2" />
            Tạo lệnh kiểm duyệt
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Số Lệnh Xử Lý"
          value={total}
          description="Nhật ký các hành động kiểm duyệt"
          icon={<ShieldAlert className="size-5 text-indigo-500" />}
        />
        <AdminStatCard
          title="Nội Dung Được Phê Duyệt"
          value={approveCount}
          description="Nội dung đã duyệt hiển thị"
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Cảnh Báo & Gỡ Bỏ"
          value={violationCount}
          description="Vi phạm tiêu chuẩn hoặc bị khóa"
          icon={<AlertTriangle className="size-5 text-rose-500" />}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Nhật Ký Hàng Đợi Kiểm Duyệt</CardTitle>
              <CardDescription>
                Danh sách các phiên hành động kiểm duyệt bởi ban quản trị
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo lý do, mã đối tượng..."
                  className="pl-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-44 text-sm">
                  <SelectValue placeholder="Loại đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đối tượng</SelectItem>
                  <SelectItem value="question">Câu hỏi</SelectItem>
                  <SelectItem value="answer">Câu trả lời</SelectItem>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="session">Phiên phỏng vấn</SelectItem>
                  <SelectItem value="comment">Bình luận</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <AdminEmptyState
              title="Không có nhật ký kiểm duyệt nào"
              description="Chưa có hành động kiểm duyệt nào được ghi nhận cho bộ lọc đã chọn."
              action={
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" />
                  Tạo lệnh kiểm duyệt
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Mã Log</th>
                    <th className="py-3 px-3">Đối tượng</th>
                    <th className="py-3 px-3">Mã đối tượng</th>
                    <th className="py-3 px-3">Hành động</th>
                    <th className="py-3 px-3">Lý do xử lý</th>
                    <th className="py-3 px-3">Thời gian</th>
                    <th className="py-3 px-3 text-right">Thao tác nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredLogs.map((log) => {
                    const badgeInfo = ACTION_BADGES[log.action] || {
                      label: log.action,
                      className: "",
                    };
                    return (
                      <tr key={log.log_id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                          #{log.log_id}
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground">
                          <Badge variant="outline" className="text-xs">
                            {TARGET_TYPE_LABELS[log.target_type] || log.target_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-foreground">
                          {log.target_id ? `ID #${log.target_id}` : "Toàn bộ"}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={badgeInfo.className}>{badgeInfo.label}</Badge>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground max-w-sm truncate">
                          {log.reason || "— Không có lý do cụ thể —"}
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          {log.action !== "approve" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() =>
                                handleQuickAction(
                                  log.target_type,
                                  log.target_id,
                                  "approve",
                                  "Xác nhận duyệt hợp lệ bởi quản trị viên",
                                )
                              }
                            >
                              Duyệt
                            </Button>
                          )}
                          {log.action !== "remove" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() =>
                                handleQuickAction(
                                  log.target_type,
                                  log.target_id,
                                  "remove",
                                  "Gỡ bỏ do không đạt tiêu chuẩn",
                                )
                              }
                            >
                              Gỡ
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Moderation Action Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ghi Nhận Kiểm Duyệt Mới</DialogTitle>
            <DialogDescription>
              Thực hiện xử lý nội dung vi phạm, cảnh báo tài khoản hoặc phê duyệt nội dung.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="target_type">Loại đối tượng *</Label>
                <Select
                  value={formState.target_type}
                  onValueChange={(val) => setFormState({ ...formState, target_type: val })}
                >
                  <SelectTrigger id="target_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">Câu hỏi</SelectItem>
                    <SelectItem value="answer">Câu trả lời</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="session">Phiên phỏng vấn</SelectItem>
                    <SelectItem value="comment">Bình luận</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="action">Hành động *</Label>
                <Select
                  value={formState.action}
                  onValueChange={(val) => setFormState({ ...formState, action: val })}
                >
                  <SelectTrigger id="action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Phê duyệt (Approve)</SelectItem>
                    <SelectItem value="warn">Cảnh báo (Warn)</SelectItem>
                    <SelectItem value="flag">Gắn cờ (Flag)</SelectItem>
                    <SelectItem value="remove">Gỡ bỏ (Remove)</SelectItem>
                    <SelectItem value="reject">Từ chối (Reject)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target_id">Mã ID đối tượng</Label>
              <Input
                id="target_id"
                type="number"
                placeholder="VD: 102 (để trống nếu toàn cục)"
                value={formState.target_id ?? ""}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    target_id: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Lý do kiểm duyệt</Label>
              <textarea
                id="reason"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Mô tả lý do xử lý hoặc căn cứ điều khoản..."
                value={formState.reason ?? ""}
                onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Xác nhận kiểm duyệt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
