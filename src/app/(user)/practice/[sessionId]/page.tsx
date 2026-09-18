"use client";

import { use, useEffect, useState, useMemo, KeyboardEvent, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  MicOff,
  Keyboard,
  Send,
  StopCircle,
  Clock,
  Check,
  BrainCircuit,
  Volume2,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertCircle,
  HelpCircle,
  Square,
  FastForward,
  RotateCcw,
} from "lucide-react";
import { useRealtimeVoiceInterview } from "@/hooks/useRealtimeVoiceInterview";
import type { StageConfigIn } from "@/types/interview";
import { ChromaVideoCanvas } from "./components/ChromaVideoCanvas";
import { AudioWaveformVisualizer } from "./components/AudioWaveformVisualizer";
import { InterviewStagesTimeline } from "./components/InterviewStagesTimeline";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { ConversationTimelineDrawer } from "./components/ConversationTimelineDrawer";
import { UserTooltip } from "@/components/user-component/common";
import { useI18n } from "@/context/I18nContext";
import styles from "./interviewRoom.module.css";

interface SessionMetaStored {
  roleLabel?: string;
  companyName?: string;
  domainLabel?: string;
  levelLabel?: string;
  languageLabel?: string;
  mode?: "voice" | "text";
  bargeInEnabled?: boolean;
  selected_stages?: string[];
  stage_configs?: StageConfigIn[];
  totalQuestions?: number;
}

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { locale } = useI18n();

  // Read session metadata from sessionStorage
  const meta: SessionMetaStored = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = sessionStorage.getItem(`session_metadata_${sessionId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [sessionId]);

  const roleName = meta.roleLabel || "Software Engineer";
  const level = meta.levelLabel || "Senior";
  const language = meta.languageLabel === "English" ? "en" : "vi";
  const selectedStages = meta.selected_stages || ["warmup", "technical", "closing"];

  // Realtime Voice Interview Hook (WebSocket + STT + Audio Queue + Barge-in)
  const {
    isConnected,
    aiState,
    isCompleted,
    error,
    sessionDurationSeconds,
    currentStage,
    stagesList,
    turnId,
    turnInStage,
    targetTurnsInStage,
    currentQuestion,
    currentSubtitle,
    candidateTranscript,
    interimTranscript,
    turns,
    volume,
    isAudioPlaying,
    isMicActive,
    bargeInEnabled,
    toggleBargeIn,
    toggleMic,
    sendTextMessage,
    skipToNextStage,
    endSessionEarly,
    currentIntent,
    rerollQuestion,
  } = useRealtimeVoiceInterview({
    sessionId,
    roleName,
    level,
    language,
    selectedStages,
    stageConfigs: meta.stage_configs,
    bargeInInitial: meta.bargeInEnabled ?? false,
  });

  const [currentMode, setCurrentMode] = useState<"voice" | "text">(
    meta.mode === "text" ? "text" : "voice"
  );
  const [typedText, setTypedText] = useState("");
  const isVoiceMode = currentMode === "voice";

  // Character Persona
  const isLeadLevel =
    level.toLowerCase().includes("lead") ||
    level.toLowerCase().includes("staff") ||
    level.toLowerCase().includes("architect");

  const persona = isLeadLevel
    ? {
        name: "Marcus Chen",
        title: `${roleName} • Lead Panelist`,
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        videoUrl: "/videos/leader.mp4",
      }
    : {
        name: "Alex Vance",
        title: `${roleName} • Senior Interviewer`,
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        videoUrl: "/videos/senior.mp4",
      };

  // Clock format mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSendText = () => {
    const clean = typedText.trim();
    if (!clean) return;
    sendTextMessage(clean);
    setTypedText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleEndInterview = () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc buổi phỏng vấn này?")) {
      endSessionEarly();
      router.push(`/practice/${sessionId}/result`);
    }
  };

  // AI State Badge
  const renderStateBadge = () => {
    switch (aiState) {
      case "speaking":
        return (
          <span
            className={`${styles.aiStatePill} ${styles.stateSpeaking}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "800",
              background: "rgba(217, 130, 54, 0.15)",
              color: "#d98236",
              border: "1px solid rgba(217, 130, 54, 0.3)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#d98236",
                boxShadow: "0 0 0 3px rgba(217, 130, 54, 0.3)",
                animation: "pulse 1.5s infinite",
              }}
            />
            <Volume2 size={12} />
            <span>AI Đang Đặt Câu Hỏi (Nói để ngắt lời)</span>
          </span>
        );
      case "listening":
        return (
          <span
            className={`${styles.aiStatePill} ${styles.stateListening}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "800",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#059669",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.3)",
              }}
            />
            <Mic size={12} />
            <span>AI Đang Lắng Nghe Bạn Nói...</span>
          </span>
        );
      case "thinking":
        return (
          <span
            className={`${styles.aiStatePill} ${styles.stateThinking}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "800",
              background: "rgba(245, 158, 11, 0.12)",
              color: "#d97706",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.3)",
              }}
            />
            <BrainCircuit size={12} />
            <span>AI Đang Phân Tích Câu Trả Lời...</span>
          </span>
        );
      case "completed":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "800",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#059669",
            }}
          >
            <Check size={12} />
            <span>Buổi phỏng vấn đã hoàn tất</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "800",
              background: "rgba(106, 72, 49, 0.1)",
              color: "rgba(33,25,20,0.6)",
            }}
          >
            <Wifi size={12} />
            <span>Đang kết nối AI...</span>
          </span>
        );
    }
  };

  return (
    <div className={styles.roomShell}>
      {/* Side Drawers */}
      <ConversationTimelineDrawer
        turns={turns.map((t) => ({
          id: t.id,
          turnNumber: t.turnNumber,
          speaker: t.speaker,
          text: t.text,
        }))}
        currentTurnNumber={turnId}
      />
      <StarGuidanceDrawer
        starTip="Tập trung trả lời theo cấu trúc STAR: Situation (Bối cảnh) → Task (Nhiệm vụ) → Action (Hành động) → Result (Kết quả định lượng)."
        onInsertStarter={(starter) =>
          setTypedText((prev) => (prev ? `${prev}\n\n${starter}` : starter))
        }
      />

      {/* Main Card */}
      <main className={styles.mainInterviewCard}>
        <span className={styles.stageGlow} />

        {/* 3-COLUMN LAYOUT: LEFT (STAGES) | CENTER (AI AVATAR) | RIGHT (CONTROLS) */}
        <div className={styles.threePanelRow}>
          {/* =========================================================
              LEFT: DYNAMIC INTERVIEW STAGES TIMELINE
          ========================================================= */}
          <div className={styles.leftPanel}>
            <InterviewStagesTimeline
              selectedStages={selectedStages}
              currentStageId={currentStage.id}
              currentStageIndex={currentStage.index - 1}
              currentTurnInStage={turnInStage}
              targetTurnsInStage={targetTurnsInStage}
              locale={locale}
            />

            {/* Skip to Next Stage Button */}
            {!isCompleted && !currentStage.is_last && (
              <button
                type="button"
                onClick={skipToNextStage}
                style={{
                  marginTop: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#8b4513",
                  background: "rgba(217, 130, 54, 0.08)",
                  border: "1px solid rgba(217, 130, 54, 0.25)",
                  cursor: "pointer",
                }}
              >
                <FastForward size={12} />
                <span>Chuyển sang chặng tiếp theo</span>
              </button>
            )}
          </div>

          {/* =========================================================
              CENTER: AI INTERVIEWER CHARACTER STAGE
          ========================================================= */}
          <div className={styles.centerPanel}>
            <div className={styles.interviewerMediaStage}>
              {(isAudioPlaying || aiState === "speaking") && (
                <span className={styles.speakingHaloRing} />
              )}

              {isVoiceMode ? (
                <ChromaVideoCanvas
                  videoSrc={persona.videoUrl}
                  isPlaying={isAudioPlaying || aiState === "speaking"}
                  fallbackImageUrl={persona.avatarUrl}
                  characterName={persona.name}
                  width={240}
                  height={240}
                />
              ) : (
                <div className={styles.textModeAvatarBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className={styles.textModeAvatarImg}
                  />
                </div>
              )}
            </div>

            {/* AI State Badge & Character Name */}
            <div className={styles.interviewerMetaRow}>
              {renderStateBadge()}
              <h2 className={styles.interviewerName}>{persona.name}</h2>
              <p className={styles.interviewerTitle}>
                {persona.title} • {meta.companyName || "Doanh nghiệp mục tiêu"}
              </p>
            </div>
          </div>

          {/* =========================================================
              RIGHT: SESSION CONTROLS & TIMESTAMPS
          ========================================================= */}
          <div className={styles.rightPanel}>
            <div className={styles.rightControlsBox}>
              {/* Duration Timer */}
              <div className={styles.controlTimerRow}>
                <span
                  style={{
                    color: "rgba(45, 31, 23, 0.65)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "12px",
                  }}
                >
                  <Clock size={13} /> Thời gian
                </span>
                <span className={styles.controlTimerText}>
                  {formatTimer(sessionDurationSeconds)}
                </span>
              </div>

              {/* Mode Toggle */}
              <div className={styles.modeToggleGroup}>
                <button
                  type="button"
                  onClick={() => setCurrentMode("voice")}
                  className={`${styles.modeBtn} ${isVoiceMode ? styles.modeBtnActive : ""}`}
                  title="Chế độ Giọng nói"
                >
                  <Mic size={12} />
                  <span>Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMode("text")}
                  className={`${styles.modeBtn} ${!isVoiceMode ? styles.modeBtnActive : ""}`}
                  title="Chế độ Văn bản"
                >
                  <Keyboard size={12} />
                  <span>Text</span>
                </button>
              </div>

              {/* Barge-in Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  background: bargeInEnabled
                    ? "rgba(217, 130, 54, 0.1)"
                    : "rgba(106, 72, 49, 0.05)",
                  border: "1px solid rgba(106, 72, 49, 0.1)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
                onClick={toggleBargeIn}
                title="Cho phép nói để chen ngang khi AI đang nói"
              >
                <span style={{ fontWeight: "700", color: "#8b4513" }}>Barge-in (Ngắt lời):</span>
                <span
                  style={{
                    fontWeight: "800",
                    color: bargeInEnabled ? "#d98236" : "rgba(33,25,20,0.4)",
                  }}
                >
                  {bargeInEnabled ? "BẬT" : "TẮT"}
                </span>
              </div>

              {/* Connection Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: isConnected ? "#059669" : "#dc2626",
                  fontWeight: "700",
                }}
              >
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span>{isConnected ? "Realtime WebSocket" : "Mất kết nối"}</span>
              </div>

              {/* End Interview Button */}
              {!isCompleted && (
                <button
                  type="button"
                  className={styles.btnEndEarly}
                  onClick={handleEndInterview}
                  title="Kết thúc buổi phỏng vấn và xem kết quả"
                >
                  <StopCircle size={13} />
                  <span>Kết thúc phỏng vấn</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            REALTIME NATURAL SUBTITLE CAPSULE (AI QUESTION STREAMING)
        ========================================================= */}
        <div className={styles.subtitleGlassBox}>
          <div className={styles.subtitleTopRow}>
            <span>
              Lượt trao đổi #{turnId} • Chặng {currentStage.index}/{currentStage.total}:{" "}
              {currentStage.name}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Reroll question button */}
              {!isCompleted && aiState === "listening" && (
                <button
                  type="button"
                  onClick={rerollQuestion}
                  title="Yêu cầu AI đổi tình huống / câu hỏi khác trong ngân hàng đã duyệt"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "8px",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    color: "#8b4513",
                    background: "rgba(217, 130, 54, 0.12)",
                    border: "1px solid rgba(217, 130, 54, 0.3)",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Đổi tình huống</span>
                </button>
              )}

              {/* Audio Waveform when Mic is active */}
              {isVoiceMode && isMicActive && (
                <div style={{ width: "100px", height: "24px" }}>
                  <AudioWaveformVisualizer
                    isRecording={aiState === "listening" || Boolean(interimTranscript)}
                    volume={volume}
                    barCount={16}
                    height={24}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Competency / Intent Badge */}
          {currentIntent && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(217, 130, 54, 0.1)",
                border: "1px solid rgba(217, 130, 54, 0.25)",
                fontSize: "11px",
                fontWeight: "700",
                color: "#8b4513",
                marginBottom: "4px",
                width: "fit-content",
              }}
            >
              <span>🎯 Chủ đề kiểm tra:</span>
              <span style={{ color: "#211914", fontWeight: "800" }}>
                {currentIntent.topic_label || currentIntent.intent}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(45,31,23,0.55)" }}>
                (AI đặt theo tình huống thực tế)
              </span>
            </div>
          )}

          {/* Currently Spoken AI Subtitle */}
          <p className={styles.subtitleSpeechText}>
            &ldquo;
            {currentSubtitle ||
              currentQuestion ||
              "Xin chào, AI đang chuẩn bị câu hỏi mở đầu cho bạn..."}
            &rdquo;
            {aiState === "speaking" && <span className={styles.typewriterCursor} />}
          </p>

          {/* Realtime Candidate Speech Preview (STT feedback) */}
          {(interimTranscript || candidateTranscript) && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px dashed rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Mic size={14} className="text-[#059669] flex-shrink-0" />
              <div style={{ fontSize: "12px", color: "#065f46" }}>
                <strong>Bạn: </strong>
                <span>{interimTranscript || candidateTranscript}</span>
                {interimTranscript && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#10b981",
                      marginLeft: "4px",
                      animation: "pulse 1s infinite",
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {error && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                fontSize: "12px",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* =========================================================
            CANDIDATE RESPONSE CONSOLE (VOICE + TEXT INPUT)
        ========================================================= */}
        {!isCompleted ? (
          <div className={styles.responseConsole}>
            <div className={styles.consoleTopBar}>
              <span className={styles.consoleHint}>
                {isVoiceMode
                  ? "🎙️ Hãy nói tự nhiên vào micro. Hệ thống sẽ nhận diện giọng nói và phản hồi ngay lập tức."
                  : "⌨️ Nhập câu trả lời của bạn bên dưới và nhấn Ctrl+Enter hoặc nút Gửi."}
              </span>

              {/* Mic Toggle Button */}
              {isVoiceMode && (
                <button
                  type="button"
                  onClick={toggleMic}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    background: isMicActive
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                    color: isMicActive ? "#059669" : "#dc2626",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isMicActive ? <Mic size={12} /> : <MicOff size={12} />}
                  <span>{isMicActive ? "Micro: Bật" : "Micro: Tắt"}</span>
                </button>
              )}
            </div>

            {/* Hybrid Input Box */}
            <div className={styles.inputAreaWrapper}>
              <textarea
                className={styles.candidateTextarea}
                placeholder={
                  isVoiceMode
                    ? "Giọng nói của bạn sẽ tự động hiển thị ở đây... (Bạn cũng có thể gõ thêm văn bản tại đây)"
                    : "Nhập câu trả lời chi tiết của bạn tại đây..."
                }
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />

              <div className={styles.inputActionRow}>
                <span className={styles.charCounter}>Ctrl + Enter để gửi</span>

                <button
                  type="button"
                  className={styles.btnSubmitAnswer}
                  onClick={handleSendText}
                  disabled={!typedText.trim()}
                  title="Gửi câu trả lời"
                >
                  <span>Gửi câu trả lời</span>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When interview is completed */
          <div
            style={{
              padding: "24px",
              borderRadius: "18px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1.5px solid rgba(16, 185, 129, 0.3)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#10b981",
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <Check size={24} strokeWidth={3} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#065f46", margin: 0 }}>
              Chúc mừng bạn đã hoàn thành buổi phỏng vấn!
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(6, 95, 70, 0.8)", margin: 0, maxWidth: "500px" }}>
              Tất cả các câu trả lời qua giọng nói của bạn đã được ghi nhận. Báo cáo đánh giá
              Rubric và STAR đang được tổng hợp.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/practice/${sessionId}/result`)}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              Xem kết quả và bảng điểm Rubric →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
