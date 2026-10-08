"use client";

import React from "react";
import { ExternalLink, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { JobDetail } from "@/types/job";
import { JobSkillMatchWidget } from "./JobSkillMatchWidget";

interface JobQuickActionPanelProps {
  job: JobDetail;
  onStartPractice: () => void;
  isStarting?: boolean;
}

export function JobQuickActionPanel({
  job,
  onStartPractice,
  isStarting = false,
}: JobQuickActionPanelProps) {
  return (
    <div className="flex flex-col gap-4 sticky top-24">
      <div className="p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-[rgba(106,72,49,0.15)] shadow-[0_14px_40px_rgba(84,50,27,0.06)] flex flex-col gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-800 tracking-wider uppercase mb-1 block">
            Sẵn sàng ứng tuyển
          </span>
          <h3 className="text-lg font-bold text-[#211914] mb-1">
            Luyện phỏng vấn thử
          </h3>
          <p className="text-xs text-[rgba(45,31,23,0.72)] leading-relaxed">
            Hệ thống AI sẽ phân tích JD của vị trí này và tạo phòng phỏng vấn giả lập chuyên sâu
            giúp bạn ôn luyện phản xạ trước khi nộp CV.
          </p>
        </div>

        <button
          type="button"
          disabled={isStarting}
          onClick={onStartPractice}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-[#fffaf4] bg-gradient-to-r from-[#211813] via-[#302019] to-[#3a281e] shadow-[0_6px_20px_rgba(48,32,25,0.25)] hover:shadow-[0_8px_25px_rgba(48,32,25,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>Đang chuẩn bị kịch bản AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Luyện phỏng vấn với JD này</span>
            </>
          )}
        </button>

        <a
          href={job.original_apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#211914] bg-white border border-[rgba(106,72,49,0.22)] hover:border-[#d98236] hover:text-[#d98236] hover:bg-[#fffbf7] transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Xem & ứng tuyển tại tin gốc</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="pt-3 border-t border-[rgba(106,72,49,0.08)] flex items-center gap-2 text-[11px] text-[rgba(84,58,42,0.6)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Nguồn tin xác thực {job.via_source ? `từ ${job.via_source}` : "từ nhà tuyển dụng"}</span>
        </div>
      </div>

      <JobSkillMatchWidget jobId={job.job_id} />
    </div>
  );
}
