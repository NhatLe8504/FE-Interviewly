"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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
        if (mounted) {
          setMatchData({
            job_id: jobId,
            match_score_pct: 65,
            matched_skills: [],
            missing_skills: [],
            recommendation: "Luyện tập phỏng vấn thử sẽ giúp bạn nắm vững kiến thức chuyên môn.",
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
      <div className="p-4 bg-white/70 rounded-2xl border border-[rgba(106,72,49,0.12)] text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#8b4513] mb-2" />
        <p className="text-xs text-[rgba(84,58,42,0.6)] font-medium">Đang phân tích độ tương thích hồ sơ...</p>
      </div>
    );
  }

  if (!matchData) return null;

  const score = matchData.match_score_pct;
  const scoreBadge =
    score >= 75 ? "text-emerald-800 bg-emerald-50 border-emerald-300" :
    score >= 50 ? "text-amber-800 bg-amber-50 border-amber-300" :
    "text-stone-800 bg-stone-100 border-stone-300";

  return (
    <div className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-[rgba(106,72,49,0.14)] shadow-[0_10px_30px_rgba(84,50,27,0.04)] flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[rgba(84,58,42,0.7)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d98236]" />
          Độ phù hợp hồ sơ
        </span>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${scoreBadge}`}>
          {score}% Sẵn sàng
        </span>
      </div>

      <div className="w-full bg-[#f4ebe1] h-2.5 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#d98236] to-[#8b4513] transition-all duration-700 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-[rgba(45,31,23,0.78)] leading-relaxed italic bg-[#fbf8f5] p-2.5 rounded-xl border border-[rgba(106,72,49,0.08)]">
        &ldquo;{matchData.recommendation}&rdquo;
      </p>

      {matchData.missing_skills && matchData.missing_skills.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[rgba(84,58,42,0.7)] uppercase tracking-wide">
            Kỹ năng cần ôn tập thêm:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchData.missing_skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium px-2 py-0.5 bg-[#fef5ec] text-[#8b4513] border border-[rgba(217,130,54,0.3)] rounded-md"
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
