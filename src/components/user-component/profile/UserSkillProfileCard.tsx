"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, X, FileText, Calendar, Award, Loader2 } from "lucide-react";
import { useGetMySkillProfileQuery, useLazyGetMySkillEvidenceQuery } from "@/redux/api/user/profileApi";
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
  const [triggerGetEvidence, { data: evidenceList, isLoading: isEvidenceLoading }] = useLazyGetMySkillEvidenceQuery();
  const [selectedSkill, setSelectedSkill] = useState<{ id: string; name: string } | null>(null);

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

  const roleName = skillProfile.primary_role_track ? (ROLE_TRACK_LABELS[skillProfile.primary_role_track] || skillProfile.primary_role_track) : "Chưa xác định";
  const levelName = LEVEL_LABELS[skillProfile.overall_level] || skillProfile.overall_level;
  const hasSkills = (skillProfile.top_skills && skillProfile.top_skills.length > 0) || (skillProfile.skills && skillProfile.skills.length > 0);

  const handleOpenEvidence = (skillId: string, skillName: string) => {
    setSelectedSkill({ id: skillId, name: skillName });
    triggerGetEvidence(skillId);
  };

  return (
    <>
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
              <div className="flex items-center justify-between mb-3 text-xs font-medium text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <TrendingUp className="size-3.5 text-emerald-600" />
                  <span>Kỹ năng thế mạnh đã kiểm chứng</span>
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">(Bấm để xem bằng chứng)</span>
              </div>
              <ul className="flex flex-col gap-2">
                {skillProfile.top_skills.slice(0, 4).map((sk) => (
                  <li
                    key={sk.skill_id}
                    onClick={() => handleOpenEvidence(sk.skill_id, sk.name)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-paper)] px-3.5 py-2.5 text-xs transition-colors hover:bg-[var(--surface-subtle)]"
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
              <div className="flex items-center justify-between mb-3 text-xs font-medium text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  <span>Kỹ năng cần bổ trợ thêm</span>
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">(Bấm để xem bằng chứng)</span>
              </div>
              {skillProfile.weak_skills && skillProfile.weak_skills.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {skillProfile.weak_skills.slice(0, 4).map((sk) => (
                    <li
                      key={sk.skill_id}
                      onClick={() => handleOpenEvidence(sk.skill_id, sk.name)}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-paper)] px-3.5 py-2.5 text-xs transition-colors hover:bg-[var(--surface-subtle)]"
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

      {/* Evidence audit modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <BrandIcon name={selectedSkill.id} size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    Bằng chứng kỹ năng: {getBrandLabel(selectedSkill.name)}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">Các lượt trả lời đã được AI thẩm định và cho điểm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-3">
              {isEvidenceLoading ? (
                <div className="flex items-center justify-center py-10 text-xs text-[var(--text-secondary)]">
                  <Loader2 className="size-4 animate-spin mr-2" /> Đang tải bằng chứng…
                </div>
              ) : !evidenceList || evidenceList.length === 0 ? (
                <div className="py-10 text-center text-xs text-[var(--text-secondary)]">
                  Chưa có trích đoạn bằng chứng chi tiết được lưu cho kỹ năng này.
                </div>
              ) : (
                evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-paper)] p-3.5 text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1 font-medium text-[var(--ink)]">
                        <Award className="size-3 text-emerald-600" />
                        Điểm: {Math.round(ev.score * 100)}% (Độ khó: {ev.question_difficulty}/5)
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(ev.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    {ev.evidence_quote && (
                      <p className="italic text-[var(--text-secondary)] border-l-2 border-[var(--accent-subtle)] pl-2.5 py-0.5">
                        &ldquo;{ev.evidence_quote}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1">
                      <span>Nguồn: {ev.source_type === "practice_history" ? "Luyện tập bộ đề" : "Phỏng vấn AI"}</span>
                      <span>Hình thức: {ev.input_mode === "voice" ? "Giọng nói (Voice)" : "Văn bản (Text)"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] mt-4 flex justify-end">
              <Button
                type="button"
                variant="home-outline"
                size="home-compact"
                onClick={() => setSelectedSkill(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
