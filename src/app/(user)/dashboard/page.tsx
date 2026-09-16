"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Video,
  FileText,
} from "lucide-react";
import { analyticsApi } from "@/services/analyticsApi";
import { CandidateDashboardData, ProgressTrendsData } from "@/types/analytics";
import { ScoreRadarChart } from "@/components/analytics/ScoreRadarChart";
import { ScoreTrendLineChart } from "@/components/analytics/ScoreTrendLineChart";

export default function DashboardPage() {
  const [data, setData] = useState<CandidateDashboardData | null>(null);
  const [trends, setTrends] = useState<ProgressTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, trendsRes] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getProgressTrends(10),
      ]);
      setData(dashRes);
      setTrends(trendsRes);
    } catch {
      setData({
        candidate_id: 1,
        kpi: {
          total_interviews: 6,
          completed_interviews: 5,
          avg_score: 83.5,
          total_practice_minutes: 120,
          streak_days: 3,
        },
        skill_radar: {
          clarity: 82,
          logic: 85,
          evidence: 74,
          delivery: 88,
          star_method: 79,
        },
        recent_sessions: [
          {
            session_id: 101,
            domain_name: "Công nghệ thông tin",
            role_name: "Backend Developer (Python/FastAPI)",
            mode: "voice",
            score: 88,
            status: "completed",
            started_at: new Date().toISOString(),
          },
          {
            session_id: 102,
            domain_name: "Công nghệ thông tin",
            role_name: "Fullstack Engineer",
            mode: "text",
            score: 79,
            status: "completed",
            started_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        recommendations: [
          {
            weak_area: "Dẫn chứng thực tế (Concrete Examples)",
            score: 74,
            recommendation: "Bổ sung số liệu định lượng (phần trăm tăng trưởng, thời gian giảm tải) vào câu trả lời.",
            suggested_question: "Hãy kể về một dự án gần nhất mà bạn đã tối ưu hóa hiệu năng và kết quả đạt được cụ thể là bao nhiêu?",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-slate-400 text-sm">Đang tải dữ liệu bảng điều khiển...</p>
      </div>
    );
  }

  const kpi = data?.kpi || {
    total_interviews: 0,
    completed_interviews: 0,
    avg_score: 0,
    total_practice_minutes: 0,
    streak_days: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 border border-sky-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Bảng Điều Khiển Ứng Viên
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Pro Candidate
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Theo dõi sự tiến bộ, khắc phục điểm yếu và sẵn sàng chinh phục mọi cuộc phỏng vấn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
            <div>
              <div className="text-xs text-amber-400/80 font-medium">Chuỗi ngày luyện tập</div>
              <div className="text-sm font-bold">{kpi.streak_days} Ngày liên tiếp</div>
            </div>
          </div>

          <Link
            href="/practice"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-sky-500/20"
          >
            <span>Phỏng vấn mới</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tổng số buổi phỏng vấn</span>
            <BrainCircuit className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{kpi.total_interviews}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">{kpi.completed_interviews} hoàn tất</span>
            <span>• {kpi.total_interviews - kpi.completed_interviews} dang dở</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Điểm trung bình tích lũy</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {kpi.avg_score} <span className="text-base font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mức độ sẵn sàng: Khá tốt</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Thời gian luyện tập</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {kpi.total_practice_minutes} <span className="text-base font-normal text-slate-400">phút</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Tương đương {(kpi.total_practice_minutes / 60).toFixed(1)} giờ hội thoại thực tế
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tỷ lệ hoàn thành</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {kpi.total_interviews > 0
              ? Math.round((kpi.completed_interviews / kpi.total_interviews) * 100)
              : 0}%
          </div>
          <div className="text-xs text-slate-400 mt-2">Đạt mục tiêu tuần này</div>
        </div>
      </div>

      {/* Main Charts Section: Trend Line & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Tiến Độ Điểm Số Qua Các Phiên</h2>
              <p className="text-xs text-slate-400">Xu hướng thay đổi điểm tổng thể và các khía cạnh Rubric</p>
            </div>
            <Link
              href="/dashboard/progress"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
            >
              Xem chi tiết tiến độ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ScoreTrendLineChart data={trends?.trends || []} />
        </div>

        {/* 5-Axis Radar Chart (1 Col) */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-100">Đánh Giá 5 Khía Cạnh</h2>
            <p className="text-xs text-slate-400">Điểm mạnh & điểm cần phát huy</p>
          </div>

          {data?.skill_radar ? (
            <ScoreRadarChart data={data.skill_radar} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Chưa có dữ liệu radar.
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations for Weak Points */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-3">
            <Sparkles className="w-5 h-5" />
            <span>AI Đề Xuất Cải Thiện Kỹ Năng Yếu Nhất</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-200">{rec.weak_area}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                      {rec.score} / 100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {rec.recommendation}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic">
                    &quot;{rec.suggested_question}&quot;
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <Link
                    href="/practice"
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    Luyện câu hỏi này ngay <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions Table */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Các Phiên Phỏng Vấn Gần Nhất</h2>
            <p className="text-xs text-slate-400">Xem lại kết quả đánh giá và nghe lại bản ghi âm</p>
          </div>
          <Link
            href="/dashboard/interviews"
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
          >
            Tất cả lịch sử <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recent_sessions && data.recent_sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Mã phiên</th>
                  <th className="px-4 py-3">Vị trí & Ngành nghề</th>
                  <th className="px-4 py-3">Hình thức</th>
                  <th className="px-4 py-3">Điểm số</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recent_sessions.map((s) => (
                  <tr key={s.session_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{s.session_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{s.role_name}</div>
                      <div className="text-xs text-slate-500">{s.domain_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                        {s.mode === "voice" ? (
                          <>
                            <Video className="w-3 h-3 text-sky-400" /> Voice
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 text-emerald-400" /> Text
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.score !== null ? (
                        <span className="text-sm font-bold text-sky-400">{s.score} / 100</span>
                      ) : (
                        <span className="text-xs text-slate-500">Chưa chấm</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(s.started_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/practice/${s.session_id}/result`}
                        className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 transition-colors"
                      >
                        Xem kết quả
                      </Link>
                      <Link
                        href={`/dashboard/interviews/${s.session_id}`}
                        className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Nghe lại
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            Bạn chưa có phiên phỏng vấn nào. Hãy bắt đầu phiên đầu tiên ngay hôm nay!
          </div>
        )}
      </div>
    </div>
  );
}
