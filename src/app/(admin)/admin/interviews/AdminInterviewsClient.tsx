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
} from "lucide-react";
import { toast } from "sonner";
import {
  interviewAdminApi,
  type InterviewSessionAdmin,
} from "@/services/admin/interviewAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
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

export function AdminInterviewsClient() {
  const [interviews, setInterviews] = useState<InterviewSessionAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewAdminApi.getInterviews({
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        limit: 50,
        offset: 0,
      });
      setInterviews(data.items);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách phiên phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                          <div className="font-medium text-foreground">
                            {session.candidate_name || "Ứng viên ẩn danh"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.candidate_email || `ID: ${session.candidate_id}`}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-xs text-foreground">
                            {session.role_name || "Phỏng vấn chung"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
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
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {new Date(session.started_at).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                            <Link href={`/admin/interviews/${session.session_id}`}>
                              <Eye className="size-3.5 mr-1" />
                              Xem phiên
                            </Link>
                          </Button>
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
    </div>
  );
}
