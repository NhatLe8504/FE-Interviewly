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
  RotateCcw,
  FastForward,
  Settings,
  X,
  Play,
  Square,
  Coffee,
  Briefcase,
  Handshake,
  Trash2,
} from "lucide-react";
import { useRealtimeVoiceInterview } from "@/hooks/useRealtimeVoiceInterview";
import { useVoiceAnswerDraft } from "@/hooks/useVoiceAnswerDraft";
import type { StageConfigIn } from "@/types/interview";
import { ChromaVideoCanvas } from "./components/ChromaVideoCanvas";
import { AudioWaveformVisualizer } from "./components/AudioWaveformVisualizer";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { SimpleUserSelect } from "@/components/user-component/common";
import { voiceApi, type VoiceOptionsResponse } from "@/services/voiceApi";
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

const PREFERRED_VOICE_STORAGE_KEY = "interviewly_preferred_voice";
const PREFERRED_PITCH_STORAGE_KEY = "interviewly_preferred_pitch";
const getLangPreferredVoiceKey = (lang: string) => `interviewly_preferred_voice_${lang}`;

const LANGUAGE_DEFAULT_VOICES: Record<string, string> = {
  vi: "vi-VN-HoaiMyNeural",
  en: "en-US-JennyNeural",
  zh: "zh-CN-XiaoxiaoNeural",
  ja: "ja-JP-NanamiNeural",
  ko: "ko-KR-SunHiNeural",
  fr: "fr-FR-DeniseNeural",
  de: "de-DE-KatjaNeural",
  es: "es-ES-ElviraNeural",
};

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
  const [selectedPitch, setSelectedPitch] = useState<number>(0);
  const [selectedSttEngine, setSelectedSttEngine] = useState<string>("browser-speech-api");

  // Audio replay
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll ref (mot thanh cuon chung cho ca khung chat)
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

// Voice list filtered STRICTLY by active interview language:
  // ONLY displays voices for that language (v.language === language) OR multilingual (v.language === "multi")
  const filteredVoices = useMemo(() => {
    const list = voiceOptions?.voices || [];
    return list.filter((v) => !v.language || v.language === language || v.language === "multi");
  }, [voiceOptions?.voices, language]);

  const isVoiceMode = currentMode === "voice";

// Fetch Voice & STT Options (tự động lọc theo ngôn ngữ & khôi phục giọng ưu tiên đã cache)
  useEffect(() => {
    let isSubscribed = true;
    voiceApi
      .getVoiceOptions(language)
      .then((res) => {
        if (!isSubscribed) return;
        setVoiceOptions(res);

        // Khôi phục giọng ưu tiên từ localStorage theo ngôn ngữ hoặc toàn cục
        let preferred: string | null = null;
        try {
          preferred =
            localStorage.getItem(getLangPreferredVoiceKey(language)) ||
            localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY) ||
            null;
        } catch {}

        const candidateId = meta.voice || preferred || selectedVoice;
        const matchingVoice = res.voices.find((v) => v.id === candidateId && !v.is_locked);

        if (matchingVoice) {
          setSelectedVoice(matchingVoice.id);
          changeVoice(matchingVoice.id);
        } else {
          // Fallback to default unlocked voice
          const def =
            res.voices.find((v) => v.is_default && !v.is_locked) ||
            res.voices.find((v) => !v.is_locked) ||
            res.voices[0];
          if (def) {
            setSelectedVoice(def.id);
            changeVoice(def.id);
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load voice options:", err);
      });
    return () => {
      isSubscribed = false;
    };
  }, [language, meta.voice]);

  // Load session meta from sessionStorage & restore cached voice preference
  useEffect(() => {
    const initialLanguage = new URL(window.location.href).searchParams.get("language") ?? "vi";
    try {
      const raw = sessionStorage.getItem(`session_metadata_${sessionId}`);
      let targetLang = getInterviewLanguage(initialLanguage).code;
      let targetVoice: string | null = null;
      if (raw) {
        const stored: SessionMetaStored = JSON.parse(raw);
        setMeta(stored);
        setCurrentMode(stored.mode === "text" ? "text" : "voice");
        targetLang = getInterviewLanguage(stored.language ?? (stored.languageLabel === "English" ? "en" : initialLanguage)).code;
        if (stored.voice) targetVoice = stored.voice;
      }
      setLanguage(targetLang);

      // Khôi phục giọng đã cache nếu trong session_metadata chưa có
      if (!targetVoice) {
        try {
          targetVoice =
            localStorage.getItem(getLangPreferredVoiceKey(targetLang)) ||
            localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY) ||
            null;
        } catch {}
      }
      if (targetVoice) setSelectedVoice(targetVoice);

      // Khôi phục độ cao thấp giọng đọc (Pitch) từ localStorage
      try {
        const savedPitch = localStorage.getItem(PREFERRED_PITCH_STORAGE_KEY);
        if (savedPitch !== null) {
          const p = parseInt(savedPitch, 10);
          if (!isNaN(p)) setSelectedPitch(Math.max(-10, Math.min(10, p)));
        }
      } catch {}
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
    changePitch,
    updateTurnAudioUrl,
  } = useRealtimeVoiceInterview({
    sessionId,
    enabled: isClientMounted,
    roleName,
    level,
    language,
    voice: selectedVoice,
    pitch: selectedPitch >= 0 ? `+${selectedPitch}Hz` : `${selectedPitch}Hz`,
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

    // Lưu vào cache vĩnh viễn (localStorage) để lần sau tự động sử dụng
    try {
      localStorage.setItem(PREFERRED_VOICE_STORAGE_KEY, newVoiceId);
      localStorage.setItem(getLangPreferredVoiceKey(language), newVoiceId);
    } catch {}

    const updated = { ...meta, voice: newVoiceId };
    setMeta(updated);
    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(updated));
    } catch {}
  };

  const handlePitchChange = (pitchVal: number) => {
    const clamped = Math.max(-10, Math.min(10, pitchVal));
    setSelectedPitch(clamped);
    const formatted = clamped >= 0 ? `+${clamped}Hz` : `${clamped}Hz`;
    changePitch(formatted);
    try {
      localStorage.setItem(PREFERRED_PITCH_STORAGE_KEY, String(clamped));
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

    // Khôi phục giọng ưu tiên cho ngôn ngữ mới nếu đã từng chọn
    let cachedNewVoice = "";
    try {
      cachedNewVoice = localStorage.getItem(getLangPreferredVoiceKey(selected.code)) || "";
    } catch {}

    const curVoiceObj = voiceOptions?.voices.find((v) => v.id === selectedVoice);
    const isCurVoiceMultilingual = curVoiceObj?.language === "multi";
    const isCurVoiceSameLang = curVoiceObj?.language === selected.code;

    if (cachedNewVoice) {
      setSelectedVoice(cachedNewVoice);
      changeVoice(cachedNewVoice);
    } else if (!isCurVoiceMultilingual && !isCurVoiceSameLang) {
      const newLangDefaultVoice = LANGUAGE_DEFAULT_VOICES[selected.code] || "vi-VN-HoaiMyNeural";
      setSelectedVoice(newLangDefaultVoice);
      changeVoice(newLangDefaultVoice);
    }

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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

// Audio Replay Player Toggle (chuẩn hóa URL blob, relative và origin để phát lại mượt mà)
  const togglePlayAudio = (key: string, rawUrl: string) => {
    if (!rawUrl) return;
    if (playingAudioKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingAudioKey(null);
      return;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    const resolvedUrl =
      rawUrl.startsWith("blob:") ||
      rawUrl.startsWith("data:") ||
      rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://")
        ? rawUrl
        : `${window.location.origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

    try {
      const audio = new Audio(resolvedUrl);
      audioPlayerRef.current = audio;
      setPlayingAudioKey(key);
      audio.onended = () => {
        setPlayingAudioKey(null);
        audioPlayerRef.current = null;
      };
      audio.onerror = (e) => {
        console.warn("Audio playback error on url:", resolvedUrl, e);
        setPlayingAudioKey(null);
        audioPlayerRef.current = null;
      };
      audio.play().catch((err) => {
        console.warn("audio.play() failed:", err);
        setPlayingAudioKey(null);
        audioPlayerRef.current = null;
      });
    } catch (err) {
      console.warn("Failed to initialize Audio element:", err);
      setPlayingAudioKey(null);
    }
  };

  // Auto scroll khung chat chung xuong tin nhan moi nhat
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns.length, aiState, currentQuestion]);

  // Determine current stage index (0 = warmup, 1 = technical, 2 = closing)
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
            <span>Đang lắng nghe</span>
          </span>
        );
      case "thinking":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateThinking}`}>
            <span className={styles.statePulseDot} />
            <BrainCircuit size={11} />
            <span>AI phân tích...</span>
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.aiStatePill} ${styles.stateIdle}`}>
            <Check size={11} />
            <span>Hoàn tất</span>
          </span>
        );
      default:
        return (
          <span className={`${styles.aiStatePill} ${styles.stateIdle}`}>
            Sẵn sàng
          </span>
        );
    }
  };

  return (
    <div className={styles.roomShell}>
      {/* Container cách ra 2 bên, không đụng website Header */}
      <div className={styles.stageContainer}>
        {/* CHUNG 1 KHUNG HÌNH THEO HÌNH PHÁC THẢO */}
        <div className={styles.unifiedStageCard}>
          <span className={styles.stageGlow} />

          {/* =========================================================
              TOP ROW: 3 CHẶNG TRÒN NỐI NHAU Ở CHÍNH GIỮA (O)-(O)-(O)
                       VÀ NÚT CÀI ĐẶT TRÒN GÓC PHẢI (O)
          ========================================================= */}
          <div className={styles.stageTopRow}>
            {/* Top Left: Timer & Connection */}
            <div className={styles.topLeftMeta}>
              <span
                className={`${styles.wsDot} ${
                  isReconnecting ? styles.wsWarn : isConnected ? styles.wsLive : styles.wsWarn
                }`}
              />
              <span className={styles.timerPill}>
                <Clock size={11} /> {formatTimer(sessionDurationSeconds)}
              </span>
              <span>• {persona.name}</span>
            </div>

            {/* TOP CENTER: 3 CHẶNG TRÒN (O)-(O)-(O) */}
            <div className={styles.stageCenterStepper}>
              {THREE_STAGES.map((stage, idx) => {
                const isFinished = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      className={`${styles.stepCircleItem} ${
                        isCurrent
                          ? styles.stepActive
                          : isFinished
                          ? styles.stepCompleted
                          : ""
                      }`}
                    >
                      <span className={styles.stepCircle}>
                        {isFinished ? (
                          <Check size={10} strokeWidth={3.5} />
                        ) : isCurrent ? (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </span>
                      <span>{stage.label}</span>
                      {isCurrent && (
                        <span className={styles.stepTurnBadge}>
                          {turnInStage}/{targetTurnsInStage}
                        </span>
                      )}
                    </div>
                    {idx < THREE_STAGES.length - 1 && (
                      <div
                        className={`${styles.stepConnector} ${
                          idx < currentStageIdx ? styles.stepConnectorFilled : ""
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

{/* TOP RIGHT: NÚT KẾT THÚC & NÚT CÀI ĐẶT TRÒN GÓC PHẢI */}
            <div className={styles.topRightActions}>
              {!isCompleted && (
                <button
                  type="button"
                  className={styles.roundEndSessionBtn}
                  onClick={handleEndInterview}
                  title="Kết thúc phỏng vấn sớm"
                >
                  <Square size={13} fill="currentColor" />
                  <span>Kết thúc</span>
                </button>
              )}
              <button
                type="button"
                className={styles.roundSettingBtn}
                onClick={() => setIsSettingsOpen(true)}
                title="Cài đặt cuộc trò chuyện"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* =========================================================
              MIDDLE STAGE: MOT KHUNG CHAT DUY NHAT (ZIGZAG) + VIDEO AI CO DINH O GIUA
          ========================================================= */}
          <div className={styles.middleStageBody}>
            {/* MOT THANH CUON CHUNG CHO TOAN BO HOI THOAI */}
            <div className={styles.chatScrollArea} ref={chatScrollRef}>
              {turns.length === 0 && aiState !== "speaking" && (
                <div className={styles.chatEmptyHint}>AI đang chuẩn bị câu hỏi mở đầu...</div>
              )}

              {turns.map((turn, idx) =>
                turn.speaker === "ai" ? (
                  <div key={turn.id || `ai-${idx}`} className={styles.turnRowAi}>
                    <div className={styles.aiBubble}>
                      <div className={styles.bubbleMeta}>
                        <span>AI (Câu #{turn.turnNumber || idx + 1})</span>
                        <span>•</span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <div>{turn.text}</div>
                      {turn.audioUrl && (
                        <button
                          type="button"
                          className={styles.audioReplayBtn}
                          onClick={() => togglePlayAudio(turn.id || `ai-${idx}`, turn.audioUrl!)}
                        >
                          {playingAudioKey === (turn.id || `ai-${idx}`) ? (
                            <>
                              <Square size={9} fill="currentColor" />
                              <span>Dừng</span>
                            </>
                          ) : (
                            <>
                              <Play size={9} fill="currentColor" />
                              <span>Nghe lại</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={turn.id || `user-${idx}`} className={styles.turnRowUser}>
                    <div className={styles.userBubble}>
                      <div className={styles.userBubbleMeta}>
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
                      <div>{turn.text}</div>
                      {turn.audioUrl && (
                        <button
                          type="button"
                          className={styles.userAudioReplayBtn}
                          onClick={() => togglePlayAudio(turn.id || `user-${idx}`, turn.audioUrl!)}
                        >
                          {playingAudioKey === (turn.id || `user-${idx}`) ? (
                            <>
                              <Square size={9} fill="currentColor" />
                              <span>Dừng</span>
                            </>
                          ) : (
                            <>
                              <Play size={9} fill="currentColor" />
                              <span>Nghe lại</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}

{/* Bong bong xem truoc giong noi truc tiep tren khung chat (Ziczac ben phai) */}
              {isVoiceMode && (voiceDraft.state === "recording" || voiceDraft.state === "review") && (
                <div className={styles.turnRowUser}>
                  <div className={styles.userLivePreviewBubble}>
                    <div className={styles.userBubbleMeta}>
                      <span
                        className={styles.statePulseDot}
                        style={{
                          background: voiceDraft.state === "recording" ? "#10b981" : "#059669",
                        }}
                      />
                      <span>
                        {voiceDraft.state === "recording" ? "Bạn đang nói..." : "Bản thu đã sẵn sàng"}
                      </span>
                      <span>•</span>
                      <span>
                        {Math.floor(voiceDraft.durationSeconds / 60)}:
                        {(voiceDraft.durationSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    </div>

                    {voiceDraft.state === "recording" ? (
                      <div className={styles.previewWaveRow}>
                        <AudioWaveformVisualizer
                          isRecording
                          volume={voiceDraft.volume}
                          barCount={18}
                          height={22}
                        />
                        <span className={styles.previewTranscriptText}>
                          {[voiceDraft.transcript, voiceDraft.interimTranscript].filter(Boolean).join(" ") ||
                            "Đang lắng nghe giọng nói..."}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          className={styles.previewEditingInput}
                          value={voiceDraft.transcript}
                          onChange={(e) => voiceDraft.editTranscript(e.target.value)}
                          placeholder="Chỉnh sửa nội dung bản thu trước khi gửi..."
                          rows={2}
                        />
                      </div>
                    )}

                    <div className={styles.previewActionsRow}>
                      {voiceDraft.state === "recording" ? (
                        <button
                          type="button"
                          className={styles.btnPreviewConfirm}
                          onClick={() => void voiceDraft.stopRecording()}
                        >
                          <Square size={11} fill="currentColor" />
                          <span>Dừng nói</span>
                        </button>
                      ) : (
                        <>
{voiceDraft.audioUrl && (
                            <button
                              type="button"
                              className={styles.btnPreviewSecondary}
                              onClick={() => togglePlayAudio("preview-draft", voiceDraft.audioUrl!)}
                              title="Nghe lại giọng nói vừa thu"
                            >
                              {playingAudioKey === "preview-draft" ? (
                                <>
                                  <Square size={11} fill="currentColor" />
                                  <span>Dừng</span>
                                </>
                              ) : (
                                <>
                                  <Play size={11} fill="currentColor" />
                                  <span>Nghe lại</span>
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${styles.btnPreviewSecondary} ${styles.btnPreviewDanger}`}
                            onClick={voiceDraft.discard}
                            title="Hủy bỏ bản thu"
                          >
                            <Trash2 size={12} />
                            <span>Hủy</span>
                          </button>
                          <button
                            type="button"
                            className={styles.btnPreviewSecondary}
                            onClick={() => void voiceDraft.startRecording()}
                            title="Thu âm lại"
                          >
                            <RotateCcw size={12} />
                            <span>Nói lại</span>
                          </button>
                          <button
                            type="button"
                            className={styles.btnPreviewConfirm}
                            onClick={voiceDraft.submit}
                            disabled={!canAnswer || !voiceDraft.transcript.trim()}
                            title="Xác nhận gửi câu trả lời cho AI"
                          >
                            <Send size={12} />
                            <span>Xác nhận gửi</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bong bong dang go chu khi AI noi */}
              {aiState === "speaking" && currentQuestion && (
                <div className={styles.turnRowAi}>
                  <div className={styles.aiStreamingBubble}>
                    <div className={styles.bubbleMeta}>
                      <span className={styles.statePulseDot} />
                      <span>AI đang nói...</span>
                    </div>
                    <div>
                      {currentQuestion}
                      <span className={styles.typewriterCursor} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO AI O CHINH GIUA - CO DINH, KHONG CUON THEO KHUNG CHAT */}
            <div className={styles.centerAiBox}>
              <div className={styles.interviewerMediaStage}>
                {(isAudioPlaying || aiState === "speaking") && (
                  <span className={styles.speakingHaloRing} />
                )}
                <div className={styles.mediaBackdropStudio} />

                <ChromaVideoCanvas
                  videoSrc={persona.videoUrl}
                  isPlaying={isAudioPlaying || aiState === "speaking"}
                  fallbackImageUrl={persona.avatarUrl}
                  characterName={persona.name}
                  width={220}
                  height={290}
                />
              </div>

              {renderStateBadge()}
              <div className={styles.aiNameText}>{persona.name}</div>
            </div>
          </div>
          {/* =========================================================
              BOTTOM ROW: THANH ĐIỀU KHIỂN BO TRÒN THEO PHÁC THẢO [  INPUT  ] [O] [O] [O]
          ========================================================= */}
          <div className={styles.bottomControlCapsule}>
{/* Input Zone on Left */}
            <div className={styles.capsuleInputZone}>
              {isVoiceMode ? (
                voiceDraft.state === "recording" ? (
                  <p className={styles.capsuleStatusText}>
                    <span style={{ color: "#059669", fontWeight: 750 }}>● Đang thu âm...</span> Lời nói hiển thị trực tiếp trên khung chat. Nói xong bấm Dừng nói.
                  </p>
                ) : voiceDraft.state === "review" ? (
                  <p className={styles.capsuleStatusText}>
                    <span style={{ color: "#d98236", fontWeight: 750 }}>✓ Đã có bản thu:</span> Xem lại trên khung chat và bấm &quot;Xác nhận gửi&quot;.
                  </p>
                ) : (
                  <p className={styles.capsuleStatusText}>
                    {isAudioPlaying || aiState === "speaking"
                      ? "Lắng nghe câu hỏi từ AI trước khi trả lời..."
                      : canAnswer
                      ? "Đến lượt bạn trả lời. Nhấn nút micro tròn bên phải để bắt đầu."
                      : "Đang chờ kết nối máy chủ..."}
                  </p>
                )
              ) : (
                <input
                  type="text"
                  className={styles.capsuleTextInput}
                  placeholder="Nhập câu trả lời chi tiết của bạn và nhấn Enter để gửi..."
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              )}
            </div>

            {/* 3 NÚT TRÒN BÊN PHẢI [O] [O] [O] THEO PHÁC THẢO */}
            <div className={styles.capsuleActionsRow}>
              {/* Nút 1: Micro / Bắt đầu thu hoặc Dừng */}
              {isVoiceMode ? (
                voiceDraft.state === "recording" ? (
                  <button
                    type="button"
                    className={`${styles.roundActionBtn} ${styles.btnRecordingStop}`}
                    onClick={() => void voiceDraft.stopRecording()}
                    title="Dừng thu âm"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                ) : voiceDraft.state === "review" ? (
                  <button
                    type="button"
                    className={styles.roundActionBtn}
                    onClick={() => void voiceDraft.startRecording()}
                    title="Thu lại"
                  >
                    <RotateCcw size={16} />
                  </button>
                ) : isAudioPlaying || aiState === "speaking" ? (
                  <button
                    type="button"
                    className={styles.roundActionBtn}
                    onClick={interruptAi}
                    title="Dừng AI để trả lời"
                  >
                    <Square size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.roundActionBtn} ${styles.btnPrimaryMic}`}
                    onClick={() => void voiceDraft.startRecording()}
                    disabled={!canAnswer || !voiceDraft.sttSupported}
                    title="Bắt đầu thu âm"
                  >
                    <Mic size={18} />
                  </button>
                )
              ) : null}

              {/* Nút 2: Gửi câu trả lời */}
              {isVoiceMode ? (
                voiceDraft.state === "review" ? (
                  <button
                    type="button"
                    className={`${styles.roundActionBtn} ${styles.btnSubmitSend}`}
                    onClick={voiceDraft.submit}
                    disabled={!canAnswer || !voiceDraft.transcript.trim()}
                    title="Gửi câu trả lời"
                  >
                    <Send size={16} />
                  </button>
                ) : null
              ) : (
                <button
                  type="button"
                  className={`${styles.roundActionBtn} ${styles.btnSubmitSend}`}
                  onClick={handleSendText}
                  disabled={!typedText.trim() || !canSendText}
                  title="Gửi câu trả lời (Enter)"
                >
                  <Send size={16} />
                </button>
              )}

              {/* Nút 3: Đổi chế độ Giọng nói / Văn bản */}
              <button
                type="button"
                className={styles.roundActionBtn}
                onClick={() => setCurrentMode(isVoiceMode ? "text" : "voice")}
                title={isVoiceMode ? "Chuyển sang nhập văn bản" : "Chuyển sang nói micro"}
              >
                {isVoiceMode ? <Keyboard size={16} /> : <Mic size={16} />}
              </button>

              {/* Nút phụ: Bật/Tắt Loa AI */}
              <button
                type="button"
                className={styles.roundActionBtn}
                onClick={toggleAudioMute}
                title={isAudioMuted ? "Bật âm thanh AI" : "Tắt âm thanh AI"}
              >
                {isAudioMuted ? <VolumeX size={16} color="#dc2626" /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

{/* =========================================================
          SETTINGS POPUP / MODAL (POPUP Ở GIỮA MÀN HÌNH THEO YÊU CẦU)
      ========================================================= */}
      {isSettingsOpen && (
        <div className={styles.settingsModalBackdrop} onClick={() => setIsSettingsOpen(false)}>
          <div className={styles.settingsModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.settingsModalHeader}>
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

            <div className={styles.settingsModalContent}>
              {/* Ngôn ngữ phỏng vấn */}
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
                  Hỗ trợ 8 ngôn ngữ phổ biến trên thế giới. AI sẽ áp dụng cho câu tiếp theo.
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
                  options={filteredVoices.map((v) => ({
                    value: v.id,
                    label: `${v.is_locked ? "🔒 [Pro] " : ""}${v.name}`,
                  }))}
                  aria-label="AI Voice"
                />
                <p className={styles.settingsHelper}>
                  {language === "vi"
                    ? "Tự động ưu tiên giọng tiếng Việt và giọng đa ngôn ngữ (xử lý tự nhiên khi câu hỏi chứa thuật ngữ tiếng Anh)."
                    : "Giọng đọc tương thích với ngôn ngữ phỏng vấn đã chọn."}
                </p>
              </div>

              {/* Độ cao / thấp giọng đọc (Pitch Control) */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionLabel}>
                  <span>Độ cao / thấp giọng đọc (Pitch)</span>
                  <span className={styles.pitchValueBadge}>
                    {selectedPitch === 0
                      ? "Chuẩn (0Hz)"
                      : selectedPitch > 0
                      ? `+${selectedPitch}Hz (Thanh cao)`
                      : `${selectedPitch}Hz (Trầm ấm)`}
                  </span>
                </div>
                <div className={styles.pitchSliderWrapper}>
                  <span className={styles.pitchBoundaryLabel}>Trầm (-10Hz)</span>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    step={1}
                    value={selectedPitch}
                    disabled={!canSendText}
                    onChange={(e) => handlePitchChange(Number(e.target.value))}
                    className={styles.pitchSlider}
                    aria-label="Độ cao thấp giọng đọc"
                  />
                  <span className={styles.pitchBoundaryLabel}>Cao (+10Hz)</span>
                </div>
                <div className={styles.pitchQuickRow}>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${selectedPitch === -5 ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handlePitchChange(-5)}
                    disabled={!canSendText}
                  >
                    Trầm ấm (-5Hz)
                  </button>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${selectedPitch === 0 ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handlePitchChange(0)}
                    disabled={!canSendText}
                  >
                    Chuẩn (0Hz)
                  </button>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${selectedPitch === 5 ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handlePitchChange(5)}
                    disabled={!canSendText}
                  >
                    Thanh cao (+5Hz)
                  </button>
                </div>
                <p className={styles.settingsHelper}>
                  Điều chỉnh cao độ âm sắc để giọng nói AI trở nên trầm ấm hoặc thanh mảnh theo sở thích của bạn.
                </p>
              </div>

              {/* Bộ nhận diện giọng nói (STT) */}
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

              {/* Điều khiển phiên */}
              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel}>Thao tác phiên</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(106,72,49,0.2)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700 }}
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
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(106,72,49,0.2)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700 }}
                    onClick={() => {
                      skipToNextStage();
                      setIsSettingsOpen(false);
                    }}
                    disabled={!canAnswer || voiceDraft.state !== "idle" || currentStage.is_last}
                  >
                    <FastForward size={13} />
                    <span>Bỏ qua sang chặng tiếp theo</span>
                  </button>
                  <button
                    type="button"
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(217,130,54,0.3)", background: "#fff7ed", color: "#8b4513", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700 }}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsStarOpen(true);
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Mở gợi ý cấu trúc STAR</span>
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
