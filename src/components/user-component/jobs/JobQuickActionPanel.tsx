"use client";

import React from "react";
import { ExternalLink, Sparkles, Loader2, Building, ShieldCheck } from "lucide-react";
import { JobDetail } from "@/types/job";
import { Button } from "@/components/ui/button";
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
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Sẵn sàng ứng tuyển?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Luyện tập trả lời các câu hỏi kỹ năng chuyên sâu sát với yêu cầu của vị trí này trước khi gửi CV.
          </p>
        </div>

        <Button
          variant="home-primary"
          size="lg"
          className="w-full font-semibold shadow-sm text-sm py-5"
          disabled={isStarting}
          onClick={onStartPractice}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo kịch bản AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Luyện phỏng vấn với JD này
            </>
          )}
        </Button>

        <a
          href={job.original_apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            variant="home-secondary"
            size="default"
            className="w-full text-xs font-medium"
          >
            Xem và ứng tuyển tại tin gốc
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </a>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Nguồn tin xác thực từ {job.via_source || "nhà tuyển dụng"}</span>
        </div>
      </div>

      <JobSkillMatchWidget jobId={job.job_id} />
    </div>
  );
}
