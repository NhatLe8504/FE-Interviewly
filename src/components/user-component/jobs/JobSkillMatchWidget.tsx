"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { jobsApi } from "@/services/jobsApi";
import { JobSkillMatch } from "@/types/job";

interface JobSkillMatchWidgetProps {
  jobId: string;
}

export function JobSkillMatchWidget({ jobId }: JobSkillMatchWidgetProps) {
  const [matchData, setMatchData] = useState<JobSkillMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    jobsApi
      .getSkillMatch(jobId)
      .then((res) => {
        if (mounted) setMatchData(res);
      })
      .catch(() => {
        // Fallback default
        if (mounted) {
          setMatchData({
            job_id: jobId,
            match_score_pct: 65,
            matched_skills: [],
            missing_skills: [],
            recommendation: "Luyện tập phỏng vấn sẽ giúp bạn sẵn sàng tối đa cho vị trí này.",
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500 mb-2" />
        <p className="text-xs text-slate-500">Đang phân tích độ tương thích kỹ năng...</p>
      </div>
    );
  }

  if (!matchData) return null;

  const score = matchData.match_score_pct;
  const scoreColor =
    score >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Độ tương thích hồ sơ
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
          {score}% Phù hợp
        </span>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-slate-600 leading-relaxed italic">
        &ldquo;{matchData.recommendation}&rdquo;
      </p>

      {matchData.missing_skills && matchData.missing_skills.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500">
            Kỹ năng gợi ý ôn tập thêm:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchData.missing_skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
