"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useGetMySkillProfileQuery } from "@/redux/api/user/profileApi";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { getBrandLabel } from "@/lib/brand-icons";
import { Button } from "@/components/ui/button";

const ROLE_TRACK_LABELS: Record<string, string> = {
  backend: "Backend Engineer",
  frontend: "Frontend Engineer",
  fullstack: "Full Stack Engineer",
  devops: "DevOps / Cloud Engineer",
  data: "Data Engineer / Analyst",
  mobile: "Mobile Developer",
  ai_ml: "AI / Machine Learning Engineer",
  qa: "QA / Test Engineer",
};

const LEVEL_LABELS: Record<string, string> = {
  none: "Chưa đủ dữ liệu",
  beginner: "Fresher / Mới bắt đầu",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead / Tech Lead",
};

export function UserSkillProfileCard() {
  const { data: skillProfile, isLoading, error } = useGetMySkillProfileQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-secondary)]">
        Đang đọc hồ sơ kỹ năng được AI đánh giá…
      </div>
    );
  }

  if (error || !skillProfile) {
    return null;
  }

  const roleName = ROLE_TRACK_LABELS[skillProfile.primary_role_track] || skillProfile.primary_role_track;
  const levelName = LEVEL_LABELS[skillProfile.overall_level] || skillProfile.overall_level;
  const hasSkills = (skillProfile.top_skills && skillProfile.top_skills.length > 0) || (skillProfile.skills && skillProfile.skills.length > 0);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--accent-deep)]">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--ink)]">Năng lực thực tế được phát hiện bởi AI</h3>
            <p className="text-xs text-[var(--text-secondary)]">Được tổng hợp minh bạch từ bằng chứng các buổi phỏng vấn & ôn tập của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--ink)]">
            <span className="size-2 rounded-full bg-emerald-500" />
            {roleName}
          </span>
          <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]">
            Cấp bậc: {levelName}
          </span>
        </div>
      </div>

      {!hasSkills ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="max-w-md text-xs text-[var(--text-secondary)] mb-4">
            Bạn chưa tích lũy đủ buổi luyện tập để AI đánh giá chính xác từng kỹ năng. Hãy hoàn thành thêm câu hỏi hoặc buổi phỏng vấn để mở khóa bản đồ năng lực!
          </p>
          <Button asChild variant="home-primary" size="home-compact">
            <Link href="/practice">Luyện tập ngay <ArrowRight className="size-3.5 ml-1" /></Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top skills */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-[var(--text-secondary)]">
              <TrendingUp className="size-3.5 text-emerald-600" />
              <span>Kỹ năng thế mạnh đã kiểm chứng</span>
            </div>
            <ul className="flex flex-col gap-2">
              {skillProfile.top_skills.slice(0, 4).map((sk) => (
                <li
                  key={sk.skill_id}
                  className="flex items-center justify-between rounded-xl bg-[var(--surface-paper)] px-3.5 py-2.5 text-xs"
                >
                  <span className="inline-flex items-center gap-2.5 font-medium text-[var(--ink)]">
                    <BrandIcon name={sk.skill_id} size={18} />
                    <span>{getBrandLabel(sk.name)}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                      {LEVEL_LABELS[sk.level] || sk.level}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {sk.ability_score.toFixed(1)} / 5.0
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak skills */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-[var(--text-secondary)]">
              <AlertTriangle className="size-3.5 text-amber-600" />
              <span>Kỹ năng cần bổ trợ thêm</span>
            </div>
            {skillProfile.weak_skills && skillProfile.weak_skills.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {skillProfile.weak_skills.slice(0, 4).map((sk) => (
                  <li
                    key={sk.skill_id}
                    className="flex items-center justify-between rounded-xl bg-[var(--surface-paper)] px-3.5 py-2.5 text-xs"
                  >
                    <span className="inline-flex items-center gap-2.5 font-medium text-[var(--ink)]">
                      <BrandIcon name={sk.skill_id} size={18} />
                      <span>{getBrandLabel(sk.name)}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-medium">
                        Cần cải thiện
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl bg-[var(--surface-paper)] p-4 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Các kỹ năng đã kiểm chứng đều đạt ngưỡng yêu cầu. Hãy tiếp tục thử thách các câu hỏi nâng cao!</span>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button asChild variant="home-outline" size="home-compact">
                <Link href="/practice">Luyện tập theo gợi ý <ArrowRight className="size-3 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
