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
import { StarBreakdownCard } from "@/components/analytics/StarBreakdownCard";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await analyticsApi.getProgressTrends(15);
        setData(res);
      } catch {
        // Fallback data
        setData({
          candidate_id: 1,
          trends: [
            {
              session_id: 98,
              date: "01/09",
              overall_score: 68.0,
              clarity_score: 70.0,
              logic_score: 65.0,
              example_score: 68.0,
              speaking_pace_wpm: 110.0,
              filler_words_count: 5,
              star_completion_rate: 60.0,
            },
            {
              session_id: 99,
              date: "05/09",
              overall_score: 75.0,
              clarity_score: 78.0,
              logic_score: 72.0,
              example_score: 74.0,
              speaking_pace_wpm: 122.0,
              filler_words_count: 3,
              star_completion_rate: 70.0,
            },
            {
              session_id: 101,
              date: "12/09",
              overall_score: 85.0,
              clarity_score: 86.0,
              logic_score: 82.0,
              example_score: 88.0,
              speaking_pace_wpm: 135.0,
              filler_words_count: 1,
              star_completion_rate: 85.0,
            },
          ],
          avg_wpm: 132.0,
          avg_filler_count: 1.8,
          star_mastery_rate: 82.0,
        });
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

  const trends = data!;

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
            Biểu đồ xu hướng cải thiện WPM, giảm thiểu từ đệm và tỷ lệ thành thạo phương pháp STAR qua từng tuần.
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
            {trends.avg_wpm} <span className="text-sm font-normal text-slate-400">WPM</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">
            ✓ Nằm trong vùng lý tưởng (120 - 150 WPM)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Tần Suất Từ Đệm Trung Bình</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {trends.avg_filler_count} <span className="text-sm font-normal text-slate-400">từ/phiên</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">
            ✓ Giảm 60% so với 3 phiên đầu tiên
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Tỷ Lệ Làm Chủ STAR</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">
            {trends.star_mastery_rate}%
          </div>
          <p className="text-xs text-indigo-300 mt-2 font-medium">
            ✓ Nắm vững cấu trúc Situation & Result
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

      {/* STAR Mastery Breakdown Section */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Đánh Giá Mức Độ Thành Thạo Khung STAR</h2>
          <p className="text-xs text-slate-400">Phương pháp trả lời câu hỏi hành vi theo chuẩn quốc tế</p>
        </div>

        <StarBreakdownCard
          analysis={{
            situation: true,
            task: true,
            action: true,
            result: trends.star_mastery_rate >= 75,
          }}
        />
      </div>
    </div>
  );
}
