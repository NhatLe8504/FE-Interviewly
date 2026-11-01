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
  CheckCircle2,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useRealtimeVoiceInterview } from "@/hooks/useRealtimeVoiceInterview";
import { useVoiceAnswerDraft } from "@/hooks/useVoiceAnswerDraft";
import type { StageConfigIn } from "@/types/interview";
import { ChromaVideoCanvas } from "./components/ChromaVideoCanvas";
import { AudioWaveformVisualizer } from "./components/AudioWaveformVisualizer";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { SimpleUserSelect } from "@/components/user-component/common";
import { voiceApi, type VoiceOptionsResponse } from "@/services/voiceApi";
import { getStoredToken } from "@/services/apiClient";
import { toast } from "@/components/user-component/toast/UserToast";
import { useI18n } from "@/context/I18nContext";
import { INTERVIEW_LANGUAGES, getInterviewLanguage, type InterviewLanguage } from "@/lib/interviewLanguages";
import { clampInterviewPlaybackSpeed, DEFAULT_INTERVIEW_PLAYBACK_SPEED, INTERVIEW_PLAYBACK_SPEED_STORAGE_KEY } from "@/lib/interviewAudio";
import styles from "./interviewRoom.module.css";

const STAGE_LABELS: Record<string, string> = {
  warmup: "Chặng 1 (Khởi động)",
  technical: "Chặng 2 (Chuyên môn)",
  closing: "Chặng 3 (Chào kết & Q&A)",
  completed: "Tổng kết buổi phỏng vấn",
};

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
  preloadedVoiceOptions?: VoiceOptionsResponse | null;
  totalDurationMinutes?: number;
  mockMode?: "strict" | "guided";
  selected_question_ids?: string[];
  origin_job_id?: string | null;
  company_logo_url?: string | null;
}

const PREFERRED_VOICE_STORAGE_KEY = "interviewly_preferred_voice";
const PREFERRED_PITCH_STORAGE_KEY = "interviewly_preferred_pitch";
const getLangPreferredVoiceKey = (lang: string) => `interviewly_preferred_voice_${lang}`;
const getLangPreferredTtsEngineKey = (lang: string) => `interviewly_preferred_tts_engine_${lang}`;
const getLangPreferredBrowserVoiceKey = (lang: string) => `interviewly_preferred_browser_voice_${lang}`;

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
  const [voiceConfigReady, setVoiceConfigReady] = useState(false);
  const [hasPlayedOpeningAudio, setHasPlayedOpeningAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("vi-VN-HoaiMyNeural");
  const [selectedPitch, setSelectedPitch] = useState<number>(0);
  const [selectedPlaybackSpeed, setSelectedPlaybackSpeed] = useState(DEFAULT_INTERVIEW_PLAYBACK_SPEED);
  const [selectedSttEngine, setSelectedSttEngine] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("preferred_stt_engine");
        if (saved) return saved;
      } catch {}
    }
    return "whisper_pro";
  });

  // Audio replay
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const activeAiReplayRef = useRef(false);
  const activeBlobUrlRef = useRef<string | null>(null);

  // Auto-scroll ref (mot thanh cuon chung cho ca khung chat)
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

// Voice list filtered STRICTLY by active interview language:
  // ONLY displays voices for that language (v.language === language) OR multilingual (v.language === "multi")
  const filteredVoices = useMemo(() => {
    const list = voiceOptions?.voices || [];
    return list.filter((v) => !v.language || v.language === language || v.language === "multi");
  }, [voiceOptions?.voices, language]);

  const isVoiceMode = currentMode === "voice";



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
      try {
        const fallbackOriginJobId = sessionStorage.getItem("target_origin_job_id");
        if (fallbackOriginJobId) {
          setMeta((prev) => ({ ...prev, origin_job_id: prev.origin_job_id || fallbackOriginJobId }));
        }
      } catch {}
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
      try {
        const savedSpeed = localStorage.getItem(INTERVIEW_PLAYBACK_SPEED_STORAGE_KEY);
        if (savedSpeed !== null) setSelectedPlaybackSpeed(clampInterviewPlaybackSpeed(Number(savedSpeed)));
      } catch {}
    } catch {
      setLanguage(getInterviewLanguage(initialLanguage).code);
    }
    setIsClientMounted(true);
  }, [sessionId]);

  // Browser Speech Synthesis voices cache
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const all = window.speechSynthesis.getVoices();
      if (!all || all.length === 0) return;
      const langPrefix = (language || "vi").toLowerCase();
      const filtered = all.filter((v) => {
        const l = (v.lang || "").toLowerCase().replace(/_/g, "-");
        const n = (v.name || "").toLowerCase();
        if (langPrefix === "vi") {
          return (
            l.startsWith("vi") ||
            n.includes("vietnam") ||
            n.includes("tiếng việt") ||
            n.includes("vietnamese")
          );
        }
        return l.startsWith(langPrefix);
      });
      setBrowserVoices(filtered.length > 0 ? filtered : all.slice(0, 20));
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);

  const roleName = meta.roleLabel || "Software Engineer";
  const level = meta.levelLabel || "Senior";
  const selectedStages = useMemo(() => meta.selected_stages || ["warmup", "technical", "closing"], [meta.selected_stages]);

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

  // Realtime Voice Interview Hook
  const {
    isConnected,
    isReconnecting,
    aiState,
    isCompleted,
    isStoppingSession,
    error: connectionError,
    sessionDurationSeconds,
    currentStage,
    stagesList,
    turnId,
    turnInStage,
    targetTurnsInStage,
    currentQuestion,
    showTextDuringTtsFallback,
    ttsFallbackConsent,
    isConfirmingTtsFallback,
    chooseTtsFallback,
    spokenText,
    currentIntent,
    currentSubtitle,
    turns,
    isAudioPlaying,
    bargeInEnabled,
    isAudioMuted,
    audioBlockedByAutoplay,
    toggleAudioMute,
    toggleBargeIn,
    resumeAudio,
    sendTextMessage,
    interruptAi,
    skipToNextStage,
    endSessionEarly,
    rerollQuestion,
    changeVoice,
    changePitch,
    updateTurnAudioUrl,
    // Adaptive 3-Stage Transition & Hint State
    pendingTransition,
    interviewProgress,
    isConfirmingTransition,
    confirmStageTransition,
    deferStageTransition,
    currentHint,
    isRequestingHint,
    requestHint,
    clearHint,
    mockMode,
    changeMockMode,
    stageElapsedSeconds,
    stageMaxSeconds,
    // TTS Engine & Browser Voice
    ttsEngine,
    setTtsEngine,
    selectedBrowserVoice,
    setSelectedBrowserVoice,
  } = useRealtimeVoiceInterview({
    sessionId,
    enabled: isClientMounted && voiceConfigReady,
    roleName,
    level,
    language,
    responseMode: "voice",
    voice: selectedVoice,
    pitch: selectedPitch >= 0 ? `+${selectedPitch}Hz` : `${selectedPitch}Hz`,
    playbackSpeed: selectedPlaybackSpeed,
    selectedStages,
    stageConfigs: meta.stage_configs,
    selectedQuestionIds: meta.selected_question_ids,
    personaName: persona.name,
    companyName: meta.companyName,
    mockMode: meta.mockMode || "guided",
    totalDurationMinutes: meta.totalDurationMinutes || 45,
    bargeInInitial: meta.bargeInEnabled ?? false,
  });

  // Fetch Voice & STT Options (tự động lọc theo ngôn ngữ & khôi phục giọng ưu tiên đã cache)
  useEffect(() => {
    if (!isClientMounted) return;
    let isSubscribed = true;
    voiceApi.getVoiceOptions(language, AbortSignal.timeout(5000))
      .catch((error) => {
        if (meta.preloadedVoiceOptions) return meta.preloadedVoiceOptions;
        throw error;
      })
      .then((res) => {
        if (!isSubscribed) return;
        setVoiceOptions(res);

        // 1. Khôi phục TTS engine ưu tiên của ngôn ngữ này
        let preferredEngine: "edge" | "elevenlabs" | "vieneu" | "browser" = "browser";
        try {
          const savedEngine = localStorage.getItem(getLangPreferredTtsEngineKey(language));
          if (savedEngine === "browser" || savedEngine === "elevenlabs" || savedEngine === "edge" || savedEngine === "vieneu") {
            preferredEngine = savedEngine;
          }
        } catch {}
        if (preferredEngine === "vieneu" && !res.voices.some((v) => v.provider === "vieneu")) {
          preferredEngine = "edge";
        }
        setTtsEngine(preferredEngine);

        // 2. Khôi phục Browser voice ưu tiên nếu có
        try {
          const savedBrowserVoice = localStorage.getItem(getLangPreferredBrowserVoiceKey(language));
          if (savedBrowserVoice) {
            setSelectedBrowserVoice(savedBrowserVoice);
          }
        } catch {}

        // 3. Khôi phục giọng ưu tiên từ localStorage theo ngôn ngữ hoặc toàn cục
        let preferred: string | null = null;
        try {
          preferred =
            localStorage.getItem(getLangPreferredVoiceKey(language)) ||
            localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY) ||
            null;
        } catch {}

        const candidateId = meta.voice || preferred;
        const matchingVoice = res.voices.find((v) =>
          v.id === candidateId && !v.is_locked &&
          (preferredEngine === "browser" || v.provider === preferredEngine)
        );

        if (matchingVoice) {
          setSelectedVoice(matchingVoice.id);
          changeVoice(matchingVoice.id);
        } else {
          // Fallback to default unlocked voice matching provider or default
          const candidateProvider = preferredEngine === "vieneu" ||
            (preferredEngine === "elevenlabs" && res.is_premium_user) ? preferredEngine : "edge";
          const def =
            res.voices.find((v) => v.provider === candidateProvider && v.is_default && !v.is_locked) ||
            res.voices.find((v) => v.provider === candidateProvider && !v.is_locked) ||
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
      })
      .finally(() => {
        if (isSubscribed) setVoiceConfigReady(true);
      });
    return () => {
      isSubscribed = false;
    };
  }, [isClientMounted, language, meta.voice, meta.preloadedVoiceOptions, changeVoice, setTtsEngine, setSelectedBrowserVoice]);

  useEffect(() => {
    if (isAudioPlaying) setHasPlayedOpeningAudio(true);
  }, [isAudioPlaying]);

  const canAnswer = isConnected && aiState === "listening" && !isAudioPlaying && !isCompleted;
  const canInterrupt = bargeInEnabled && isConnected && !isCompleted &&
    (isAudioPlaying || aiState === "speaking");

  // Candidate Voice Answer Submission with Audio Cache upload
  const handleVoiceSubmit = useCallback(
    (text: string, durationSeconds: number, audioBlob?: Blob | null) => {
      const localAudioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;
      const curTurn = turnId;

      const sent = sendTextMessage(text, durationSeconds, localAudioUrl);
      if (!sent) {
        if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
        return false;
      }

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
    enabled: isClientMounted && isConnected && isVoiceMode && !isCompleted,
    canRecord: canAnswer,
    autoListen: bargeInEnabled,
    canInterrupt,
    aiSpeechText: `${currentQuestion} ${currentSubtitle} ${spokenText}`,
    onSpeechStart: interruptAi,
    language,
    onSubmit: handleVoiceSubmit,
  });
  const voiceDraftHasSpeech = Boolean(voiceDraft.transcript.trim() || voiceDraft.interimTranscript.trim());
  const isVoiceDraftBusy = ["processing", "review"].includes(voiceDraft.state) ||
    (voiceDraft.state === "recording" && voiceDraftHasSpeech);

  const canSendText = canAnswer && !["requesting", "recording", "processing"].includes(voiceDraft.state);

  // Settings Handlers
  const handleVoiceChange = (newVoiceId: string) => {
    const target = voiceOptions?.voices.find((v) => v.id === newVoiceId);
    if (target?.is_locked) {
      toast({
        title: "Tính năng dành riêng cho gói Pro",
        description: target.lock_reason || "Giọng đọc ElevenLabs Studio Pro yêu cầu gói Pro.",
        variant: "warning",
      });
      return;
    }

    setSelectedVoice(newVoiceId);
    changeVoice(newVoiceId);

    // Lưu vào cache vĩnh viễn theo ngôn ngữ
    try {
      localStorage.setItem(PREFERRED_VOICE_STORAGE_KEY, newVoiceId);
      localStorage.setItem(getLangPreferredVoiceKey(language), newVoiceId);
      if (target?.provider === "elevenlabs" || target?.provider === "edge" || target?.provider === "vieneu") {
        localStorage.setItem(getLangPreferredTtsEngineKey(language), target.provider);
      }
    } catch {}

    const updated = { ...meta, voice: newVoiceId };
    setMeta(updated);
    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(updated));
    } catch {}
  };

  const handleTtsEngineChange = (engine: "edge" | "elevenlabs" | "vieneu" | "browser") => {
    if (engine === "elevenlabs" && !voiceOptions?.is_premium_user) {
      toast({
        title: "Tính năng dành riêng cho gói Pro",
        description: "Giọng đọc ElevenLabs AI chuẩn studio yêu cầu tài khoản Pro để mở khóa.",
        variant: "warning",
      });
    }
    if (engine === "vieneu" && !voiceOptions?.voices.some((v) => v.provider === "vieneu")) {
      toast.error("VieNeu chưa được cấu hình trên máy chủ.");
      return;
    }

    setTtsEngine(engine);
    try {
      localStorage.setItem(getLangPreferredTtsEngineKey(language), engine);
    } catch {}

    if (engine === "browser") {
      const cachedBVoice = localStorage.getItem(getLangPreferredBrowserVoiceKey(language));
      if (cachedBVoice) {
        setSelectedBrowserVoice(cachedBVoice);
      } else if (browserVoices.length > 0) {
        setSelectedBrowserVoice(browserVoices[0].name);
      }
    } else if (engine === "elevenlabs") {
      const elevenVoice = voiceOptions?.voices.find((v) => v.provider === "elevenlabs");
      if (elevenVoice && (!selectedVoice.startsWith("elevenlabs") || !voiceOptions?.is_premium_user)) {
        if (!elevenVoice.is_locked) {
          handleVoiceChange(elevenVoice.id);
        }
      }
    } else if (engine === "vieneu") {
      const vieneuVoice = voiceOptions?.voices.find((v) => v.provider === "vieneu" && !v.is_locked);
      if (vieneuVoice && !selectedVoice.startsWith("vieneu:")) {
        handleVoiceChange(vieneuVoice.id);
      }
    } else if (engine === "edge") {
      const edgeVoice = voiceOptions?.voices.find(
        (v) => v.provider === "edge" && (v.language === language || v.language === "multi")
      );
      if (edgeVoice && (selectedVoice.startsWith("elevenlabs") || selectedVoice.startsWith("vieneu:"))) {
        handleVoiceChange(edgeVoice.id);
      }
    }
  };

  const handleBrowserVoiceChange = (voiceName: string) => {
    setSelectedBrowserVoice(voiceName);
    try {
      localStorage.setItem(getLangPreferredBrowserVoiceKey(language), voiceName);
      localStorage.setItem(getLangPreferredTtsEngineKey(language), "browser");
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

  const handlePlaybackSpeedChange = (speed: number) => {
    const nextSpeed = clampInterviewPlaybackSpeed(speed);
    setSelectedPlaybackSpeed(nextSpeed);
    try {
      localStorage.setItem(INTERVIEW_PLAYBACK_SPEED_STORAGE_KEY, String(nextSpeed));
    } catch {}
  };

  const handlePreviewVoice = () => {
    const formattedPitch = selectedPitch >= 0 ? `+${selectedPitch}Hz` : `${selectedPitch}Hz`;
    const previewUrl = voiceApi.getVoicePreviewUrl(selectedVoice, formattedPitch);
    togglePlayAudio("voice-pitch-preview", previewUrl, true);
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
    try {
      localStorage.setItem("preferred_stt_engine", newEngineId);
    } catch {}
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

  useEffect(() => {
    if (isCompleted) {
      router.push(`/practice/${sessionId}/result`);
    }
  }, [isCompleted, sessionId, router]);

  const handleEndInterview = () => {
    if (isStoppingSession || isCompleted) return;
    if (window.confirm("Bạn có chắc chắn muốn kết thúc buổi phỏng vấn này?")) {
      endSessionEarly();
    }
  };

// Audio Replay Player Toggle (chuẩn hóa URL blob, relative và origin để phát lại mượt mà)
  const togglePlayAudio = async (key: string, rawUrl: string, aiVoice = false) => {
    if (!rawUrl) return;
    if (playingAudioKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      setPlayingAudioKey(null);
      return;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    try {
      let playbackUrl = rawUrl;
      // If it's a server audio path, fetch authenticated blob to allow secure playback
      if (!rawUrl.startsWith("blob:") && !rawUrl.startsWith("data:")) {
        const token = getStoredToken();
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
        const fetchUrl = rawUrl.startsWith("http")
          ? rawUrl
          : `${apiBase.replace(/\/+$/, "")}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

        const res = await fetch(fetchUrl, { headers });
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("File ghi âm không tồn tại hoặc đã hết hạn lưu trữ.");
          } else if (res.status === 401 || res.status === 403) {
            toast.error("Bạn không có quyền nghe lại đoạn ghi âm này.");
          } else {
            toast.error("Không thể tải file âm thanh.");
          }
          setPlayingAudioKey(null);
          return;
        }
        const blob = await res.blob();
        playbackUrl = URL.createObjectURL(blob);
        activeBlobUrlRef.current = playbackUrl;
      }

      const audio = new Audio(playbackUrl);
      activeAiReplayRef.current = aiVoice;
      if (aiVoice) audio.playbackRate = selectedPlaybackSpeed;
      audioPlayerRef.current = audio;
      setPlayingAudioKey(key);

      const cleanupCurrentAudio = () => {
        activeAiReplayRef.current = false;
        setPlayingAudioKey(null);
        audioPlayerRef.current = null;
        if (activeBlobUrlRef.current) {
          URL.revokeObjectURL(activeBlobUrlRef.current);
          activeBlobUrlRef.current = null;
        }
      };

      audio.onended = cleanupCurrentAudio;
      audio.onerror = (e) => {
        console.warn("Audio playback error on url:", rawUrl, e);
        cleanupCurrentAudio();
      };
      audio.play().catch((err) => {
        console.warn("audio.play() failed:", err);
        cleanupCurrentAudio();
      });
    } catch (err) {
      console.warn("Failed to initialize Audio element:", err);
      setPlayingAudioKey(null);
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (activeAiReplayRef.current && audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = selectedPlaybackSpeed;
    }
  }, [selectedPlaybackSpeed]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  // Auto scroll khung chat chung xuong tin nhan moi nhat
  // Deduplicated list of turns to completely guarantee no double card rendering
  const displayTurns = useMemo(() => {
    const seen = new Set<string>();
    const res: typeof turns = [];
    for (const t of turns) {
      const key = `${t.speaker}:${t.turnNumber || ""}:${t.text.trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        res.push(t);
      }
    }
    return res;
  }, [turns]);

  const openingAiTurn = displayTurns.find((turn) => turn.speaker === "ai");
  const hasCurrentAiTurn = displayTurns.some((turn) => turn.speaker === "ai" && turn.turnNumber === turnId);
  const streamingAiText = showTextDuringTtsFallback
    ? currentQuestion || spokenText
    : isAudioPlaying ? spokenText : currentQuestion;

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [displayTurns.length, aiState, currentQuestion, spokenText]);

  const visibleStages = THREE_STAGES.filter((stage) =>
    (stagesList.length ? stagesList.map((item) => item.id) : selectedStages).includes(stage.id)
  );
  const currentStageIdx = Math.max(0, visibleStages.findIndex((stage) => stage.id === currentStage.id));
  const mayRequestTransition = Boolean(interviewProgress &&
    (interviewProgress.ready || stageElapsedSeconds >= interviewProgress.targetSeconds));
  const progressPercent = interviewProgress
    ? Math.min(100, Math.round(interviewProgress.discussed / Math.max(1, interviewProgress.total) * 100))
    : 0;
  const progressNeedsClarification = Boolean(interviewProgress && !interviewProgress.ready &&
    interviewProgress.discussed > interviewProgress.completed);

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
              <span className={styles.personaMetaName}>• {persona.name}</span>
              <span
                className={`${styles.modeBadgePill} ${
                  mockMode === "strict" ? styles.modeBadgeStrict : styles.modeBadgeGuided
                }`}
                title={
                  mockMode === "strict"
                    ? "Chế độ thực chiến: AI phản biện sâu theo level, không có gợi ý"
                    : "Chế độ huấn luyện: Có hỗ trợ gợi ý khi cần"
                }
              >
                {mockMode === "strict" ? "Thực chiến" : "Huấn luyện"}
              </span>
            </div>

            {/* TOP CENTER: 3 CHẶNG TRÒN (O)-(O)-(O) */}
            <div className={styles.stageCenterStepper}>
              {visibleStages.map((stage, idx) => {
                const isFinished = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage.id} className={styles.stepperGroup}>
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
                          <span className={styles.stepActiveDot} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </span>
                      <span>{stage.label}</span>
                      {isCurrent && !interviewProgress && (
                        <span className={styles.stepTurnBadge}>
                          {turnInStage}/{targetTurnsInStage}
                        </span>
                      )}
                    </div>
                    {idx < visibleStages.length - 1 && (
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
              {meta.origin_job_id && (
                <a
                  href={`/jobs/${meta.origin_job_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.topJdLink}
                  title={`Xem tin tuyển dụng: ${meta.roleLabel || ""} tại ${meta.companyName || ""}`}
                >
                  <ExternalLink size={12} />
                  <span>Xem JD</span>
                </a>
              )}
              {!isCompleted && (
                <button
                  type="button"
                  className={styles.roundEndSessionBtn}
                  onClick={handleEndInterview}
                  disabled={isStoppingSession}
                  title="Kết thúc phỏng vấn sớm"
                >
                  <Square size={13} fill="currentColor" />
                  <span>{isStoppingSession ? "Đang kết thúc..." : "Kết thúc"}</span>
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

          <div className={styles.flowStrip} aria-live="polite">
            <div className={styles.flowStripDetails}>
              <span className={styles.flowStageName}>{currentStage.name}</span>
              <span>{interviewProgress
                ? `${interviewProgress.discussed}/${interviewProgress.total} nội dung đã trao đổi${progressNeedsClarification ? " · đang làm rõ" : ""}`
                : `Câu ${turnInStage}/${targetTurnsInStage}`}</span>
              <span className={styles.flowTime}>
                <Clock size={13} /> {formatTimer(stageElapsedSeconds)} / {formatTimer(stageMaxSeconds)}
              </span>
            </div>
            <div className={styles.flowTrack} role="progressbar" aria-label="Tiến độ nội dung chặng"
              aria-valuenow={interviewProgress?.discussed || 0} aria-valuemin={0}
              aria-valuemax={interviewProgress?.total || 1}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            {(!isConnected || connectionError) && <span className={styles.flowNotice} role={connectionError ? "alert" : "status"}>
              {connectionError || "Đang kết nối lại — đồng hồ tạm dừng, tiến độ được lưu."}
            </span>}
          </div>

          {!hasPlayedOpeningAudio && !isCompleted &&
            !displayTurns.some((turn) => turn.speaker === "user") && (
            <div className={styles.readyPanel} role={audioBlockedByAutoplay || connectionError ? "alert" : "status"}>
              <span>{connectionError || (audioBlockedByAutoplay
                ? "Trình duyệt đang chặn âm thanh. Bật tiếng để nghe câu hỏi mở đầu."
                : aiState === "listening" && openingAiTurn
                  ? "Câu mở đầu chưa phát được giọng. Bạn có thể nghe lại bản ghi."
                  : "Đang chuẩn bị giọng người phỏng vấn...")}</span>
              {audioBlockedByAutoplay ? (
                <button type="button" onClick={() => void resumeAudio()}>
                  <Volume2 size={15} /> Bật tiếng AI
                </button>
              ) : aiState === "listening" && openingAiTurn?.audioUrl ? (
                <button type="button" onClick={() => {
                  setHasPlayedOpeningAudio(true);
                  void togglePlayAudio(openingAiTurn.id, openingAiTurn.audioUrl!, true);
                }}>
                  <Play size={15} /> Nghe câu mở đầu
                </button>
              ) : null}
            </div>
          )}

          {/* =========================================================
              MIDDLE STAGE: MOT KHUNG CHAT DUY NHAT (ZIGZAG) + VIDEO AI CO DINH O GIUA
          ========================================================= */}
          <div className={styles.middleStageBody}>
            {/* MOT THANH CUON CHUNG CHO TOAN BO HOI THOAI */}
            <div className={styles.chatScrollArea} ref={chatScrollRef}>
              {displayTurns.length === 0 && !isAudioPlaying && !spokenText && !currentQuestion && aiState !== "speaking" && (
                <div className={styles.chatEmptyHint}>AI đang chuẩn bị câu hỏi mở đầu...</div>
              )}

              {displayTurns.map((turn, idx) =>
                turn.speaker === "ai" ? (
                  <div key={turn.id || `ai-${idx}`} className={styles.turnRowAi}>
                    <div className={styles.aiBubble}>
                      <div className={styles.bubbleMeta}>
                        <span>AI (Câu #{turn.turnNumber || idx + 1})</span>
                        <span>•</span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <div>{!showTextDuringTtsFallback && isAudioPlaying && spokenText && turn.turnNumber === turnId ? spokenText : turn.text}</div>
                      {turn.audioUrl && (
                        <button
                          type="button"
                          className={styles.audioReplayBtn}
                          onClick={() => togglePlayAudio(turn.id || `ai-${idx}`, turn.audioUrl!, true)}
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
              {isVoiceMode && (voiceDraft.state === "review" ||
                (voiceDraft.state === "recording" && voiceDraftHasSpeech)) && (
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
                          <span>Dừng và gửi</span>
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

              {/* Bong bong dang go chu khi AI noi (chong trung lap voi turn da add vao turns) */}
              {streamingAiText && !hasCurrentAiTurn && (
                <div className={styles.turnRowAi}>
                  <div className={styles.aiStreamingBubble}>
                    <div className={styles.bubbleMeta}>
                      <span className={styles.statePulseDot} />
                      <span>{isAudioPlaying ? "AI đang nói..." : "AI đang trả lời..."}</span>
                    </div>
                    <div>
                      {streamingAiText}
                      <span className={styles.typewriterCursor} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO AI O CHINH GIUA - CO DINH, KHONG CUON THEO KHUNG CHAT */}
            <div className={styles.centerAiBox}>
              <div className={styles.interviewerMediaStage}>
                {isAudioPlaying && (
                  <span className={styles.speakingHaloRing} />
                )}
                <div className={styles.mediaBackdropStudio} />

                <ChromaVideoCanvas
                  videoSrc={persona.videoUrl}
                  isPlaying={isAudioPlaying}
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

          {/* Coaching hint for the current question */}
          {currentHint && (
            <div className={styles.hintFloatingCard}>
              <div className={styles.hintCardHeader}>
                <div className={styles.hintTitleBox}>
                  <Sparkles size={14} />
                  <span>Gợi ý từ Huấn luyện viên AI</span>
                </div>
                <button
                  type="button"
                  className={styles.hintCloseBtn}
                  onClick={clearHint}
                  title="Đóng gợi ý"
                >
                  <X size={12} />
                </button>
              </div>
              <div className={styles.hintContent}>{currentHint}</div>
            </div>
          )}

          {ttsFallbackConsent && !isCompleted && (
            <section className={`${styles.transitionPanel} ${styles.ttsConsentPanel}`} role="alert" aria-label="Xác nhận giọng đọc dự phòng">
              <div className={styles.transitionCopy}>
                <span className={styles.transitionEyebrow}><Volume2 size={14} /> Giọng đọc gặp sự cố</span>
                <strong>Hai lượt liên tiếp phải dùng giọng dự phòng</strong>
                <p>Trong mỗi lượt, các câu tiếp theo đã giữ cùng nguồn phát để tránh chờ lại. Bạn có đồng ý dùng {ttsFallbackConsent.phase === "backup" ? "Edge TTS" : "giọng trình duyệt"} cho phần còn lại của buổi phỏng vấn không? Nếu không, lượt tiếp theo sẽ thử lại giọng hiện tại.</p>
              </div>
              <div className={styles.transitionActions}>
                <button type="button" className={styles.btnSecondaryStageDefer}
                  disabled={!isConnected || isConfirmingTtsFallback}
                  onClick={() => chooseTtsFallback(false)}>Thử lại giọng hiện tại</button>
                <button type="button" className={styles.btnGreenStageConfirm}
                  disabled={!isConnected || isConfirmingTtsFallback}
                  onClick={() => chooseTtsFallback(true)}>
                  <Check size={15} /> {isConfirmingTtsFallback ? "Đang lưu..." : `Dùng ${ttsFallbackConsent.phase === "backup" ? "Edge TTS" : "giọng trình duyệt"} đến cuối buổi`}
                </button>
              </div>
            </section>
          )}

          {pendingTransition ? (
            <section className={styles.transitionPanel} aria-live="polite" aria-label="Xác nhận tiến trình phỏng vấn">
              <div className={styles.transitionCopy}>
                <span className={styles.transitionEyebrow}>
                  <Sparkles size={14} /> {pendingTransition.reason === "overtime" ? "Cần quyết định của bạn" : "Sẵn sàng khi bạn muốn"}
                </span>
                <strong>{pendingTransition.kind === "end"
                  ? "Khép lại buổi phỏng vấn?"
                  : `Chuyển sang ${STAGE_LABELS[pendingTransition.nextStage] || "chặng tiếp theo"}?`}</strong>
                <p>{pendingTransition.reason === "overtime"
                  ? `Còn ${pendingTransition.remainingRequired} nội dung chưa trao đổi. Bạn có thể tiếp tục hoặc xác nhận bỏ qua chúng.`
                  : pendingTransition.kind === "end"
                    ? "Nếu còn thắc mắc, cứ tiếp tục trò chuyện. Buổi phỏng vấn chỉ kết thúc khi bạn xác nhận."
                    : "Bạn có thể nói thêm ở chặng này. Chặng tiếp theo chỉ bắt đầu sau khi bạn xác nhận."}</p>
              </div>
              <div className={styles.transitionActions}>
                <button type="button" className={styles.btnSecondaryStageDefer}
                   disabled={!canAnswer || isConfirmingTransition || isVoiceDraftBusy}
                   onClick={() => { if (["requesting", "recording"].includes(voiceDraft.state)) voiceDraft.cancelRecording(); deferStageTransition(); }}>
                  <MessageSquare size={14} /> {pendingTransition.reason === "overtime" ? "Tiếp tục đào sâu" : "Nói thêm"}
                </button>
                <button type="button" className={styles.btnGreenStageConfirm}
                   disabled={!canAnswer || isConfirmingTransition || isVoiceDraftBusy}
                   onClick={() => { if (["requesting", "recording"].includes(voiceDraft.state)) voiceDraft.cancelRecording(); confirmStageTransition(); }}>
                  <CheckCircle2 size={16} /> {isConfirmingTransition ? "Đang xác nhận..."
                    : pendingTransition.reason === "overtime" ? "Bỏ qua và tiếp tục"
                      : pendingTransition.kind === "end" ? "Xác nhận kết thúc" : "Sẵn sàng chuyển"}
                </button>
              </div>
            </section>
          ) : mayRequestTransition && !isCompleted ? (
            <div className={styles.readyPanel}>
              <span>{interviewProgress?.ready
                ? "Đã trao đổi đủ nội dung của chặng. Bạn có thể nói thêm hoặc đề nghị chuyển."
                : `Đã đến mốc thời gian; còn ${interviewProgress?.remainingRequired} nội dung cần trao đổi.`}</span>
              <button type="button" disabled={!canAnswer || isVoiceDraftBusy}
                onClick={() => { if (["requesting", "recording"].includes(voiceDraft.state)) voiceDraft.cancelRecording(); skipToNextStage(); }}>
                {currentStage.is_last ? "Đề nghị kết thúc" : "Đề nghị chuyển chặng"}
                <FastForward size={14} />
              </button>
            </div>
          ) : null}

          {/* =========================================================
              BOTTOM ROW: THANH ĐIỀU KHIỂN BO TRÒN THEO PHÁC THẢO [  INPUT  ] [O] [O] [O]
          ========================================================= */}
          <div className={styles.bottomControlCapsule}>
{/* Input Zone on Left */}
            <div className={styles.capsuleInputZone}>
              {isVoiceMode ? (
                voiceDraft.error ? (
                  <p className={styles.capsuleStatusText} role="alert">{voiceDraft.error}</p>
                ) : voiceDraft.state === "recording" ? (
                  <p className={styles.capsuleStatusText}>
                    <span className={styles.statusDotRecording}>
                      {bargeInEnabled && !voiceDraftHasSpeech ? "● Mic đang nghe" : "● Đang thu âm"}
                    </span>{" "}
                    {bargeInEnabled && !voiceDraftHasSpeech
                      ? "Bạn có thể nói để ngắt lời AI; mic sẽ tự gửi khi bạn ngừng nói."
                      : bargeInEnabled
                        ? `Tự gửi sau khi bạn dừng nói${voiceDraft.silenceRemaining !== null ? ` (${voiceDraft.silenceRemaining}s)` : ""}.`
                        : "Bấm Dừng và gửi khi bạn nói xong."}
                  </p>
                ) : voiceDraft.state === "review" ? (
                  <p className={styles.capsuleStatusText}>
                    <span className={styles.statusDotReview}>Bản thu chưa gửi:</span> Kiểm tra nhận diện rồi bấm Gửi lại.
                  </p>
                ) : (
                  <p className={styles.capsuleStatusText}>
                    {bargeInEnabled
                      ? "Mic tự động sẽ nghe cả khi AI đang nói. Bạn có thể nói để ngắt lời."
                      : isAudioPlaying || aiState === "speaking"
                      ? "Lắng nghe câu hỏi từ AI trước khi trả lời..."
                      : canAnswer
                      ? "Bấm micro để nói, bấm lần nữa để dừng và gửi."
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
                    className={`${styles.roundActionBtn} ${bargeInEnabled && !voiceDraftHasSpeech ? styles.btnAutoMic : styles.btnRecordingStop}`}
                    onClick={() => {
                      if (bargeInEnabled && !voiceDraftHasSpeech) {
                        voiceDraft.cancelRecording();
                        toggleBargeIn();
                      } else void voiceDraft.stopRecording();
                    }}
                    title={bargeInEnabled && !voiceDraftHasSpeech ? "Tắt micro tự động" : "Dừng và gửi câu trả lời"}
                  >
                    {bargeInEnabled && !voiceDraftHasSpeech ? <Mic size={18} /> : <Square size={16} fill="currentColor" />}
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
                    title={bargeInEnabled ? "Bật lại micro" : "Bắt đầu thu âm"}
                  >
                    <Mic size={18} />
                  </button>
                )
              ) : null}

              {/* Chỉ hiện nút gửi lại nếu nhận diện thất bại hoặc cần sửa bản thu */}
              {isVoiceMode ? (
                voiceDraft.state === "review" ? (
                  <button
                    type="button"
                    className={`${styles.roundActionBtn} ${styles.btnSubmitSend}`}
                    onClick={voiceDraft.submit}
                    disabled={!canAnswer || !voiceDraft.transcript.trim()}
                    title="Gửi lại bản thu"
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

              {/* Nút STAR Coaching Hint (chỉ hiển thị khi ở chế độ Huấn luyện Guided) */}
              {mockMode === "guided" && (
                <button
                  type="button"
                  className={`${styles.roundActionBtn} ${styles.btnStarHint}`}
                  onClick={requestHint}
                  disabled={!canAnswer || isRequestingHint}
                  title={isRequestingHint ? "Đang phân tích câu hỏi để tạo gợi ý..." : "Xin gợi ý từ Huấn luyện viên AI"}
                >
                  <Sparkles size={16} />
                </button>
              )}
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

              {/* Công nghệ phát giọng nói (TTS Engine) - 3 Lựa chọn: Edge, ElevenLabs, Web Speech */}
              <div className={styles.settingsSection}>
                <div className={styles.settingsSectionLabel}>
                  <span>Công nghệ phát giọng nói (TTS Engine)</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${ttsEngine === "edge" ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handleTtsEngineChange("edge")}
                  >
                    Edge TTS (Cloud Miễn phí)
                  </button>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${ttsEngine === "elevenlabs" ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handleTtsEngineChange("elevenlabs")}
                  >
                    ElevenLabs AI (Studio Pro ⭐)
                  </button>
                  {voiceOptions?.voices.some((voice) => voice.provider === "vieneu") && (
                    <button
                      type="button"
                      className={`${styles.pitchQuickBtn} ${ttsEngine === "vieneu" ? styles.pitchQuickBtnActive : ""}`}
                      onClick={() => handleTtsEngineChange("vieneu")}
                    >
                      VieNeu Cloud (Tiếng Việt)
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${ttsEngine === "browser" ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => handleTtsEngineChange("browser")}
                  >
                    Web Speech (Trình duyệt - 0ms)
                  </button>
                </div>
                <p className={styles.settingsHelper}>
                  {ttsEngine === "browser"
                    ? "Web Speech API: Phát âm trực tiếp trên trình duyệt máy bạn, độ trễ thấp nhất (0ms network delay)."
                    : ttsEngine === "vieneu"
                    ? "VieNeu Cloud v4: Phát âm tiếng Việt qua máy chủ. Nếu dịch vụ gián đoạn, hệ thống thử lại bằng Edge TTS."
                    : ttsEngine === "elevenlabs"
                    ? "ElevenLabs AI: Giọng đọc phòng thu đỉnh cao thế giới với biểu cảm tự nhiên vượt trội (Dành cho gói Pro)."
                    : "Edge TTS: Giọng đọc Microsoft Cloud AI tự nhiên và truyền cảm (Miễn phí cho mọi tài khoản)."}
                </p>
              </div>

              {/* Giọng đọc tương ứng theo TTS Engine */}
              {ttsEngine === "vieneu" ? (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionLabel}>
                    <span>Giọng đọc VieNeu</span>
                  </div>
                  <SimpleUserSelect
                    id="settings-voice-select-vieneu"
                    value={selectedVoice}
                    disabled={!canSendText}
                    onChange={handleVoiceChange}
                    options={filteredVoices
                      .filter((voice) => voice.provider === "vieneu")
                      .map((voice) => ({ value: voice.id, label: voice.name }))}
                    aria-label="VieNeu Voice"
                  />
                  <button
                    type="button"
                    className={styles.pitchPreviewBtn}
                    onClick={handlePreviewVoice}
                  >
                    {playingAudioKey === "voice-pitch-preview" ? "Dừng nghe thử" : "Nghe thử giọng VieNeu"}
                  </button>
                  <p className={styles.settingsHelper}>VieNeu chưa hỗ trợ chỉnh cao độ (pitch). Tùy chọn này dùng API key trên máy chủ, không gửi key tới trình duyệt.</p>
                </div>
              ) : ttsEngine === "edge" ? (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionLabel}>
                    <span>Giọng đọc Edge TTS</span>
                    <span className={`${styles.voiceTierBadge} ${styles.tierBadgeFree}`}>
                      Miễn phí
                    </span>
                  </div>
                  <SimpleUserSelect
                    id="settings-voice-select-edge"
                    value={selectedVoice}
                    disabled={!canSendText}
                    onChange={handleVoiceChange}
                    options={filteredVoices
                      .filter((v) => v.provider === "edge")
                      .map((v) => ({
                        value: v.id,
                        label: `${v.name} (${v.gender === "female" ? "Nữ" : "Nam"})`,
                      }))}
                    aria-label="Edge AI Voice"
                  />
                  <p className={styles.settingsHelper}>
                    {language === "vi"
                      ? "Tự động ưu tiên giọng tiếng Việt và giọng đa ngôn ngữ (xử lý tự nhiên khi câu hỏi chứa thuật ngữ tiếng Anh)."
                      : "Giọng đọc tương thích với ngôn ngữ phỏng vấn đã chọn."}
                  </p>
                </div>
              ) : ttsEngine === "elevenlabs" ? (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionLabel}>
                    <span>Giọng đọc ElevenLabs Studio</span>
                    {voiceOptions?.is_premium_user ? (
                      <span className={styles.voiceTierBadge} style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                        ⭐ Đã kích hoạt Pro
                      </span>
                    ) : (
                      <span className={styles.voiceTierBadge} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
                        🔒 Yêu cầu gói Pro
                      </span>
                    )}
                  </div>
                  <SimpleUserSelect
                    id="settings-voice-select-eleven"
                    value={selectedVoice}
                    disabled={!canSendText}
                    onChange={handleVoiceChange}
                    options={filteredVoices
                      .filter((v) => v.provider === "elevenlabs")
                      .map((v) => ({
                        value: v.id,
                        label: `${v.name} ${v.is_locked ? "🔒 (Khóa Pro)" : "⭐"}`,
                      }))}
                    aria-label="ElevenLabs AI Voice"
                  />
                  {!voiceOptions?.is_premium_user && (
                    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: 12, color: "#b91c1c" }}>
                      Tài khoản của bạn hiện là Free. Nâng cấp tài khoản Pro để mở khóa toàn bộ giọng ElevenLabs Studio chuẩn phòng thu.{" "}
                      <a href="/pricing" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 750, color: "#b91c1c", textDecoration: "underline" }}>
                        Xem bảng giá ↗
                      </a>
                    </div>
                  )}
                  <p className={styles.settingsHelper}>
                    Mô hình ElevenLabs Multilingual v2 với ngữ điệu và cảm xúc chân thực nhất thế giới.
                  </p>
                </div>
              ) : (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsSectionLabel}>
                    <span>Giọng đọc Trình duyệt (Web Speech API)</span>
                    <span className={`${styles.voiceTierBadge} ${styles.tierBadgeFree}`}>
                      0ms Delay
                    </span>
                  </div>
                  <SimpleUserSelect
                    id="settings-browser-voice-select"
                    value={selectedBrowserVoice || (browserVoices[0]?.name || "")}
                    disabled={!canSendText}
                    onChange={handleBrowserVoiceChange}
                    options={browserVoices.map((v) => ({
                      value: v.name,
                      label: `${v.name} (${v.lang})`,
                    }))}
                    aria-label="Browser Voice"
                  />
                  <p className={styles.settingsHelper}>
                    Danh sách giọng đọc được cung cấp bởi hệ điều hành / trình duyệt của thiết bị bạn.
                  </p>
                </div>
              )}

              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel} htmlFor="interview-playback-speed">
                  <span>Tốc độ nói của người phỏng vấn</span>
                  <span className={styles.pitchValueBadge}>{selectedPlaybackSpeed.toFixed(2)}×</span>
                </label>
                <div className={styles.pitchSliderWrapper}>
                  <span className={styles.pitchBoundaryLabel}>Chậm</span>
                  <input
                    id="interview-playback-speed"
                    type="range"
                    min={0.85}
                    max={1.5}
                    step={0.05}
                    value={selectedPlaybackSpeed}
                    onChange={(event) => handlePlaybackSpeedChange(Number(event.target.value))}
                    className={styles.pitchSlider}
                    aria-valuetext={`${selectedPlaybackSpeed.toFixed(2)} lần tốc độ bình thường`}
                  />
                  <span className={styles.pitchBoundaryLabel}>Nhanh</span>
                </div>
                <p className={styles.settingsHelper}>
                  Mặc định {DEFAULT_INTERVIEW_PLAYBACK_SPEED.toFixed(2)}×. Lưu trên thiết bị này;
                  áp dụng từ đoạn giọng tiếp theo, không thay đổi bản thu của bạn.
                </p>
              </div>

              {/* Độ cao / thấp giọng đọc (Pitch Control) */}
              {ttsEngine !== "vieneu" && <div className={styles.settingsSection}>
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
                <button
                  type="button"
                  className={styles.pitchPreviewBtn}
                  onClick={handlePreviewVoice}
                >
                  {playingAudioKey === "voice-pitch-preview" ? (
                    <>
                      <Square size={13} fill="currentColor" /> Dừng nghe thử
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} /> Nghe thử giọng đọc ({selectedPitch >= 0 ? `+${selectedPitch}Hz` : `${selectedPitch}Hz`})
                    </>
                  )}
                </button>
                <p className={styles.settingsHelper}>
                  Điều chỉnh cao độ âm sắc để giọng nói AI trở nên trầm ấm hoặc thanh mảnh theo sở thích của bạn.
                </p>
              </div>}

              <div className={styles.settingsSection}>
                <span className={styles.settingsSectionLabel}>Micro hội thoại</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={bargeInEnabled}
                  className={`${styles.pitchQuickBtn} ${bargeInEnabled ? styles.pitchQuickBtnActive : ""}`}
                  onClick={() => {
                    if (voiceDraft.state === "recording" && !voiceDraftHasSpeech) voiceDraft.cancelRecording();
                    toggleBargeIn();
                  }}
                >
                  {bargeInEnabled ? "Đang bật: nghe liên tục và tự gửi" : "Đang tắt: bấm mic để nói"}
                </button>
                <p className={styles.settingsHelper}>
                  Khi bật, micro tự nghe và có thể ngắt lời AI khi nhận diện tiếng nói của bạn.
                  Nên dùng tai nghe để tránh loa AI lọt vào micro. Trình duyệt cần cấp quyền micro và hỗ trợ nhận diện giọng nói.
                </p>
              </div>

              <div className={styles.settingsDivider} />

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
                    label: eng.name,
                  }))}
                  aria-label="STT Engine"
                />
              </div>

              <div className={styles.settingsDivider} />

              {/* Chế độ Mock Interview */}
              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel}>Chế độ Mock Interview</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${mockMode === "guided" ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => changeMockMode("guided")}
                  >
                    Huấn luyện (Guided)
                  </button>
                  <button
                    type="button"
                    className={`${styles.pitchQuickBtn} ${mockMode === "strict" ? styles.pitchQuickBtnActive : ""}`}
                    onClick={() => changeMockMode("strict")}
                  >
                    Thực chiến (Strict)
                  </button>
                </div>
                <p className={styles.settingsHelper}>
                  {mockMode === "strict"
                    ? "Thực chiến: Áp lực cao, không có gợi ý, AI phản biện sâu bám sát CV & JD."
                    : "Huấn luyện: Hỗ trợ nút xin gợi ý khi bạn cần hướng dẫn trả lời."}
                </p>
              </div>

              <div className={styles.settingsDivider} />

              {/* Điều khiển phiên */}
              <div className={styles.settingsSection}>
                <label className={styles.settingsSectionLabel}>Thao tác phiên</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    className={styles.settingsActionBtn}
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
                    className={styles.settingsActionBtn}
                    onClick={() => {
                      skipToNextStage();
                      setIsSettingsOpen(false);
                    }}
                    disabled={!canAnswer || voiceDraft.state !== "idle" || !mayRequestTransition || Boolean(pendingTransition)}
                  >
                    <FastForward size={13} />
                    <span>{currentStage.is_last ? "Đề nghị kết thúc" : "Đề nghị chuyển chặng"}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.settingsStarBtn}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsStarOpen(true);
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Mở gợi ý cấu trúc trả lời</span>
                  </button>
                </div>

                {!isCompleted && (
                  <button
                    type="button"
                    className={styles.btnEndInterviewFull}
                    disabled={isStoppingSession}
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleEndInterview();
                    }}
                  >
                    <span>{isStoppingSession ? "Đang kết thúc phỏng vấn..." : "Kết thúc phỏng vấn sớm"}</span>
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
        framework={currentIntent?.question_type || "generic"}
        onInsertStarter={(starter) => {
          setCurrentMode("text");
          setTypedText((prev) => (prev ? `${prev}\n\n${starter}` : starter));
          setIsStarOpen(false);
        }}
      />
    </div>
  );
}
