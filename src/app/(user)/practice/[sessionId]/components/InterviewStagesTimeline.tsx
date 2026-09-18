"use client";

import React, { useMemo } from "react";
import { Coffee, Briefcase, Handshake, Check, Sparkles } from "lucide-react";

export interface StageDefinition {
  id: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  subtopicsVi: string[];
  subtopicsEn: string[];
  icon: any;
}

export const STAGE_CONFIGS: Record<string, StageDefinition> = {
  warmup: {
    id: "warmup",
    nameVi: "Khởi động & Chào hỏi",
    nameEn: "Warm-up & Greeting",
    descVi: "Giao tiếp cơ bản, thời tiết & giới thiệu bản thân",
    descEn: "Icebreaker, weather/context small talk, self-introduction",
    subtopicsVi: ["Chào hỏi mở đầu", "Thời tiết & bối cảnh", "Giới thiệu bản thân"],
    subtopicsEn: ["Greeting", "Small talk", "Self-introduction"],
    icon: Coffee,
  },
  technical: {
    id: "technical",
    nameVi: "Phỏng vấn chuyên môn",
    nameEn: "Technical Interview",
    descVi: "Kinh nghiệm thực chiến, kiến trúc & tình huống STAR",
    descEn: "Core technical challenges, architecture & STAR follow-up",
    subtopicsVi: ["Kinh nghiệm thực tế", "Kiến trúc hệ thống", "Phương pháp STAR"],
    subtopicsEn: ["Experience", "System Architecture", "STAR follow-up"],
    icon: Briefcase,
  },
  closing: {
    id: "closing",
    nameVi: "Thỏa thuận & Chào kết",
    nameEn: "Closing & Negotiation",
    descVi: "Ứng viên đặt câu hỏi, định hướng nghề & deal lương",
    descEn: "Candidate Q&A, career goals & salary expectations",
    subtopicsVi: ["Câu hỏi cho nhà tuyển dụng", "Định hướng sự nghiệp", "Trao đổi mức lương & chào kết"],
    subtopicsEn: ["Candidate Q&A", "Career goals", "Salary & Wrap-up"],
    icon: Handshake,
  },
};

interface InterviewStagesTimelineProps {
  selectedStages?: string[];
  currentStageId?: string;
  currentStageIndex?: number;
  currentTurnInStage?: number;
  targetTurnsInStage?: number;
  totalTurnsOverall?: number;
  currentTurnOverall?: number;
  locale?: string;
}

export function InterviewStagesTimeline({
  selectedStages = ["warmup", "technical", "closing"],
  currentStageId = "warmup",
  currentStageIndex = 0,
  currentTurnInStage = 1,
  targetTurnsInStage = 2,
  locale = "vi",
}: InterviewStagesTimelineProps) {
  const isVi = locale === "vi";

  const activeStages = useMemo(() => {
    const list = (selectedStages && selectedStages.length > 0)
      ? selectedStages
      : ["warmup", "technical", "closing"];
    return list
      .map((id) => STAGE_CONFIGS[id.toLowerCase()])
      .filter(Boolean) as StageDefinition[];
  }, [selectedStages]);

  const safeIndex = useMemo(() => {
    if (typeof currentStageIndex === "number" && currentStageIndex >= 0) {
      return Math.min(currentStageIndex, activeStages.length - 1);
    }
    const idx = activeStages.findIndex((s) => s.id === currentStageId);
    return idx >= 0 ? idx : 0;
  }, [currentStageIndex, currentStageId, activeStages]);

  const currentStage = activeStages[safeIndex] || activeStages[0] || STAGE_CONFIGS.technical;
  const CurrentIcon = currentStage.icon;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        width: "100%",
        maxWidth: "320px",
        padding: "14px",
        borderRadius: "18px",
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(217, 130, 54, 0.2)",
        boxShadow: "0 8px 24px rgba(33, 25, 20, 0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={13} className="text-[#d98236]" />
          <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8b4513" }}>
            {isVi ? "Tiến độ chặng" : "Stage Progress"}
          </span>
        </div>
        <span style={{ fontSize: "10.5px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", background: "rgba(217, 130, 54, 0.12)", color: "#d98236" }}>
          {isVi ? `Chặng ${safeIndex + 1}/${activeStages.length}` : `Stage ${safeIndex + 1}/${activeStages.length}`}
        </span>
      </div>

      {/* Horizontal connector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: activeStages.length === 1 ? "center" : "space-between", position: "relative", padding: "4px 8px 10px 8px" }}>
        {activeStages.map((stage, idx) => {
          const isFinished = idx < safeIndex;
          const isCurrent = idx === safeIndex;
          const isLast = idx === activeStages.length - 1;

          return (
            <React.Fragment key={stage.id}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", zIndex: 2, position: "relative", minWidth: "60px" }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", display: "grid", placeItems: "center",
                  background: isFinished ? "#10b981" : isCurrent ? "#d98236" : "rgba(255, 255, 255, 0.9)",
                  border: isFinished ? "2px solid #10b981" : isCurrent ? "2.5px solid #d98236" : "2px solid rgba(106, 72, 49, 0.3)",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(217, 130, 54, 0.25), 0 2px 8px rgba(217, 130, 54, 0.4)" : isFinished ? "0 0 0 3px rgba(16, 185, 129, 0.2)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {isFinished ? <Check size={10} color="#ffffff" strokeWidth={3.5} /> : isCurrent ? <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} /> : null}
                </div>
                <span style={{ fontSize: "10.5px", fontWeight: isCurrent ? "800" : isFinished ? "700" : "600", color: isCurrent ? "#d98236" : isFinished ? "#065f46" : "rgba(33, 25, 20, 0.55)", textAlign: "center", whiteSpace: "nowrap" }}>
                  {stage.id === "warmup" ? (isVi ? "Khởi động" : "Warm-up") : stage.id === "technical" ? (isVi ? "Chuyên môn" : "Technical") : (isVi ? "Chào kết" : "Closing")}
                </span>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: isCurrent ? "#8b4513" : "rgba(33, 25, 20, 0.4)" }}>
                  {idx + 1}/{activeStages.length}
                </span>
              </div>
              {!isLast && (
                <div style={{
                  flex: 1, height: "3px", margin: "-18px 4px 0 4px", borderRadius: "999px",
                  background: idx < safeIndex ? "#10b981" : idx === safeIndex ? "linear-gradient(90deg, #d98236 0%, rgba(217, 130, 54, 0.3) 100%)" : "rgba(106, 72, 49, 0.15)",
                  transition: "background 0.3s ease", zIndex: 1,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active stage detail card */}
      <div style={{ padding: "12px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(217, 130, 54, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%)", border: "1.5px solid rgba(217, 130, 54, 0.35)", boxShadow: "0 4px 14px rgba(217, 130, 54, 0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(135deg, #d98236 0%, #8b4513 100%)", display: "grid", placeItems: "center", color: "#ffffff", boxShadow: "0 2px 8px rgba(217, 130, 54, 0.35)" }}>
            <CurrentIcon size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#211914" }}>
              {isVi ? currentStage.nameVi : currentStage.nameEn}
            </div>
            <div style={{ fontSize: "10px", color: "#8b4513", fontWeight: "700" }}>
              {isVi ? `Lượt: ${currentTurnInStage} / ~${targetTurnsInStage}` : `Turn: ${currentTurnInStage} / ~${targetTurnsInStage}`}
            </div>
          </div>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "11px", color: "rgba(45, 31, 23, 0.8)", lineHeight: "1.4" }}>
          {isVi ? currentStage.descVi : currentStage.descEn}
        </p>
        <div style={{ margin: "8px 0 0", paddingTop: "8px", borderTop: "1px dashed rgba(217, 130, 54, 0.25)", display: "flex", flexDirection: "column", gap: "3px" }}>
          {(isVi ? currentStage.subtopicsVi : currentStage.subtopicsEn).map((sub, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10.5px", color: "#211914" }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#d98236" }} />
              <span>{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
