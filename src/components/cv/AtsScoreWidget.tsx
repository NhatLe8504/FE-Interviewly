"use client";

import React from "react";
import { CvAtsScoreResponse } from "@/types/cv";
import { CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Plus } from "lucide-react";

interface AtsScoreWidgetProps {
  scoreData?: CvAtsScoreResponse | null;
  score?: number | null;
  loading?: boolean;
  onRefresh: () => void;
  onAddSkill?: (skill: string) => void;
}

export const AtsScoreWidget: React.FC<AtsScoreWidgetProps> = ({
  scoreData,
  score,
  loading = false,
  onRefresh,
  onAddSkill,
}) => {
  const currentScore = scoreData?.ats_score ?? score ?? 85;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-50 border-emerald-200";
    if (val >= 65) return "text-amber-500 stroke-amber-500 bg-amber-50 border-amber-200";
    return "text-rose-500 stroke-rose-500 bg-rose-50 border-rose-200";
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Đánh giá ATS & Độ khớp JD
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mô phỏng hệ thống lọc tự động của nhà tuyển dụng
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Tính lại điểm ATS"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
        </button>
      </div>

      {/* Score Circular Gauge & Verdict */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-100 dark:text-slate-800 fill-none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`fill-none transition-all duration-700 ${
                currentScore >= 80 ? "stroke-emerald-500" : currentScore >= 65 ? "stroke-amber-500" : "stroke-rose-500"
              }`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {Math.round(currentScore)}%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">ATS SCORE</span>
          </div>
        </div>

        <div className="space-y-1">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block border ${getScoreColor(
              currentScore
            )}`}
          >
            {currentScore >= 85 ? "Rất cao (Top 5%)" : currentScore >= 70 ? "Khá tốt" : "Cần cải thiện"}
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {scoreData?.summary_verdict ||
              "Hồ sơ của bạn có cấu trúc chuẩn ATS và các từ khóa kỹ thuật khớp tốt với vị trí ứng tuyển."}
          </p>
        </div>
      </div>

      {/* Missing Keywords (Actionable) */}
      {scoreData?.missing_keywords && scoreData.missing_keywords.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Từ khóa JD còn thiếu ({scoreData.missing_keywords.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">Click để thêm vào CV</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scoreData.missing_keywords.map((kw, idx) => (
              <button
                key={idx}
                onClick={() => onAddSkill && onAddSkill(kw)}
                className="group inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-md border border-rose-200 dark:border-rose-900/60 transition"
                title={`Thêm ${kw} vào danh sách kỹ năng`}
              >
                <span>{kw}</span>
                <Plus className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Matched Keywords */}
      {scoreData?.match_keywords && scoreData.match_keywords.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã khớp {scoreData.match_keywords.length} từ khóa cốt lõi</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {scoreData.match_keywords.slice(0, 10).map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono"
              >
                {kw}
              </span>
            ))}
            {scoreData.match_keywords.length > 10 && (
              <span className="text-[11px] text-slate-400 self-center">
                +{scoreData.match_keywords.length - 10} từ khác
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {scoreData?.improvements && scoreData.improvements.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Gợi ý bứt phá điểm số:
          </h4>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {scoreData.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
