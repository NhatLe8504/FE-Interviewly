"use client";

import { Bot, Volume2, VolumeX, Mic, BrainCircuit, Check, Play, Square } from "lucide-react";
import type { AiStageState } from "@/hooks/useInterviewSession";
import { UserTooltip } from "@/components/user-component/common";

interface AiStageAvatarProps {
  state: AiStageState;
  roleName?: string;
  isSpeakingAudio?: boolean;
  isAutoSpeak?: boolean;
  isAudioSupported?: boolean;
  onPlayAudio?: () => void;
  onStopAudio?: () => void;
  onToggleAutoSpeak?: () => void;
}

export function AiStageAvatar({
  state,
  roleName = "AI Coach",
  isSpeakingAudio = false,
  isAutoSpeak = true,
  isAudioSupported = true,
  onPlayAudio,
  onStopAudio,
  onToggleAutoSpeak,
}: AiStageAvatarProps) {
  const stateConfig = {
    speaking: {
      label: isSpeakingAudio ? "AI đang phát âm câu hỏi…" : "AI đang đặt câu hỏi…",
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
        justifyContent: "space-between",
        padding: "16px 20px",
        borderRadius: "18px",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Animated Orb Container */}
        <div
          style={{
            position: "relative",
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: stateConfig.bgLight,
            border: `2px solid ${stateConfig.borderColor}`,
            boxShadow: `0 0 20px ${stateConfig.bgLight}`,
            transition: "all 0.4s ease",
          }}
        >
          {/* Pulsing Ripple rings when active or speaking audio */}
          {(state === "speaking" || state === "listening" || isSpeakingAudio) && (
            <span
              style={{
                position: "absolute",
                inset: "-6px",
                borderRadius: "50%",
                border: `2px solid ${stateConfig.color}`,
                opacity: 0.4,
                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
          )}

          <CurrentIcon
            size={24}
            color={stateConfig.color}
            style={{
              transition: "transform 0.3s ease",
              transform: state === "speaking" || isSpeakingAudio ? "scale(1.1)" : "scale(1)",
            }}
          />
        </div>

        {/* Text descriptions */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: "#111827",
                letterSpacing: "-0.01em",
              }}
            >
              {roleName}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: stateConfig.bgLight,
                color: stateConfig.color,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: stateConfig.color,
                }}
              />
              {stateConfig.label}
            </span>
          </div>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#6b7280",
              lineHeight: "1.4",
            }}
          >
            {stateConfig.sub}
          </p>
        </div>
      </div>

      {/* Interactive AI Audio Voice Controls */}
      {isAudioSupported && state !== "idle" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isSpeakingAudio ? (
            <UserTooltip content="Dừng phát âm câu hỏi">
              <button
                type="button"
                onClick={onStopAudio}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "1px solid #fed7aa",
                  backgroundColor: "#fff7ed",
                  color: "#ea580c",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(234, 88, 12, 0.15)",
                }}
              >
                <Square size={13} fill="#ea580c" />
                <span>Dừng đọc</span>
              </button>
            </UserTooltip>
          ) : (
            <UserTooltip content="Nghe AI đọc to câu hỏi">
              <button
                type="button"
                onClick={onPlayAudio}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.15s ease",
                }}
              >
                <Volume2 size={14} color="#ff7a45" />
                <span>Nghe câu hỏi</span>
              </button>
            </UserTooltip>
          )}

          {onToggleAutoSpeak && (
            <UserTooltip content={isAutoSpeak ? "Tắt tự động đọc câu hỏi" : "Bật tự động đọc câu hỏi"}>
              <button
                type="button"
                onClick={onToggleAutoSpeak}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: isAutoSpeak ? "#f0fdf4" : "#f9fafb",
                  color: isAutoSpeak ? "#16a34a" : "#9ca3af",
                  cursor: "pointer",
                }}
              >
                {isAutoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </UserTooltip>
          )}
        </div>
      )}
    </div>
  );
}