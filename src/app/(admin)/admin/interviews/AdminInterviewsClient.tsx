"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Mic,
  Video,
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  Sparkles,
  TrendingUp,
  ExternalLink,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  interviewAdminApi,
  type InterviewSessionAdmin,
  type InterviewSessionDetailPage,
} from "@/services/admin/interviewAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard, AdminPagination } from "@/components/admin";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: "Hoàn thành", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none" },
  in_progress: { label: "Đang diễn ra", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none" },
  abandoned: { label: "Bỏ dở", className: "bg-muted text-muted-foreground border-none" },
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  voice: <Mic className="size-3.5 text-indigo-500" />,
  video: <Video className="size-3.5 text-purple-500" />,
  text: <MessageSquare className="size-3.5 text-blue-500" />,
};

const getInitials = (name?: string | null) => {
  if (!name) return "UV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name?: string | null) => {
  const colors = [
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export function AdminInterviewsClient() {
  const [interviews, setInterviews] = useState<InterviewSessionAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Quick Preview State
  const [previewSession, setPreviewSession] = useState<InterviewSessionDetailPage | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const handleOpenQuickView = async (session: InterviewSessionAdmin) => {
    setPreviewDialogOpen(true);
    setLoadingPreview(true);
    try {
      const detail = await interviewAdminApi.getInterviewDetail(session.session_id);
      setPreviewSession(detail);
    } catch {
      toast.error("Không thể tải thông tin nhanh phiên phỏng vấn");
    } finally {
      setLoadingPreview(false);
    }
  };

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewAdminApi.getInterviews({
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setInterviews(data.items);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách phiên phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page, pageSize]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const completedSessions = interviews.filter((i) => i.status === "completed");
  const avgScore =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((acc, i) => acc + (i.total_score || 0), 0) /
          completedSessions.length
        ).toFixed(1)
      : "0";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Giám Sát & Báo Cáo Phiên Phỏng Vấn AI"
        description="Xem toàn cảnh các phiên phỏng vấn thực tế của ứng viên, kiểm tra transcript hỏi đáp và điểm đánh giá STAR."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInterviews} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Số Phiên Phỏng Vấn"
          value={total}
          description="Đã khởi tạo trên hệ thống"
          icon={<Sparkles className="size-5 text-indigo-500" />}
        />
        <AdminStatCard
          title="Phiên Đã Hoàn Thành"
          value={completedSessions.length}
          description="Ứng viên hoàn tất đầy đủ các câu"
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Điểm Trung Bình"
          value={`${avgScore} / 100`}
          description="Điểm AI đánh giá trung bình"
          icon={<Award className="size-5 text-amber-500" />}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Danh Sách Phiên Phỏng Vấn</CardTitle>
              <CardDescription>
                Hiển thị {interviews.length} phiên phỏng vấn thực tế của các ứng viên
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm email, họ tên ứng viên..."
                  className="pl-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchInterviews();
                  }}
                />
              </div>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="completed">Đã hoàn thành</SelectItem>
                  <SelectItem value="in_progress">Đang diễn ra</SelectItem>
                  <SelectItem value="abandoned">Bỏ dở</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => fetchInterviews()}>
                <RefreshCw className="size-3.5" />
              </Button>
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
          ) : interviews.length === 0 ? (
            <AdminEmptyState
              title="Không có phiên phỏng vấn nào"
              description="Chưa có phiên phỏng vấn nào được ghi nhận với bộ lọc hiện tại."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Mã phiên</th>
                    <th className="py-3 px-3">Ứng viên</th>
                    <th className="py-3 px-3">Vị trí & Ngành nghề</th>
                    <th className="py-3 px-3">Chế độ</th>
                    <th className="py-3 px-3 text-center">Số lượt (Turns)</th>
                    <th className="py-3 px-3 text-center">Điểm số</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Bắt đầu lúc</th>
                    <th className="py-3 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {interviews.map((session) => {
                    const st = STATUS_CONFIG[session.status] || {
                      label: session.status,
                      className: "",
                    };
                    return (
                      <tr key={session.session_id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                          #{session.session_id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <Avatar className={`size-8 border shrink-0 ${getAvatarColor(session.candidate_name)}`}>
                              <AvatarFallback className="font-bold text-xs bg-transparent">
                                {getInitials(session.candidate_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate max-w-[170px]">
                                {session.candidate_name || "Ứng viên ẩn danh"}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[170px]">
                                {session.candidate_email || `ID: ${session.candidate_id}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                            <Layers className="size-3 text-primary shrink-0" />
                            <span className="truncate max-w-[160px]">{session.role_name || "Phỏng vấn chung"}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground pl-4 truncate max-w-[160px]">
                            {session.domain_name || "Công nghệ thông tin"}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            {MODE_ICONS[session.mode] || <MessageSquare className="size-3.5 text-muted-foreground" />}
                            <span className="capitalize">{session.mode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">
                          {session.turns_count} lượt
                        </td>
                        <td className="py-3 px-3 text-center">
                          {session.total_score !== null && session.total_score !== undefined ? (
                            <span
                              className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                                session.total_score >= 80
                              ? "bg-emerald-500/15 text-emerald-600"
                              : session.total_score >= 50
                              ? "bg-amber-500/15 text-amber-600"
                              : "bg-rose-500/15 text-rose-600"
                              }`}
                            >
                              {session.total_score}đ
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={st.className}>{st.label}</Badge>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(session.started_at).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleOpenQuickView(session)}
                              title="Xem nhanh tóm tắt & transcript"
                            >
                              <Eye className="size-3.5 mr-1" />
                              Xem nhanh
                            </Button>
                            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                              <Link href={`/admin/interviews/${session.session_id}`}>
                                Chi tiết
                                <ChevronRight className="size-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && interviews.length > 0 && (
            <AdminPagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(total / pageSize))}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              pageSizeOptions={[10, 15, 25, 50]}
              itemName="phiên phỏng vấn"
            />
          )}
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Phiên Phỏng Vấn #{previewSession?.session_id}</span>
                  {previewSession && (
                    <Badge className={STATUS_CONFIG[previewSession.status]?.className || ""}>
                      {STATUS_CONFIG[previewSession.status]?.label || previewSession.status}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Ứng viên: <strong>{previewSession?.candidate_name || "Ứng viên ẩn danh"}</strong> ({previewSession?.candidate_email || "N/A"})
                </DialogDescription>
              </div>
              {previewSession?.total_score !== null && previewSession?.total_score !== undefined && (
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-primary">
                    {previewSession.total_score}đ
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Điểm tổng kết</div>
                </div>
              )}
            </div>
          </DialogHeader>

          {loadingPreview ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : previewSession ? (
            <div className="space-y-4 pt-2">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/40 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Vị trí</span>
                  <strong className="text-foreground">{previewSession.role_name || "Chung"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Hình thức &amp; Ngôn ngữ</span>
                  <strong className="text-foreground capitalize">{previewSession.mode} ({previewSession.language})</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lượt hỏi đáp</span>
                  <strong className="text-foreground">{previewSession.turns?.length || previewSession.turns_count} lượt</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Thời gian bắt đầu</span>
                  <strong className="text-foreground">{new Date(previewSession.started_at).toLocaleString("vi-VN")}</strong>
                </div>
              </div>

              {/* Transcript list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Trích Đoạn Hỏi Đáp (Turns Transcript)
                </h4>
                {(!previewSession.turns || previewSession.turns.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">
                    Phiên này chưa có lượt hỏi đáp nào được ghi nhận.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {previewSession.turns.map((turn, idx) => (
                      <div key={turn.turn_id || idx} className="rounded-lg border p-3 text-xs space-y-2 bg-card">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground border-b pb-1.5">
                          <span className="text-primary font-bold">Lượt #{turn.turn_number || idx + 1}</span>
                          {turn.evaluation_score !== null && turn.evaluation_score !== undefined && (
                            <Badge variant="outline" className="text-[10px]">
                              Điểm câu: {turn.evaluation_score}đ
                            </Badge>
                          )}
                        </div>
                        {turn.question_text && (
                          <div>
                            <span className="font-bold text-foreground">AI hỏi: </span>
                            <span className="text-muted-foreground">{turn.question_text}</span>
                          </div>
                        )}
                        {turn.transcribed_text && (
                          <div className="p-2 rounded bg-muted/30">
                            <span className="font-bold text-foreground">Ứng viên trả lời: </span>
                            <span className="text-foreground/90 leading-relaxed">{turn.transcribed_text}</span>
                          </div>
                        )}
                        {turn.evaluation_feedback && (
                          <div className="text-[11px] text-muted-foreground italic border-t pt-1">
                            <strong>Đánh giá AI:</strong> {turn.evaluation_feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-2">
            {previewSession && (
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link href={`/admin/interviews/${previewSession.session_id}`}>
                  <span>Xem trang quản trị phiên đầy đủ</span>
                  <ExternalLink className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
