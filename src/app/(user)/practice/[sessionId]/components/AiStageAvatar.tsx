"use client";

import { Bot, Volume2, Mic, BrainCircuit, Check } from "lucide-react";
import type { AiStageState } from "@/hooks/useInterviewSession";

interface AiStageAvatarProps {
  state: AiStageState;
  roleName?: string;
}

export function AiStageAvatar({ state, roleName = "AI Coach" }: AiStageAvatarProps) {
  const stateConfig = {
    speaking: {
      label: "AI đang đặt câu hỏi…",
      sub: "Lắng nghe kỹ yêu cầu trước khi trả lời",
      color: "#ff7a45",
      bgLight: "rgba(255, 122, 69, 0.12)",
      borderColor: "#ff7a45",
      icon: Volume2,
    },
    listening: {
      label: "Đang lắng nghe bạn…",
      sub: "Hãy tự tin diễn đạt theo cấu trúc STAR",
      color: "#10b981",
      bgLight: "rgba(16, 185, 129, 0.12)",
      borderColor: "#10b981",
      icon: Mic,
    },
    thinking: {
      label: "AI đang phân tích câu trả lời…",
      sub: "Đánh giá các tiêu chí Rubric và tạo câu hỏi đào sâu",
      color: "#8b5cf6",
      bgLight: "rgba(139, 92, 246, 0.12)",
      borderColor: "#8b5cf6",
      icon: BrainCircuit,
    },
    idle: {
      label: "Phiên phỏng vấn đã hoàn tất",
      sub: "Báo cáo năng lực và bảng điểm đã sẵn sàng",
      color: "#6b7280",
      bgLight: "rgba(107, 114, 128, 0.12)",
      borderColor: "#d1d5db",
      icon: Check,
    },
  }[state];

  const CurrentIcon = stateConfig.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "16px 20px",
        borderRadius: "18px",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Animated Orb Container */}
      <div
        style={{
          position: "relative",
          width: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Pulsing halo ring */}
        <div
          style={{
            position: "absolute",
            inset: state === "speaking" ? "-6px" : "-2px",
            borderRadius: "50%",
            backgroundColor: stateConfig.color,
            opacity: state === "speaking" ? 0.35 : 0.15,
            transition: "all 0.4s ease",
            animation:
              state === "speaking"
                ? "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite"
                : state === "thinking"
                ? "spin 3s linear infinite"
                : "none",
          }}
        />

        {/* Central Avatar Orb */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${stateConfig.color} 0%, #1f2937 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: `0 4px 14px ${stateConfig.color}40`,
            zIndex: 1,
            transition: "background 0.4s ease",
          }}
        >
          <Bot size={26} />
        </div>

        {/* Status Badge in corner */}
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: stateConfig.color,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #ffffff",
            zIndex: 2,
          }}
        >
          <CurrentIcon size={11} />
        </div>
      </div>

      {/* Label and description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#111827" }}>
            {roleName}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: stateConfig.bgLight,
              color: stateConfig.color,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: stateConfig.color,
                display: "inline-block",
              }}
            />
            {stateConfig.label}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#6b7280",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stateConfig.sub}
        </p>
      </div>
    </div>
  );
}
