"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  User,
  Volume2,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Activity,
  Mic,
  Video,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  interviewAdminApi,
  type InterviewSessionDetailPage,
} from "@/services/admin/interviewAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";

export function AdminInterviewDetailClient() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.id);

  const [detail, setDetail] = useState<InterviewSessionDetailPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reEvaluating, setReEvaluating] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!sessionId || isNaN(sessionId)) return;
    setLoading(true);
    try {
      const data = await interviewAdminApi.getInterviewDetail(sessionId);
      setDetail(data);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết phiên phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleReEvaluate = async () => {
    if (!sessionId) return;
    setReEvaluating(true);
    try {
      const res = await interviewAdminApi.reEvaluateInterview(sessionId);
      toast.success(res.message || "Đã chấm lại phiên phỏng vấn thành công");
      await fetchDetail();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi chấm lại phiên phỏng vấn");
    } finally {
      setReEvaluating(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <AdminEmptyState
          title="Không tìm thấy phiên phỏng vấn"
          description={`Phiên phỏng vấn #${sessionId} không tồn tại hoặc đã bị xóa.`}
          action={
            <Button variant="outline" onClick={() => router.push("/admin/interviews")}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title={`Chi Tiết Phiên Phỏng Vấn #${detail.session_id}`}
        description={`Ứng viên: ${detail.candidate_name || "Ẩn danh"} (${detail.candidate_email || "N/A"}) • Vị trí: ${detail.role_name || "Chung"}`}
        backHref="/admin/interviews"
        backLabel="Danh sách phỏng vấn"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReEvaluate}
            disabled={reEvaluating}
            className="text-xs"
          >
            <Sparkles className={`size-3.5 mr-1.5 text-primary ${reEvaluating ? "animate-spin" : ""}`} />
            {reEvaluating ? "Đang chấm lại..." : "Chấm lại bằng AI"}
          </Button>
          <Badge
            className={
              detail.status === "completed"
                ? "bg-emerald-500/15 text-emerald-600 border-none text-sm px-3 py-1"
                : "bg-blue-500/15 text-blue-600 border-none text-sm px-3 py-1"
            }
          >
            {detail.status === "completed" ? "Đã hoàn thành" : "Đang diễn ra"}
          </Badge>
        </div>
      </AdminPageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatCard
          title="Điểm Tổng Thể"
          value={detail.total_score !== null ? `${detail.total_score} / 100` : "Chưa chấm"}
          description="Đánh giá năng lực bởi AI"
          icon={<Award className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Số Lượt Hỏi Đáp"
          value={`${detail.turns.length} câu`}
          description={`Trình độ: ${detail.experience_level || "Chưa rõ"}`}
          icon={<MessageSquare className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Chế Độ & Ngôn Ngữ"
          value={`${detail.mode.toUpperCase()} (${detail.language.toUpperCase()})`}
          description="Hình thức tương tác"
          icon={<Activity className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Thời Điểm Bắt Đầu"
          value={new Date(detail.started_at).toLocaleTimeString("vi-VN")}
          description={new Date(detail.started_at).toLocaleDateString("vi-VN")}
          icon={<Clock className="size-5 text-primary" />}
        />
      </div>

      {/* Conversation Turns Timeline */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Nhật Ký Lời Thoại & Phân Tích Đánh Giá Từng Câu
          </CardTitle>
          <CardDescription>
            Đối chiếu chi tiết giữa câu hỏi của AI và câu trả lời thực tế của ứng viên
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {detail.turns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Phiên phỏng vấn này chưa có lượt hỏi đáp nào được ghi nhận.
            </div>
          ) : (
            detail.turns.map((turn, idx) => (
              <div
                key={turn.turn_id || idx}
                className="p-5 border rounded-xl bg-card space-y-4 hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                      {turn.turn_number || idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      Lượt phỏng vấn số {turn.turn_number || idx + 1}
                    </span>
                  </div>

                  {turn.evaluation_score !== null && turn.evaluation_score !== undefined && (
                    <Badge
                      className={
                        turn.evaluation_score >= 80
                          ? "bg-emerald-500/15 text-emerald-600 border-none font-bold"
                          : turn.evaluation_score >= 50
                          ? "bg-muted text-foreground border-none font-bold"
                          : "bg-destructive/15 text-destructive border-none font-bold"
                      }
                    >
                      Điểm: {turn.evaluation_score}/100
                    </Badge>
                  )}
                </div>

                {/* AI Question */}
                <div className="flex items-start gap-3 bg-muted/30 p-3.5 rounded-lg border border-border/50">
                  <div className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="text-xs font-semibold text-primary">AI Phỏng Vấn Viên Hỏi:</div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {turn.question_text || "— Không có nội dung câu hỏi —"}
                    </p>
                  </div>
                </div>

                {/* Candidate Answer */}
                <div className="flex items-start gap-3 bg-muted/30 p-3.5 rounded-lg border border-border/60">
                  <div className="size-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="size-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Ứng Viên Trả Lời:</span>
                      {turn.wpm && (
                        <span className="text-[11px] font-normal text-muted-foreground">
                          Tốc độ: {turn.wpm} WPM • Từ thừa: {turn.filler_words_count ?? 0}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed italic">
                      "{turn.transcribed_text || "— Không nhận diện được lời nói hoặc ứng viên bỏ qua —"}"
                    </p>

                    {turn.audio_file_url && (
                      <div className="pt-2">
                        <audio controls className="w-full h-8" src={turn.audio_file_url}>
                          Trình duyệt không hỗ trợ thẻ audio.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Feedback & STAR Analysis */}
                {(turn.evaluation_feedback || turn.star_analysis) && (
                  <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Nhận xét & Góp ý từ AI:
                    </div>
                    {turn.evaluation_feedback && (
                      <p className="text-foreground/90 leading-relaxed">{turn.evaluation_feedback}</p>
                    )}

                    {turn.star_analysis && typeof turn.star_analysis === "object" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20">
                        {Object.entries(turn.star_analysis).map(([key, val]) => (
                          <div key={key} className="p-2 rounded bg-background/50 border">
                            <span className="font-bold uppercase text-[10px] text-muted-foreground block">
                              {key}:
                            </span>
                            <span className="text-xs text-foreground font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
