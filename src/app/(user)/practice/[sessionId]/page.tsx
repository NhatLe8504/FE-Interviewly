"use client";

import { use, useEffect, useState, useMemo, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  Keyboard,
  Send,
  StopCircle,
  Clock,
  Check,
  BrainCircuit,
  Volume2,
  VolumeX,
  Loader2,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertCircle,
  FastForward,
  RotateCcw,
} from "lucide-react";
import { useRealtimeVoiceInterview } from "@/hooks/useRealtimeVoiceInterview";
import { useVoiceAnswerDraft } from "@/hooks/useVoiceAnswerDraft";
import type { StageConfigIn } from "@/types/interview";
import { ChromaVideoCanvas } from "./components/ChromaVideoCanvas";
import { VoiceAnswerPanel } from "./components/VoiceAnswerPanel";
import { InterviewStagesTimeline } from "./components/InterviewStagesTimeline";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { SimpleUserSelect } from "@/components/user-component/common";
import { ConversationTimelineDrawer } from "./components/ConversationTimelineDrawer";
import { UserTooltip } from "@/components/user-component/common";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { INTERVIEW_LANGUAGES, getInterviewLanguage, type InterviewLanguage } from "@/lib/interviewLanguages";
import styles from "./interviewRoom.module.css";

interface SessionMetaStored {
  roleLabel?: string;
  companyName?: string;
  domainLabel?: string;
  levelLabel?: string;
  languageLabel?: string;
  language?: InterviewLanguage;
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

  const [isClientMounted, setIsClientMounted] = useState(false);
  const [meta, setMeta] = useState<SessionMetaStored>({});
  const [currentMode, setCurrentMode] = useState<"voice" | "text">("voice");
  const [language, setLanguage] = useState<InterviewLanguage>("vi");
  const [typedText, setTypedText] = useState("");
  const isVoiceMode = currentMode === "voice";

  useEffect(() => {
    const initialLanguage = new URL(window.location.href).searchParams.get("language") ?? "vi";
    try {
      const raw = sessionStorage.getItem(`session_metadata_${sessionId}`);
      if (raw) {
        const stored: SessionMetaStored = JSON.parse(raw);
        setMeta(stored);
        setCurrentMode(stored.mode === "text" ? "text" : "voice");
        setLanguage(getInterviewLanguage(stored.language ?? (stored.languageLabel === "English" ? "en" : initialLanguage)).code);
      } else {
        setLanguage(getInterviewLanguage(initialLanguage).code);
      }
    } catch {
      setLanguage(getInterviewLanguage(initialLanguage).code);
    }
    setIsClientMounted(true);
  }, [sessionId]);

  const roleName = meta.roleLabel || "Software Engineer";
  const level = meta.levelLabel || "Senior";
  const selectedStages = useMemo(() => meta.selected_stages || ["warmup", "technical", "closing"], [meta.selected_stages]);

  // Realtime Voice Interview Hook (WebSocket + STT + Audio Queue + Barge-in)
  const {
    isConnected,
    isReconnecting,
    reconnectCount,
    aiState,
    isCompleted,
    error,
    sessionDurationSeconds,
    currentStage,
    turnId,
    turnInStage,
    targetTurnsInStage,
    currentQuestion,
    currentSubtitle,
    turns,
    isAudioPlaying,
    isAudioMuted,
    audioBlockedByAutoplay,
    toggleAudioMute,
    resumeAudio,
    sendTextMessage,
    interruptAi,
    skipToNextStage,
    endSessionEarly,
    currentIntent,
    rerollQuestion,
  } = useRealtimeVoiceInterview({
    sessionId,
    enabled: isClientMounted,
    roleName,
    level,
    language,
    selectedStages,
    stageConfigs: meta.stage_configs,
    bargeInInitial: meta.bargeInEnabled ?? false,
  });

  const canAnswer = isConnected && aiState === "listening" && !isAudioPlaying && !isCompleted;
  const voiceDraft = useVoiceAnswerDraft({
    enabled: isClientMounted && isVoiceMode && !isCompleted,
    canRecord: canAnswer,
    language,
    onSubmit: sendTextMessage,
  });
  const canSendText = canAnswer && !["requesting", "recording", "processing"].includes(voiceDraft.state);

  function changeInterviewLanguage(code: string) {
    if (!canSendText) return;
    const selected = getInterviewLanguage(code);
    const updated = { ...meta, language: selected.code, languageLabel: selected.label };
    setLanguage(selected.code);
    setMeta(updated);
    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(updated));
    } catch {
      return;
    }
  }

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
    if (!clean || !canSendText) return;
    if (sendTextMessage(clean)) {
      setTypedText("");
      voiceDraft.discard();
    }
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

  useEffect(() => {
    const handleGlobalSpace = (e: globalThis.KeyboardEvent) => {
      if (e.code === "Space" && (aiState === "speaking" || isAudioPlaying)) {
        const target = e.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        if (tagName !== "input" && tagName !== "textarea") {
          e.preventDefault();
          interruptAi();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalSpace);
    return () => window.removeEventListener("keydown", handleGlobalSpace);
  }, [aiState, isAudioPlaying, interruptAi]);

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
            <span>{voiceDraft.state === "recording" ? "Đang thu câu trả lời" : voiceDraft.state === "review" ? "Chờ bạn gửi câu trả lời" : "Sẵn sàng nhận câu trả lời"}</span>
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
      <header className={styles.roomHeading}>
        <div>
          <span className={styles.roomEyebrow}>INTERVIEWLY / PHÒNG LUYỆN TẬP</span>
          <h1>Luyện phỏng vấn theo nhịp của bạn</h1>
          <p>Nghe câu hỏi. Thu câu trả lời. Chỉ gửi khi bạn đã sẵn sàng.</p>
        </div>
        <span className={styles.sessionModeBadge}>{isVoiceMode ? <Mic size={16} /> : <Keyboard size={16} />}{isVoiceMode ? "Giọng nói" : "Văn bản"}</span>
      </header>
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
        onInsertStarter={(starter) => {
          setCurrentMode("text");
          setTypedText((prev) => (prev ? `${prev}\n\n${starter}` : starter))
        }}
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
                disabled={!canAnswer || voiceDraft.state !== "idle"}
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
                  width={180}
                  height={180}
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
              <h2 className={styles.interviewerName} suppressHydrationWarning>{persona.name}</h2>
              <p className={styles.interviewerTitle} suppressHydrationWarning>
                {isClientMounted
                  ? `${persona.title} • ${meta.companyName || "Doanh nghiệp mục tiêu"}`
                  : "AI Interviewer • Doanh nghiệp mục tiêu"}
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

              <div className="space-y-2">
                <label htmlFor="interview-language" className="portal-field-label">
                  {locale === "en" ? "Interview language" : "Ngôn ngữ phỏng vấn"}
                </label>
                <SimpleUserSelect
                  id="interview-language"
                  value={language}
                  disabled={!canSendText}
                  onChange={(val) => changeInterviewLanguage(val)}
                  options={INTERVIEW_LANGUAGES.map((opt) => ({ value: opt.code, label: opt.label }))}
                  aria-label={locale === "en" ? "Interview language" : "Ngôn ngữ phỏng vấn"}
                />
                <p id="interview-language-help" className="portal-help-text">
                  {locale === "en"
                    ? "Change while AI waits for your answer. Applies to its next response, not the interface."
                    : "Đổi khi AI đang chờ bạn trả lời. Áp dụng cho phản hồi tiếp theo, không đổi ngôn ngữ giao diện."}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className={styles.modeToggleGroup}>
                <Button
                  type="button"
                  variant="home-choice"
                  size="home-compact"
                  onClick={() => setCurrentMode("voice")}
                  className="flex-1"
                  aria-pressed={isVoiceMode}
                  title="Trả lời bằng giọng nói"
                >
                  <Mic size={12} />
                  <span>Giọng nói</span>
                </Button>
                <Button
                  type="button"
                  variant="home-choice"
                  size="home-compact"
                  onClick={() => setCurrentMode("text")}
                  className="flex-1"
                  aria-pressed={!isVoiceMode}
                  title="Trả lời bằng văn bản"
                >
                  <Keyboard size={12} />
                  <span>Văn bản</span>
                </Button>
              </div>


              {/* Speaker Mute Toggle */}
              {audioBlockedByAutoplay && <button type="button" className={styles.audioResumeButton} onClick={() => void resumeAudio()}><Volume2 size={17} />Bật tiếng AI để nghe câu hỏi</button>}
              <button
                type="button"
                onClick={toggleAudioMute}
                title={isAudioMuted ? "Bật âm thanh AI" : "Tắt âm thanh AI"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  background: isAudioMuted ? "rgba(220, 38, 38, 0.08)" : "rgba(106, 72, 49, 0.05)",
                  border: isAudioMuted ? "1px solid rgba(220, 38, 38, 0.3)" : "1px solid rgba(106, 72, 49, 0.1)",
                  fontSize: "11px",
                  cursor: "pointer",
                  color: isAudioMuted ? "#dc2626" : "inherit",
                }}
              >
                <span style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: 5 }}>
                  {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  Loa AI:
                </span>
                <span style={{ fontWeight: "800" }}>{isAudioMuted ? "TẮT" : "BẬT"}</span>
              </button>

              {/* Connection Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: isReconnecting ? "#d97706" : isConnected ? "#059669" : "#dc2626",
                  fontWeight: "700",
                }}
              >
                {isReconnecting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Đang nối lại... ({reconnectCount}/5)</span>
                  </>
                ) : isConnected ? (
                  <>
                    <Wifi size={12} />
                    <span>Realtime WebSocket</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Mất kết nối</span>
                  </>
                )}
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
                  disabled={voiceDraft.state !== "idle"}
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
              <span>Chủ đề kiểm tra:</span>
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
            {currentQuestion ||
              currentSubtitle ||
              "Xin chào, AI đang chuẩn bị câu hỏi mở đầu cho bạn..."}
            &rdquo;
            {aiState === "speaking" && <span className={styles.typewriterCursor} />}
          </p>
          {currentSubtitle && (isAudioPlaying || aiState === "speaking") && <p className={styles.spokenCaption}>Đang nói: {currentSubtitle}</p>}


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
          isVoiceMode ? (
            <VoiceAnswerPanel
              draft={voiceDraft}
              canRecord={canAnswer}
              isConnected={isConnected}
              isAiSpeaking={aiState === "speaking" || isAudioPlaying}
              onInterrupt={interruptAi}
              onSwitchToText={() => setCurrentMode("text")}
            />
          ) : (
            <section className={styles.responseConsole} aria-labelledby="text-answer-title">
              <div className={styles.consoleTopBar}>
                <label id="text-answer-title" htmlFor="typed-answer" className={styles.consoleHint}>Câu trả lời của bạn • Chỉ gửi khi bạn đã sẵn sàng</label>
              </div>
              <div className={styles.inputAreaWrapper}>
                <textarea id="typed-answer" className={styles.candidateTextarea} placeholder="Nhập câu trả lời chi tiết của bạn…" value={typedText} onChange={(event) => setTypedText(event.target.value)} onKeyDown={handleKeyDown} rows={4} />
                <div className={styles.inputActionRow}>
                  <span className={styles.charCounter}>{canSendText ? "Ctrl / ⌘ + Enter để gửi" : "Đợi AI nói xong để gửi câu trả lời"}</span>
                  <button type="button" className={styles.btnSubmitAnswer} onClick={handleSendText} disabled={!typedText.trim() || !canSendText}><span>Gửi câu trả lời</span><Send size={16} /></button>
                </div>
              </div>
            </section>
          )
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
              Bạn đã kết thúc phiên luyện tập. Có thể mở trang kết quả để xem dữ liệu hiện có của phiên.
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
