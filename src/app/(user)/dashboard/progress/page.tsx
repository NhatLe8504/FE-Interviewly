"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { analyticsApi } from "@/services/analyticsApi";
import { ProgressTrendsData } from "@/types/analytics";
import { ScoreTrendLineChart } from "@/components/analytics/ScoreTrendLineChart";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await analyticsApi.getProgressTrends(15);
        setData(res);
      } catch (err: any) {
      setData(null);
    } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-slate-400 text-sm">Đang tải biểu đồ phân tích chuyên sâu...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-300">
      <p>Chưa tải được tiến độ. Vui lòng thử lại sau.</p>
      <Link href="/dashboard" className="text-sky-400">Quay lại bảng điều khiển</Link>
    </div>;
  }

  const trends = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-sky-400" />
            <span>Phân Tích Tiến Độ Chuyên Sâu</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Theo dõi điểm Rubric và các chỉ số thực sự đã được ghi nhận qua từng phiên.
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-sky-500/20"
        >
          <span>Luyện tập ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Tốc Độ Nói Trung Bình</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {trends.avg_wpm ?? "Chưa đo"} {trends.avg_wpm !== null && <span className="text-sm font-normal text-slate-400">WPM</span>}
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">
            {trends.avg_wpm === null ? "Chưa có phân tích âm thanh" : trends.avg_wpm >= 120 && trends.avg_wpm <= 150 ? "Trong khoảng 120–150 WPM" : "Ngoài khoảng tham khảo 120–150 WPM"}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Tần Suất Từ Đệm Trung Bình</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {trends.avg_filler_count ?? "Chưa đo"} {trends.avg_filler_count !== null && <span className="text-sm font-normal text-slate-400">từ/lượt đã phân tích</span>}
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">
            Chỉ tính trên những lượt có phân tích từ đệm
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Yếu Tố STAR Đã Thể Hiện</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {trends.star_mastery_rate === null ? "Chưa chấm" : `${trends.star_mastery_rate}%`}
          </div>
          <p className="text-xs text-indigo-300 mt-2 font-medium">
            Tổng hợp từ các câu hỏi hành vi đã được đánh giá
          </p>
        </div>
      </div>

      {/* Score Improvement Trend */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Biểu Đồ Xu Hướng Điểm Số & Rubric</h2>
          <p className="text-xs text-slate-400">Theo dõi sự biến thiên của Clarity, Logic và Điểm tổng quát</p>
        </div>
        <ScoreTrendLineChart data={trends.trends} />
      </div>

    </div>
  );
}
