"use client";

import { use, useEffect, useState, useMemo, useCallback, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  Keyboard,
  Send,
  Clock,
  Check,
  BrainCircuit,
  Volume2,
  VolumeX,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  FastForward,
  RotateCcw,
  Settings,
  X,
  Play,
  Square,
  Coffee,
  Briefcase,
  Handshake,
  Bot,
  User,
  Trash2,
} from "lucide-react";
import { useRealtimeVoiceInterview } from "@/hooks/useRealtimeVoiceInterview";
import { useVoiceAnswerDraft } from "@/hooks/useVoiceAnswerDraft";
import type { StageConfigIn } from "@/types/interview";
import { ChromaVideoCanvas } from "./components/ChromaVideoCanvas";
import { AudioWaveformVisualizer } from "./components/AudioWaveformVisualizer";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { SimpleUserSelect } from "@/components/user-component/common";
import { voiceApi, type VoiceOptionItem, type VoiceOptionsResponse } from "@/services/voiceApi";
import { toast } from "@/components/user-component/toast/UserToast";
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
  voice?: string;
}

const THREE_STAGES = [
  { id: "warmup", label: "Khởi động", icon: Coffee },
  { id: "technical", label: "Chuyên môn", icon: Briefcase },
  { id: "closing", label: "Chào kết", icon: Handshake },
];

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const { sessionId } = use(params);
  const { locale } = useI18n();

  const [isClientMounted, setIsClientMounted] = useState(false);
  const [meta, setMeta] = useState<SessionMetaStored>({});
  const [currentMode, setCurrentMode] = useState<"voice" | "text">("voice");
  const [language, setLanguage] = useState<InterviewLanguage>("vi");
  const [typedText, setTypedText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStarOpen, setIsStarOpen] = useState(false);

  // Voice & STT Tiering states
  const [voiceOptions, setVoiceOptions] = useState<VoiceOptionsResponse | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("vi-VN-HoaiMyNeural");
  const [selectedSttEngine, setSelectedSttEngine] = useState<string>("browser-speech-api");

  // Audio replay in Messenger feeds
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll refs
  const aiScrollRef = useRef<HTMLDivElement | null>(null);
  const userScrollRef = useRef<HTMLDivElement | null>(null);

  const isVoiceMode = currentMode === "voice";

  // Fetch Voice & STT Options
  useEffect(() => {
    let isSubscribed = true;
    voiceApi
      .getVoiceOptions()
      .then((res) => {
        if (!isSubscribed) return;
        setVoiceOptions(res);
        const def = res.voices.find((v) => v.is_default);
        if (def && !meta.voice) {
          setSelectedVoice(def.id);
        }
      })
      .catch((err) => {
        console.warn("Failed to load voice options:", err);
      });
    return () => {
      isSubscribed = false;
    };
  }, [meta.voice]);

  // Load session meta from sessionStorage
  useEffect(() => {
    const initialLanguage = new URL(window.location.href).searchParams.get("language") ?? "vi";
    try {
      const raw = sessionStorage.getItem(`session_metadata_${sessionId}`);
      if (raw) {
        const stored: SessionMetaStored = JSON.parse(raw);
        setMeta(stored);
        setCurrentMode(stored.mode === "text" ? "text" : "voice");
        setLanguage(getInterviewLanguage(stored.language ?? (stored.languageLabel === "English" ? "en" : initialLanguage)).code);
        if (stored.voice) setSelectedVoice(stored.voice);
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

  // Realtime Voice Interview Hook
  const {
    isConnected,
    isReconnecting,
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
    rerollQuestion,
    changeVoice,
    updateTurnAudioUrl,
  } = useRealtimeVoiceInterview({
    sessionId,
    enabled: isClientMounted,
    roleName,
    level,
    language,
    voice: selectedVoice,
    selectedStages,
    stageConfigs: meta.stage_configs,
    bargeInInitial: meta.bargeInEnabled ?? false,
  });

  const canAnswer = isConnected && aiState === "listening" && !isAudioPlaying && !isCompleted;

  // Candidate Voice Answer Submission with Audio Cache upload
  const handleVoiceSubmit = useCallback(
    (text: string, durationSeconds: number, audioBlob?: Blob | null) => {
      const localAudioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;
      const curTurn = turnId;

      const sent = sendTextMessage(text, durationSeconds, localAudioUrl);
      if (!sent) return false;

      if (audioBlob) {
        voiceApi
          .uploadUserTurnAudio(sessionId, curTurn, audioBlob)
          .then((res) => {
            if (res.audio_url) {
              updateTurnAudioUrl("user", curTurn, res.audio_url);
            }
          })
          .catch((err) => {
            console.warn("Failed to upload turn audio:", err);
          });
      }

      return true;
    },
    [sendTextMessage, sessionId, turnId, updateTurnAudioUrl]
  );

  const voiceDraft = useVoiceAnswerDraft({
    enabled: isClientMounted && isVoiceMode && !isCompleted,
    canRecord: canAnswer,
    language,
    onSubmit: handleVoiceSubmit,
  });

  const canSendText = canAnswer && !["requesting", "recording", "processing"].includes(voiceDraft.state);

  // Settings Handlers
  const handleVoiceChange = (newVoiceId: string) => {
    const item = voiceOptions?.voices.find((v) => v.id === newVoiceId);
    if (item?.is_locked) {
      toast({
        title: "Tính năng dành riêng cho gói Pro",
        description: item.lock_reason || "Giọng đọc biểu cảm cao cấp ElevenLabs dành riêng cho tài khoản Pro / Sprint.",
        variant: "warning",
      });
      return;
    }
    setSelectedVoice(newVoiceId);
    changeVoice(newVoiceId);
    const updated = { ...meta, voice: newVoiceId };
    setMeta(updated);
    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(updated));
    } catch {}
  };

  const handleSttEngineChange = (newEngineId: string) => {
    const item = voiceOptions?.stt_engines.find((e) => e.id === newEngineId);
    if (item?.is_locked) {
      toast({
        title: "Tính năng dành riêng cho gói Pro",
        description: item.lock_reason || "Nhận diện giọng nói đa âm sắc Whisper Pro yêu cầu gói Pro.",
        variant: "warning",
      });
      return;
    }
    setSelectedSttEngine(newEngineId);
  };

  function changeInterviewLanguage(code: string) {
    if (!canSendText) return;
    const selected = getInterviewLanguage(code);
    const updated = { ...meta, language: selected.code, languageLabel: selected.label };
    setLanguage(selected.code);
    setMeta(updated);
    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(updated));
    } catch {}
  }

  // Persona Character setup
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

  // Audio Replay Player Toggle
  const togglePlayAudio = (key: string, url: string) => {
    if (playingAudioKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioKey(null);
      return;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    setPlayingAudioKey(key);
    audio.onended = () => setPlayingAudioKey(null);
    audio.onerror = () => setPlayingAudioKey(null);
    audio.play().catch(() => setPlayingAudioKey(null));
  };

  // Separate AI turns and Candidate turns
  const aiTurns = useMemo(() => turns.filter((t) => t.speaker === "ai"), [turns]);
  const userTurns = useMemo(() => turns.filter((t) => t.speaker === "user"), [turns]);

  // Auto scroll messenger streams
  useEffect(() => {
    aiScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiTurns.length, currentQuestion]);

  useEffect(() => {
    userScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userTurns.length]);

  // Determine current stage index among the 3 stages: warmup -> technical -> closing
  const currentStageIdx = useMemo(() => {
    const sid = (currentStage.id || "").toLowerCase();
    if (sid.includes("warm") || sid.includes("khởi")) return 0;
    if (sid.includes("tech") || sid.includes("chuyên")) return 1;
    if (sid.includes("clos") || sid.includes("kết")) return 2;
    return Math.min(Math.max((currentStage.index || 1) - 1, 0), 2);
  }, [currentStage]);

  // Spacebar to interrupt AI
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

  const renderStateBadge = () => {
    switch (aiState) {
      case "speaking":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateSpeaking}`}>
            <span className={styles.statePulseDot} />
            <Volume2 size={11} />
            <span>AI đang nói...</span>
          </span>
        );
      case "listening":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateListening}`}>
            <span className={styles.statePulseDot} />
            <Mic size={11} />
            <span>Đang lắng nghe bạn</span>
          </span>
        );
      case "thinking":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateThinking}`}>
            <span className={styles.statePulseDot} />
            <BrainCircuit size={11} />
            <span>AI đang phân tích...</span>
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateIdle}`}>
            <Check size={11} />
            <span>Đã hoàn tất phiên</span>
          </span>
        );
      default:
        return (
          <span className={`${styles.aiStatePill} ${styles.stateIdle}`}>
            <Wifi size={11} />
            <span>Sẵn sàng</span>
          </span>
        );
    }
  };

  return (
    <div className={styles.roomShell}>
      {/* =========================================================
          TOP NAVIGATION BAR (ROOM HEADER)
      ========================================================= */}
      <header className={styles.topBar}>
        {/* Left: Brand, Role & Connection */}
        <div className={styles.topBarLeft}>
          <div className={styles.brandLogo}>
            <span>✦</span> interviewly
          </div>
          <span className={styles.topDivider} />
          <div className={styles.roleBadgePill} title={`${persona.name} • ${roleName}`}>
            <span
              className={`${styles.wsStatusDot} ${
                isReconnecting
                  ? styles.wsReconnecting
                  : isConnected
                  ? styles.wsConnected
                  : styles.wsDisconnected
              }`}
              title={isConnected ? "Kết nối Realtime Live" : "Đang kết nối lại"}
            />
            <span>{persona.name} • {roleName}</span>
          </div>
        </div>

        {/* Center: 3 STAGES PROGRESS STEPPER (KHỞI ĐỘNG - CHUYÊN MÔN - CHÀO KẾT) */}
        <div className={styles.topBarCenter}>
          <div className={styles.topStagesContainer}>
            {THREE_STAGES.map((stage, idx) => {
              const isFinished = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    className={`${styles.stageStepItem} ${
                      isCurrent
                        ? styles.stageStepActive
                        : isFinished
                        ? styles.stageStepCompleted
                        : ""
                    }`}
                  >
                    <span className={styles.stageStepDot}>
                      {isFinished ? (
                        <Check size={10} strokeWidth={3.5} />
                      ) : isCurrent ? (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </span>
                    <span className={styles.stageStepLabel}>{stage.label}</span>
                    {isCurrent && (
                      <span className={styles.stageStepTurnBadge}>
                        {turnInStage}/{targetTurnsInStage}
                      </span>
                    )}
                  </div>
                  {idx < THREE_STAGES.length - 1 && (
                    <div
                      className={`${styles.stageStepLine} ${
                        idx < currentStageIdx ? styles.stageStepLineFilled : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Timer, Speaker Mute, STAR, Settings Drawer Button & End */}
        <div className={styles.topBarRight}>
          <div className={styles.timerPill}>
            <Clock size={12} />
            <span>{formatTimer(sessionDurationSeconds)}</span>
          </div>

          <button
            type="button"
            className={styles.btnTopAction}
            onClick={toggleAudioMute}
            title={isAudioMuted ? "Bật âm thanh AI" : "Tắt âm thanh AI"}
          >
            {isAudioMuted ? <VolumeX size={13} color="#dc2626" /> : <Volume2 size={13} color="#d98236" />}
            <span>Loa: {isAudioMuted ? "TẮT" : "BẬT"}</span>
          </button>

          <button
            type="button"
            className={styles.btnTopAction}
            onClick={() => setIsStarOpen(true)}
            title="Xem gợi ý cấu trúc trả lời STAR"
          >
            <Sparkles size={13} color="#d98236" />
            <span>STAR</span>
          </button>

          {/* Settings Drawer Button (Ẩn vào, bấm nút thì nhảy qua) */}
          <button
            type="button"
            className={styles.btnTopAction}
            onClick={() => setIsSettingsOpen(true)}
            title="Mở cài đặt cuộc trò chuyện (Ngôn ngữ, Giọng đọc AI, STT...)"
          >
            <Settings size={13} color="#d98236" />
            <span>Cài đặt</span>
          </button>

          {!isCompleted && (
            <button
              type="button"
              className={styles.btnEndEarly}
              onClick={handleEndInterview}
              title="Kết thúc phỏng vấn sớm và xem bảng điểm"
            >
              <span>Kết thúc</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================
          MAIN 3-COLUMN FIXED STAGE (100% FIXED, NO WINDOW SCROLLBAR)
      ========================================================= */}
      <main className={styles.mainGrid}>
        {/* =========================================================
            COLUMN 1 (LEFT): LỊCH SỬ CÂU HỎI AI (MESSENGER INCOMING STYLE)
        ========================================================= */}
        <section className={styles.aiHistoryColumn} aria-label="Lịch sử câu hỏi từ AI">
          <div className={styles.columnHeader}>
            <div className={styles.columnHeaderLeft}>
              <div className={styles.columnHeaderIconAi}>
                <Bot size={15} />
              </div>
              <div>
                <h3 className={styles.columnTitle}>AI Interviewer</h3>
                <p className={styles.columnSub}>Dòng câu hỏi & tình huống đào sâu</p>
              </div>
            </div>
            <span className={styles.columnBadge}>{aiTurns.length} câu hỏi</span>
          </div>

          <div className={styles.messagesScrollArea}>
            {aiTurns.length === 0 ? (
              <div className={styles.emptyStreamHint}>
                <Bot size={28} className="text-[#d98236] opacity-70" />
                <p>AI đang chuẩn bị câu hỏi khởi động cho bạn...</p>
              </div>
            ) : (
              aiTurns.map((turn, idx) => (
                <div key={turn.id || idx} className={styles.aiBubbleWrapper}>
                  <div className={styles.bubbleMetaRow}>
                    <span>Câu #{turn.turnNumber || idx + 1}</span>
                    <span>•</span>
                    <span>{turn.timestamp}</span>
                  </div>
                  <div className={styles.aiBubble}>{turn.text}</div>
                  {turn.audioUrl && (
                    <button
                      type="button"
                      className={`${styles.audioReplayBtn} ${
                        playingAudioKey === (turn.id || `ai-${idx}`) ? styles.audioReplayBtnActive : ""
                      }`}
                      onClick={() => togglePlayAudio(turn.id || `ai-${idx}`, turn.audioUrl!)}
                    >
                      {playingAudioKey === (turn.id || `ai-${idx}`) ? (
                        <>
                          <Square size={10} fill="currentColor" />
                          <span>Dừng</span>
                        </>
                      ) : (
                        <>
                          <Play size={10} fill="currentColor" />
                          <span>Nghe lại</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}

            {/* Realtime Live Speech Bubble when AI is actively speaking */}
            {aiState === "speaking" && currentQuestion && (
              <div className={styles.aiBubbleWrapper}>
                <div className={styles.liveSpeakingIndicator}>
                  <span className={styles.statePulseDot} />
                  <span>AI đang hỏi lượt #{turnId}...</span>
                </div>
                <div className={styles.activeAiStreamingBubble}>
                  {currentQuestion}
                  <span className={styles.typewriterCursor} />
                </div>
              </div>
            )}

            <div ref={aiScrollRef} />
          </div>
        </section>

        {/* =========================================================
            COLUMN 2 (CENTER): AI INTERVIEWER CHARACTER STAGE
        ========================================================= */}
        <section className={styles.interviewerCenterColumn} aria-label="Người phỏng vấn AI">
          {/* Top Status & Intent */}
          <div className={styles.centerTopMetaRow}>
            {renderStateBadge()}
            <div className={styles.quickActionGroup}>
              {!isCompleted && aiState === "listening" && (
                <button
                  type="button"
                  className={styles.btnQuickAction}
                  onClick={rerollQuestion}
                  disabled={voiceDraft.state !== "idle"}
                  title="Yêu cầu AI đổi tình huống khác trong ngân hàng đã duyệt"
                >
                  <RotateCcw size={11} />
                  <span>Đổi câu hỏi</span>
                </button>
              )}
              {!isCompleted && !currentStage.is_last && (
                <button
                  type="button"
                  className={styles.btnQuickAction}
                  onClick={skipToNextStage}
                  disabled={!canAnswer || voiceDraft.state !== "idle"}
                  title="Chuyển sang chặng phỏng vấn tiếp theo"
                >
                  <FastForward size={11} />
                  <span>Qua chặng</span>
                </button>
              )}
            </div>
          </div>

          {/* Center: Character Portrait Video Canvas */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className={styles.interviewerMediaStage}>
              {(isAudioPlaying || aiState === "speaking") && (
                <span className={styles.speakingHaloRing} />
              )}
              <div className={styles.mediaBackdropStudio} />

              {isVoiceMode ? (
                <ChromaVideoCanvas
                  videoSrc={persona.videoUrl}
                  isPlaying={isAudioPlaying || aiState === "speaking"}
                  fallbackImageUrl={persona.avatarUrl}
                  characterName={persona.name}
                  width={220}
                  height={290}
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

            <h2 className={styles.interviewerName}>{persona.name}</h2>
            <p className={styles.interviewerTitle}>
              {persona.title} • {meta.companyName || "Doanh nghiệp mục tiêu"}
            </p>
          </div>

          {/* Bottom: Live Spoken Subtitle Box */}
          <div className={styles.centerSubtitleBox}>
            <p className={styles.centerSubtitleText}>
              &ldquo;
              {currentSubtitle ||
                currentQuestion ||
                "Lắng nghe kỹ yêu cầu trước khi trả lời..."}
              &rdquo;
              {aiState === "speaking" && <span className={styles.typewriterCursor} />}
            </p>
            {audioBlockedByAutoplay && (
              <button
                type="button"
                className={styles.audioResumeBanner}
                onClick={() => void resumeAudio()}
              >
                <Volume2 size={14} />
                <span>Bật tiếng AI để nghe câu hỏi</span>
              </button>
            )}
            {error && (
              <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            COLUMN 3 (RIGHT): CÂU TRẢ LỜI CỦA BẠN (MESSENGER OUTGOING STYLE & INPUT)
        ========================================================= */}
        <section className={styles.candidateHistoryColumn} aria-label="Câu trả lời của bạn">
          {/* Header */}
          <div className={styles.columnHeader}>
            <div className={styles.columnHeaderLeft}>
              <div className={styles.columnHeaderIconUser}>
                <User size={15} />
              </div>
              <div>
                <h3 className={styles.columnTitle}>Câu trả lời của bạn</h3>
                <p className={styles.columnSub}>Dòng phản hồi ứng viên</p>
              </div>
            </div>
            <span className={styles.columnBadgeEmerald}>{userTurns.length} lượt trả lời</span>
          </div>

          {/* Messages Stream (Messenger Outgoing Style) */}
          <div className={styles.messagesScrollArea}>
            {userTurns.length === 0 ? (
              <div className={styles.emptyStreamHint}>
                <User size={28} className="text-[#10b981] opacity-70" />
                <p>Chưa có câu trả lời nào. Hãy lắng nghe AI rồi bắt đầu trả lời.</p>
              </div>
            ) : (
              userTurns.map((turn, idx) => (
                <div key={turn.id || idx} className={styles.userBubbleWrapper}>
                  <div className={styles.userBubbleMetaRow}>
                    <span>Bạn trả lời</span>
                    {turn.durationSeconds !== undefined && turn.durationSeconds !== null && (
                      <>
                        <span>•</span>
                        <span>{turn.durationSeconds}s</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{turn.timestamp}</span>
                  </div>
                  <div className={styles.userBubble}>{turn.text}</div>
                  {turn.audioUrl && (
                    <button
                      type="button"
                      className={`${styles.userAudioReplayBtn} ${
                        playingAudioKey === (turn.id || `user-${idx}`) ? styles.audioReplayBtnActive : ""
                      }`}
                      onClick={() => togglePlayAudio(turn.id || `user-${idx}`, turn.audioUrl!)}
                    >
                      {playingAudioKey === (turn.id || `user-${idx}`) ? (
                        <>
                          <Square size={10} fill="currentColor" />
                          <span>Dừng</span>
                        </>
                      ) : (
                        <>
                          <Play size={10} fill="currentColor" />
                          <span>Nghe lại giọng bạn</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
            <div ref={userScrollRef} />
          </div>

          {/* Candidate Response Console (Anchored at Bottom of Right Column) */}
          <div className={styles.candidateBottomConsole}>
            <div className={styles.consoleHeaderRow}>
              <span className={styles.consoleTitle}>
                {isVoiceMode ? "PHẢN HỒI BẰNG GIỌNG NÓI" : "PHẢN HỒI BẰNG VĂN BẢN"}
              </span>
              <button
                type="button"
                className={styles.modeToggleLink}
                onClick={() => setCurrentMode(isVoiceMode ? "text" : "voice")}
              >
                {isVoiceMode ? "Chuyển sang văn bản ⌨️" : "Chuyển sang giọng nói 🎙️"}
              </button>
            </div>

            {/* Voice Mode Controls */}
            {isVoiceMode ? (
              <div className={styles.voiceActiveArea}>
                {voiceDraft.state === "review" ? (
                  /* Reviewing recorded voice */
                  <div className={styles.voiceReviewConsole}>
                    {voiceDraft.audioUrl && (
                      <audio controls src={voiceDraft.audioUrl} className={styles.voiceReviewAudio} />
                    )}
                    <textarea
                      value={voiceDraft.transcript}
                      onChange={(e) => voiceDraft.editTranscript(e.target.value)}
                      placeholder="Chỉnh sửa bản chép lời nếu cần..."
                      className={styles.voiceReviewTextarea}
                    />
                    <div className={styles.voiceReviewActions}>
                      <button
                        type="button"
                        className={styles.btnSecondaryVoice}
                        onClick={voiceDraft.discard}
                        title="Xóa bản nháp"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecondaryVoice}
                        onClick={() => void voiceDraft.startRecording()}
                        disabled={!canAnswer || !voiceDraft.sttSupported}
                      >
                        <RotateCcw size={13} /> Thu lại
                      </button>
                      <button
                        type="button"
                        className={styles.btnPrimaryVoice}
                        onClick={voiceDraft.submit}
                        disabled={!canAnswer || !voiceDraft.transcript.trim()}
                      >
                        <Send size={13} /> Gửi câu trả lời
                      </button>
                    </div>
                  </div>
                ) : voiceDraft.state === "recording" ? (
                  /* Actively Recording */
                  <div className="flex flex-col gap-2">
                    <AudioWaveformVisualizer
                      isRecording
                      volume={voiceDraft.volume}
                      barCount={28}
                      height={32}
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#059669] font-bold">
                      <span>Đang thu âm: {Math.floor(voiceDraft.durationSeconds / 60).toString().padStart(2, "0")}:{(voiceDraft.durationSeconds % 60).toString().padStart(2, "0")}</span>
                      {voiceDraft.silenceRemaining !== null && (
                        <span>Tự gửi sau {voiceDraft.silenceRemaining}s im lặng</span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#211914] italic bg-[#faf7f2] p-2 rounded border border-[#e7dace] max-h-12 overflow-y-auto">
                      {[voiceDraft.transcript, voiceDraft.interimTranscript].filter(Boolean).join(" ") || "Hãy nói câu trả lời của bạn..."}
                    </p>
                    <button
                      type="button"
                      className={styles.btnStopVoice}
                      onClick={() => void voiceDraft.stopRecording()}
                    >
                      <Square size={13} fill="currentColor" /> Dừng & nghe lại
                    </button>
                  </div>
                ) : (
                  /* Idle / Waiting for AI */
                  <div className="flex flex-col gap-2">
                    <p className={styles.voiceStatusText}>
                      {isAudioPlaying || aiState === "speaking"
                        ? "Lắng nghe câu hỏi từ AI trước khi trả lời..."
                        : canAnswer
                        ? "Đến lượt bạn trả lời. Nhấn nút để bắt đầu thu âm."
                        : "Đang chờ kết nối máy chủ..."}
                    </p>
                    <div className={styles.voiceActionRow}>
                      {isAudioPlaying || aiState === "speaking" ? (
                        <button
                          type="button"
                          className={styles.btnSecondaryVoice}
                          onClick={interruptAi}
                          style={{ width: "100%" }}
                        >
                          <Square size={13} /> Dừng AI để trả lời
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnPrimaryVoice}
                          onClick={() => void voiceDraft.startRecording()}
                          disabled={!canAnswer || !voiceDraft.sttSupported}
                        >
                          <Mic size={14} /> Bắt đầu trả lời
                        </button>
                      )}
                    </div>
                    <div className={styles.autoSendToggleRow}>
                      <span>Tự động gửi sau 3s ngừng nói</span>
                      <button
                        type="button"
                        className={styles.switchSmall}
                        onClick={voiceDraft.toggleAutoSubmit}
                      >
                        {voiceDraft.autoSubmit ? "🟢 Bật" : "⚪ Tắt"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Text Mode Controls */
              <div className={styles.textModeInputArea}>
                <textarea
                  className={styles.textInputArea}
                  placeholder="Nhập câu trả lời chi tiết của bạn…"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className={styles.textInputFooter}>
                  <span className={styles.textInputHint}>
                    {canSendText ? "Ctrl + Enter để gửi" : "Đợi AI nói xong"}
                  </span>
                  <button
                    type="button"
                    className={styles.btnSubmitText}
                    onClick={handleSendText}
                    disabled={!typedText.trim() || !canSendText}
                  >
                    <span>Gửi</span>
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================
          SETTINGS DRAWER (ẨN VÀO, BẤM NÚT CÀI ĐẶT THÌ NHẢY QUA)
      ========================================================= */}
      {isSettingsOpen && (
        <div className={styles.settingsDrawerBackdrop} onClick={() => setIsSettingsOpen(false)}>
          <div className={styles.settingsDrawerSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.settingsDrawerHeader}>
              <div className={styles.settingsDrawerTitleBox}>
                <div className={styles.settingsDrawerIcon}>
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className={styles.settingsDrawerTitle}>Cài Đặt Cuộc Trò Chuyện</h3>
                  <p className={styles.settingsDrawerSub}>Ngôn ngữ, Giọng đọc AI & Thiết bị</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.btnCloseDrawer}
                onClick={() => setIsSettingsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.settingsDrawerContent}>
              {/* Ngôn ngữ phỏng vấn (8 ngôn ngữ) */}
              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel}>
                  {locale === "en" ? "Interview Language" : "Ngôn ngữ phỏng vấn"}
                </label>
                <SimpleUserSelect
                  id="settings-lang-select"
                  value={language}
                  disabled={!canSendText}
                  onChange={(val) => changeInterviewLanguage(val)}
                  options={INTERVIEW_LANGUAGES.map((opt) => ({ value: opt.code, label: opt.label }))}
                  aria-label="Interview Language"
                />
                <p className={styles.settingsHelper}>
                  Hỗ trợ 8 ngôn ngữ phổ biến. AI sẽ áp dụng cho câu trả lời tiếp theo.
                </p>
              </div>

              <div className={styles.settingsDivider} />

              {/* Giọng đọc AI (TTS Tiering) */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionLabel}>
                  <span>Giọng đọc AI (TTS)</span>
                  {voiceOptions?.is_premium_user ? (
                    <span className={`${styles.voiceTierBadge} ${styles.tierBadgePro}`}>
                      <Sparkles size={10} /> Pro
                    </span>
                  ) : (
                    <span className={`${styles.voiceTierBadge} ${styles.tierBadgeFree}`}>
                      Free
                    </span>
                  )}
                </div>
                <SimpleUserSelect
                  id="settings-voice-select"
                  value={selectedVoice}
                  disabled={!canSendText}
                  onChange={handleVoiceChange}
                  options={(voiceOptions?.voices || [
                    { id: "vi-VN-HoaiMyNeural", name: "Hoài My (Nữ - Edge)", is_locked: false },
                    { id: "vi-VN-NamMinhNeural", name: "Nam Minh (Nam - Edge)", is_locked: false },
                    { id: "elevenlabs-rachel", name: "Rachel (Nữ - ElevenLabs)", is_locked: true },
                    { id: "elevenlabs-adam", name: "Adam (Nam - ElevenLabs)", is_locked: true },
                  ]).map((v) => ({
                    value: v.id,
                    label: `${v.is_locked ? "🔒 [Pro] " : ""}${v.name}`,
                  }))}
                  aria-label="AI Voice"
                />
                <p className={styles.settingsHelper}>
                  {voiceOptions?.is_premium_user
                    ? "Đã mở khóa các giọng ElevenLabs studio cao cấp."
                    : "Gói Free dùng Edge TTS chuẩn. Nâng cấp Pro để mở khóa ElevenLabs."}
                </p>
              </div>

              {/* Nhận diện giọng nói (STT Engine) */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionLabel}>
                  <span>Bộ nhận diện giọng nói (STT)</span>
                </div>
                <SimpleUserSelect
                  id="settings-stt-select"
                  value={selectedSttEngine}
                  disabled={!canSendText}
                  onChange={handleSttEngineChange}
                  options={(voiceOptions?.stt_engines || [
                    { id: "browser-speech-api", name: "Web Speech API (Trình duyệt) [Mặc định]", is_locked: false },
                    { id: "whisper-pro", name: "Whisper Pro (AI Cloud)", is_locked: true },
                  ]).map((eng) => ({
                    value: eng.id,
                    label: `${eng.is_locked ? "🔒 [Pro] " : ""}${eng.name}`,
                  }))}
                  aria-label="STT Engine"
                />
              </div>

              <div className={styles.settingsDivider} />

              {/* Chế độ & Loa */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsActionRow}>
                  <span>Loa AI phát âm câu hỏi:</span>
                  <button
                    type="button"
                    onClick={toggleAudioMute}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(106, 72, 49, 0.2)",
                      background: isAudioMuted ? "#fee2e2" : "#ffffff",
                      color: isAudioMuted ? "#dc2626" : "#211914",
                      fontWeight: 750,
                      cursor: "pointer",
                      fontSize: 11.5,
                    }}
                  >
                    {isAudioMuted ? "Đang TẮT" : "Đang BẬT"}
                  </button>
                </div>
              </div>

              <div className={styles.settingsDivider} />

              {/* Điều khiển phiên */}
              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel}>Thao tác phiên</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className={styles.btnQuickAction}
                    style={{ justifyContent: "center", padding: "8px 12px", width: "100%" }}
                    onClick={() => {
                      rerollQuestion();
                      setIsSettingsOpen(false);
                    }}
                    disabled={!canAnswer || voiceDraft.state !== "idle"}
                  >
                    <RotateCcw size={13} />
                    <span>Đổi tình huống / câu hỏi khác</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnQuickAction}
                    style={{ justifyContent: "center", padding: "8px 12px", width: "100%" }}
                    onClick={() => {
                      skipToNextStage();
                      setIsSettingsOpen(false);
                    }}
                    disabled={!canAnswer || voiceDraft.state !== "idle" || currentStage.is_last}
                  >
                    <FastForward size={13} />
                    <span>Bỏ qua sang chặng tiếp theo</span>
                  </button>
                </div>

                {!isCompleted && (
                  <button
                    type="button"
                    className={styles.btnEndInterviewFull}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleEndInterview();
                    }}
                  >
                    <span>Kết thúc phỏng vấn sớm</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAR Guidance Drawer */}
      <StarGuidanceDrawer
        isOpen={isStarOpen}
        onClose={() => setIsStarOpen(false)}
        showTrigger={false}
        starTip="Tập trung trả lời theo cấu trúc STAR: Situation → Task → Action → Result."
        onInsertStarter={(starter) => {
          setCurrentMode("text");
          setTypedText((prev) => (prev ? `${prev}\n\n${starter}` : starter));
          setIsStarOpen(false);
        }}
      />
    </div>
  );
}
