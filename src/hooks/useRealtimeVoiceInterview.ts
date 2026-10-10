"use client";
import type { QuestionIntentContext, StageConfigIn } from "@/types/interview";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type AiVoiceState = "idle" | "listening" | "thinking" | "speaking" | "completed";

export interface StageData {
  id: string;
  name: string;
  description: string;
  subtopics: string[];
  index: number;
  total: number;
  is_first: boolean;
  is_last: boolean;
}

export interface ConversationTurn {
  id: string;
  turnNumber: number;
  speaker: "ai" | "user";
  text: string;
  durationSeconds?: number;
  timestamp: string;
  audioUrl?: string | null;
}

export interface StageTransitionProposal {
  currentStage: string;
  nextStage: string;
  stageIndex: number;
  totalStages: number;
  stageName: string;
  turnId: number;
  elapsedSeconds: number;
  stageMaxSeconds: number;
  summaryMessage: string;
}

export interface UseRealtimeVoiceInterviewOptions {
  sessionId: string;
  enabled?: boolean;
  roleName?: string;
  level?: string;
  language?: string;
  voice?: string;
  pitch?: string;
  selectedStages?: string[];
  stageConfigs?: StageConfigIn[];
  selectedQuestionIds?: (number | string)[];
  bargeInInitial?: boolean;
  personaName?: string;
  companyName?: string;
  mockMode?: "strict" | "guided";
  totalDurationMinutes?: number;
}

/**
 * Gapless Web Audio API player inspired by Xiaozhi ESP32 digital-human StreamingContext.
 * Decodes MP3 sentence packets asynchronously and schedules playback with sample-level accuracy,
 * eliminating the micro-gaps, clicks, and browser audio element stuttering.
 */
class StreamingAudioPlayer {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scheduledEndTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted = false;
  private isExpectingMoreAudio = false;
  private decodeQueue: Promise<void> = Promise.resolve();
  private pendingDecodes = 0;
  private playbackVersion = 0;
  private scheduledSubtitles: { startsAt: number; onStart: () => void }[] = [];
  private endCheckTimer: NodeJS.Timeout | null = null;
  private onPlaybackEnded: (() => void) | null = null;
  private onPlayStateChange: ((isPlaying: boolean) => void) | null = null;

  constructor(
    onPlaybackEnded: () => void,
    onPlayStateChange: (isPlaying: boolean) => void
  ) {
    this.onPlaybackEnded = onPlaybackEnded;
    this.onPlayStateChange = onPlayStateChange;
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (!this.analyserNode) {
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.gainNode.connect(this.analyserNode);
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyserNode && typeof window !== "undefined") {
      try {
        this.getAudioContext();
      } catch {}
    }
    return this.analyserNode;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public isPlaying(): boolean {
    if (!this.ctx) return false;
    return this.ctx.currentTime < this.scheduledEndTime || this.activeSources.length > 0 || this.isExpectingMoreAudio || this.pendingDecodes > 0;
  }

  public setExpectingMoreAudio(expecting: boolean) {
    this.isExpectingMoreAudio = expecting;
    this.startEndCheck();
  }

  public enqueueBase64(base64Data: string, onStart: () => void): Promise<void> {
    this.isExpectingMoreAudio = true;
    const version = this.playbackVersion;
    this.pendingDecodes += 1;
    this.decodeQueue = this.decodeQueue.then(async () => {
      try {
        if (version === this.playbackVersion) await this.decodeAndSchedule(base64Data, onStart, version);
      } finally {
        if (version === this.playbackVersion) this.pendingDecodes -= 1;
      }
    });
    return this.decodeQueue;
  }

  private async decodeAndSchedule(base64Data: string, onStart: () => void, version: number): Promise<void> {
    try {
      const ctx = this.getAudioContext();
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // decodeAudioData consumes the buffer, slice to prevent detached buffer issues
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      if (version !== this.playbackVersion) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(this.scheduledEndTime, currentTime);
      source.start(startTime);
      this.scheduledEndTime = startTime + audioBuffer.duration;
      this.activeSources.push(source);
      this.scheduledSubtitles.push({ startsAt: startTime, onStart });

      if (this.onPlayStateChange) {
        this.onPlayStateChange(true);
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };

      this.startEndCheck();
    } catch (err) {
      console.warn("StreamingAudioPlayer decode/schedule error:", err);
    }
  }

  private startEndCheck() {
    if (this.endCheckTimer) return;
    this.endCheckTimer = setInterval(() => {
      if (!this.ctx) {
        this.stopEndCheck();
        return;
      }
      if (this.ctx.state === "suspended") return;
      while (this.scheduledSubtitles.length && this.scheduledSubtitles[0].startsAt <= this.ctx.currentTime) {
        this.scheduledSubtitles.shift()?.onStart();
      }
      if (this.isExpectingMoreAudio || this.pendingDecodes > 0) {
        return;
      }
      if (this.ctx.currentTime >= this.scheduledEndTime && this.activeSources.length === 0) {
        this.stopEndCheck();
        if (this.onPlayStateChange) {
          this.onPlayStateChange(false);
        }
        if (this.onPlaybackEnded) {
          this.onPlaybackEnded();
        }
      }
    }, 60);
  }

  private stopEndCheck() {
    if (this.endCheckTimer) {
      clearInterval(this.endCheckTimer);
      this.endCheckTimer = null;
    }
  }

  public stop() {
    this.playbackVersion += 1;
    this.pendingDecodes = 0;
    this.decodeQueue = Promise.resolve();
    this.scheduledSubtitles = [];
    this.isExpectingMoreAudio = false;
    this.stopEndCheck();
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    this.activeSources = [];
    if (this.ctx) {
      this.scheduledEndTime = this.ctx.currentTime;
    } else {
      this.scheduledEndTime = 0;
    }
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  public destroy() {
    this.stop();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.gainNode = null;
    this.analyserNode = null;
  }
}

export function useRealtimeVoiceInterview({
  enabled = true,
  sessionId,
  roleName = "Software Engineer",
  level = "Senior",
  language = "vi",
  voice,
  pitch = "+0Hz",
  selectedStages = ["warmup", "technical", "closing"],
  stageConfigs,
  selectedQuestionIds,
  personaName,
  companyName,
  mockMode: initialMockMode = "guided",
  totalDurationMinutes = 45,
  bargeInInitial = true,
}: UseRealtimeVoiceInterviewOptions) {
  // Connection & Lifecycle State
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [aiState, setAiState] = useState<AiVoiceState>("idle");
  const [activeVoice, setActiveVoice] = useState<string>(voice || "vi-VN-HoaiMyNeural");
  const [activePitch, setActivePitch] = useState<string>(pitch || "+0Hz");
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);

  // Stage & Turn Progress
  const [currentStage, setCurrentStage] = useState<StageData>({
    id: selectedStages[0] || "warmup",
    name: "Khởi động & Chào hỏi",
    description: "Chào hỏi, hỏi thăm bối cảnh & thời tiết, giới thiệu bản thân",
    subtopics: ["Chào hỏi mở đầu", "Thời tiết & bối cảnh", "Giới thiệu bản thân"],
    index: 1,
    total: selectedStages.length || 3,
    is_first: true,
    is_last: selectedStages.length <= 1,
  });
  const [stagesList, setStagesList] = useState<any[]>([]);
  const [turnId, setTurnId] = useState(1);
  const [turnInStage, setTurnInStage] = useState(1);
  const [targetTurnsInStage, setTargetTurnsInStage] = useState(2);
  const [currentIntent, setCurrentIntent] = useState<QuestionIntentContext | null>(null);

  // New Adaptive 3-Stage & Mock Mode states
  const [pendingTransition, setPendingTransition] = useState<StageTransitionProposal | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [mockMode, setMockModeState] = useState<"strict" | "guided">(initialMockMode);
  const [stageElapsedSeconds, setStageElapsedSeconds] = useState(0);
  const [stageMaxSeconds, setStageMaxSeconds] = useState(600);

  // Realtime Subtitles & Tokens
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);

  // Audio, Mic & Barge-in Controls
  const [bargeInEnabled, setBargeInEnabled] = useState(bargeInInitial);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioBlockedByAutoplay, setAudioBlockedByAutoplay] = useState(false);

  // TTS Engine: 'edge' (Cloud AI) or 'browser' (Web Speech API - 0ms latency)
  const [ttsEngine, setTtsEngineState] = useState<"edge" | "browser">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("preferred_tts_engine");
        if (saved === "browser" || saved === "edge") return saved;
      } catch {}
    }
    return "edge";
  });
  const ttsEngineRef = useRef<"edge" | "browser">(ttsEngine);
  ttsEngineRef.current = ttsEngine;

  const [selectedBrowserVoice, setSelectedBrowserVoiceState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("preferred_browser_voice") || null;
      } catch {}
    }
    return null;
  });
  const browserVoiceRef = useRef<string | null>(selectedBrowserVoice);
  browserVoiceRef.current = selectedBrowserVoice;

  const setTtsEngine = useCallback((engine: "edge" | "browser") => {
    setTtsEngineState(engine);
    ttsEngineRef.current = engine;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("preferred_tts_engine", engine);
      } catch {}
      if (engine === "edge" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  const setSelectedBrowserVoice = useCallback((voiceName: string | null) => {
    setSelectedBrowserVoiceState(voiceName);
    browserVoiceRef.current = voiceName;
    if (typeof window !== "undefined" && voiceName) {
      try {
        localStorage.setItem("preferred_browser_voice", voiceName);
      } catch {}
    }
  }, []);

  const browserTtsPendingCountRef = useRef(0);
  const isAudioMutedRef = useRef(false);
  isAudioMutedRef.current = isAudioMuted;

  const speakWithBrowserTTS = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const clean = text.trim();
    if (!clean) return;

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();

      let voiceToUse: SpeechSynthesisVoice | undefined;
      if (browserVoiceRef.current) {
        voiceToUse = voices.find((v) => v.name === browserVoiceRef.current);
      }
      if (!voiceToUse) {
        const langCode = (optionsRef.current.language || "vi").toLowerCase();
        if (langCode === "vi") {
          voiceToUse = voices.find((v) => v.lang.toLowerCase().startsWith("vi"));
        } else {
          voiceToUse = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
        }
      }
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      const pitchHz = parseInt(activePitch, 10) || 0;
      utterance.pitch = Math.max(0.6, Math.min(1.4, 1.0 + (pitchHz * 0.03)));
      utterance.rate = 1.0;
      utterance.volume = isAudioMutedRef.current ? 0 : 1;

      browserTtsPendingCountRef.current += 1;

      utterance.onstart = () => {
        setIsAudioPlaying(true);
        setAiState("speaking");
        setCurrentSubtitle(clean);
      };

      utterance.onend = () => {
        browserTtsPendingCountRef.current = Math.max(0, browserTtsPendingCountRef.current - 1);
        if (browserTtsPendingCountRef.current === 0) {
          setIsAudioPlaying(false);
          if (serverHasFinishedTurnRef.current && !submissionPendingRef.current) {
            setAiState("listening");
          }
        }
      };

      utterance.onerror = () => {
        browserTtsPendingCountRef.current = Math.max(0, browserTtsPendingCountRef.current - 1);
        if (browserTtsPendingCountRef.current === 0) {
          setIsAudioPlaying(false);
          if (serverHasFinishedTurnRef.current && !submissionPendingRef.current) {
            setAiState("listening");
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Browser SpeechSynthesis error:", err);
    }
  }, [activePitch]);

  // State References for safe async callbacks
  const aiStateRef = useRef<AiVoiceState>("idle");
  aiStateRef.current = aiState;
  const isCompletedRef = useRef<boolean>(false);
  isCompletedRef.current = isCompleted;
  const turnIdRef = useRef<number>(turnId);
  turnIdRef.current = turnId;

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isManuallyClosedRef = useRef(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Xiaozhi VAD & Turn-taking references
  const serverHasFinishedTurnRef = useRef<boolean>(false);

  // Audio subsystem references
  const playerRef = useRef<StreamingAudioPlayer | null>(null);
  const playbackReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCompletionRef = useRef(false);
  const submissionPendingRef = useRef(false);
  const activeGenerationRef = useRef<string | null>(null);
  const ignoredGenerationsRef = useRef(new Set<string>());
  const subtitlesRef = useRef(new Map<number, string>());

  const fullAiTextAccumulatorRef = useRef<string>("");
  const questionsPerStage = useMemo(
    () =>
      Object.fromEntries(
        stageConfigs?.length
          ? stageConfigs.map((cfg) => [cfg.stage_key, cfg.max_turns || 2])
          : selectedStages.map((s) => [s, 2])
      ),
    [stageConfigs, selectedStages]
  );

  const optionsRef = useRef({
    roleName,
    level,
    language,
    voice,
    pitch,
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
    selectedQuestionIds,
    personaName,
    companyName,
    mockMode,
    totalDurationMinutes,
  });

  useEffect(() => {
    optionsRef.current = {
      roleName,
      level,
      language,
      voice,
      pitch,
      bargeInEnabled,
      selectedStages,
      questionsPerStage,
      selectedQuestionIds,
      personaName,
      companyName,
      mockMode,
      totalDurationMinutes,
    };
  }, [
    roleName,
    level,
    language,
    voice,
    pitch,
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
    selectedQuestionIds,
    personaName,
    companyName,
    mockMode,
    totalDurationMinutes,
  ]);

  // Session Duration Counter
  useEffect(() => {
    if (isCompleted) {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      return;
    }
    sessionTimerRef.current = setInterval(() => {
      setSessionDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isCompleted]);

  // Send message helper
  const sendMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (enabled && isConnected) sendMessage({ type: "config", language });
  }, [enabled, isConnected, language, sendMessage]);

  // Initialize StreamingAudioPlayer
  useEffect(() => {
    if (typeof window === "undefined") return;

    playerRef.current = new StreamingAudioPlayer(
      () => {
        if (pendingCompletionRef.current) {
          setIsCompleted(true);
          setAiState("completed");
          return;
        }
        if (serverHasFinishedTurnRef.current && !isCompletedRef.current) {
          playbackReadyTimerRef.current = setTimeout(() => {
            if (serverHasFinishedTurnRef.current && !isCompletedRef.current && !playerRef.current?.isPlaying()) {
              setAiState("listening");
            }
          }, 400);
        }
      },
      (playing) => {
        setIsAudioPlaying(playing);
        if (playing) {
          setAiState("speaking");
        }
      }
    );

    return () => {
      if (playbackReadyTimerRef.current) clearTimeout(playbackReadyTimerRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  // Resume audio playback if blocked by browser autoplay policy
  const resumeAudio = useCallback(async () => {
    try {
      const context = playerRef.current?.getAudioContext();
      await context?.resume();
      setAudioBlockedByAutoplay(context?.state === "suspended");
    } catch {
      setAudioBlockedByAutoplay(true);
      setError("Chưa bật được âm thanh AI. Hãy nhấn bật tiếng một lần nữa.");
    }
  }, []);

  // Toggle speaker mute
  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      playerRef.current?.setMuted(next);
      if (typeof window !== "undefined" && window.speechSynthesis && next) {
        window.speechSynthesis.cancel();
        browserTtsPendingCountRef.current = 0;
      }
      return next;
    });
  }, []);

  // Interrupt AI immediately (Xiaozhi Abort / Barge-in)
  const interruptAi = useCallback(() => {
    if (activeGenerationRef.current) ignoredGenerationsRef.current.add(activeGenerationRef.current);
    if (playerRef.current) {
      playerRef.current.stop();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      browserTtsPendingCountRef.current = 0;
    }
    setIsAudioPlaying(false);
    serverHasFinishedTurnRef.current = false;
    if (pendingCompletionRef.current) {
      setIsCompleted(true);
      setAiState("completed");
      return;
    }

    // Send abort to backend to cancel LLM / TTS pipeline
    sendMessage({ type: "abort" });
    aiStateRef.current = "thinking";
    setAiState("thinking");
  }, [sendMessage]);


  // Re-roll current situational question
  const rerollQuestion = useCallback(() => {
    if (!sendMessage({ type: "reroll_question" })) return;
    if (playerRef.current) playerRef.current.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      browserTtsPendingCountRef.current = 0;
    }
    serverHasFinishedTurnRef.current = false;
    submissionPendingRef.current = true;
    setAiState("thinking");
  }, [sendMessage]);

  // Manual Stage Advance
  const skipToNextStage = useCallback(() => {
    if (!sendMessage({ type: "next_stage" })) return;
    if (playerRef.current) playerRef.current.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      browserTtsPendingCountRef.current = 0;
    }
    serverHasFinishedTurnRef.current = false;
    submissionPendingRef.current = true;
    setAiState("thinking");
  }, [sendMessage]);

  // Stage Transition confirmation
  const confirmStageTransition = useCallback(() => {
    if (!sendMessage({ type: "stage_transition_confirm" })) return;
    setPendingTransition(null);
    if (playerRef.current) playerRef.current.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      browserTtsPendingCountRef.current = 0;
    }
    serverHasFinishedTurnRef.current = false;
    submissionPendingRef.current = true;
    setAiState("thinking");
  }, [sendMessage]);

  // Stage Transition deferral (user wants to say more)
  const deferStageTransition = useCallback((continueMessage?: string) => {
    sendMessage({ type: "stage_transition_defer", continue_message: continueMessage });
    setPendingTransition(null);
    setAiState("listening");
  }, [sendMessage]);

  // Request Hint in Guided Mode
  const requestHint = useCallback(() => {
    setIsRequestingHint(true);
    sendMessage({ type: "request_hint", question_id: currentIntent?.question_id });
  }, [sendMessage, currentIntent?.question_id]);

  // Clear Hint
  const clearHint = useCallback(() => {
    setCurrentHint(null);
  }, []);

  // Change Mock Mode
  const changeMockMode = useCallback((newMode: "strict" | "guided") => {
    setMockModeState(newMode);
    optionsRef.current.mockMode = newMode;
    sendMessage({ type: "config", mock_mode: newMode });
  }, [sendMessage]);

  // End Session Early
  const endSessionEarly = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (playerRef.current) playerRef.current.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      browserTtsPendingCountRef.current = 0;
    }
    sendMessage({ type: "stop_session" });
    setIsCompleted(true);
    setAiState("completed");
  }, [sendMessage]);

  // Send Typed Text Message
  const sendTextMessage = useCallback(
    (text: string, durationSeconds = 0, audioUrl?: string | null) => {
      const clean = text.trim();
      if (!clean || isCompletedRef.current || aiStateRef.current !== "listening" || wsRef.current?.readyState !== WebSocket.OPEN) return false;
      if (!sendMessage({ type: "final_transcript", text: clean, duration_seconds: durationSeconds })) return false;
      submissionPendingRef.current = true;

      if (playerRef.current) playerRef.current.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        browserTtsPendingCountRef.current = 0;
      }
      serverHasFinishedTurnRef.current = false;
      aiStateRef.current = "thinking";
      setAiState("thinking");

      setTurns((prev) => {
        const curTurnNum = turnIdRef.current;
        const existingIdx = prev.findIndex(
          (t) => t.speaker === "user" && t.turnNumber === curTurnNum
        );
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], text: clean };
          return updated;
        }
        return [
          ...prev,
          {
            id: `turn-u-${curTurnNum}-${Date.now()}`,
            turnNumber: curTurnNum,
            speaker: "user",
            text: clean,
            durationSeconds,
            audioUrl: audioUrl || null,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });

      return true;
    },
    [sendMessage]
  );

  // Change active TTS voice dynamically
  const changeVoice = useCallback(
    (newVoice: string) => {
      setActiveVoice(newVoice);
      optionsRef.current.voice = newVoice;
      sendMessage({ type: "config", voice: newVoice });
    },
    [sendMessage]
  );

  // Change voice pitch dynamically (+/-Hz)
  const changePitch = useCallback(
    (newPitch: string | number) => {
      let formatted = "+0Hz";
      if (typeof newPitch === "number") {
        formatted = newPitch >= 0 ? `+${newPitch}Hz` : `${newPitch}Hz`;
      } else if (typeof newPitch === "string") {
        const clean = newPitch.trim();
        const num = parseInt(clean, 10);
        if (!isNaN(num)) {
          formatted = num >= 0 ? `+${num}Hz` : `${num}Hz`;
        }
      }
      setActivePitch(formatted);
      if (optionsRef.current) {
        optionsRef.current.pitch = formatted;
      }
      sendMessage({ type: "config", pitch: formatted });
    },
    [sendMessage]
  );


  // Update audio URL for turns (e.g. after candidate audio upload)
  const updateTurnAudioUrl = useCallback(
    (speaker: "ai" | "user", targetTurnNumber: number, url: string) => {
      setTurns((prev) =>
        prev.map((t) =>
          t.speaker === speaker && t.turnNumber === targetTurnNumber
            ? { ...t, audioUrl: url }
            : t
        )
      );
    },
    []
  );

  // Toggle Barge-in
  const toggleBargeIn = useCallback(() => {
    setBargeInEnabled((prev) => {
      const next = !prev;
      sendMessage({ type: "config", barge_in_enabled: next });
      return next;
    });
  }, [sendMessage]);

  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = process.env.NEXT_PUBLIC_API_PORT || "8000";
    return `${protocol}//${host}:${port}/api/v1/voice/ws/${sessionId}`;
  }, [sessionId]);

  // Main WebSocket Lifecycle
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || !enabled) return;

    isManuallyClosedRef.current = false;

    const cleanupSocket = (socket: WebSocket | null) => {
      if (!socket) return;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close(1000, "Clean cleanup");
        }
      } catch {}
    };

    const connectWebSocket = () => {
      if (isManuallyClosedRef.current || isCompleted) return;

      // Safely close and detach listeners from any previous socket
      cleanupSocket(wsRef.current);

      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        ignoredGenerationsRef.current.clear();
        activeGenerationRef.current = null;
        submissionPendingRef.current = false;
        pendingCompletionRef.current = false;
        serverHasFinishedTurnRef.current = false;
        fullAiTextAccumulatorRef.current = "";
        subtitlesRef.current.clear();
        setAiState("idle");
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptRef.current = 0;
        setError(null);

        const currentOpts = optionsRef.current;
        ws.send(
          JSON.stringify({
            type: "client_ready",
            role_name: currentOpts.roleName,
            level: currentOpts.level,
            language: currentOpts.language,
            voice: currentOpts.voice,
            pitch: currentOpts.pitch || activePitch,
            barge_in_enabled: currentOpts.bargeInEnabled,
            selected_stages: currentOpts.selectedStages,
            questions_per_stage: currentOpts.questionsPerStage,
            persona_name: currentOpts.personaName,
            company_name: currentOpts.companyName,
            mock_mode: currentOpts.mockMode,
            total_duration_minutes: currentOpts.totalDurationMinutes,
            selected_question_ids: currentOpts.selectedQuestionIds,
          })
        );

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN && wsRef.current === ws) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        try {
          const data = JSON.parse(event.data);
          const type = data.type;
          const generation = data.generation_id as string | undefined;
          if (generation && ignoredGenerationsRef.current.has(generation) && type !== "interrupted" && !(type === "state" && data.state === "LISTEN")) return;
          if (generation && type !== "interrupted") activeGenerationRef.current = generation;

          if (type === "state") {
            const rawState = data.state;
            if (rawState === "LISTEN") {
              serverHasFinishedTurnRef.current = true;
              if (!submissionPendingRef.current && !playerRef.current?.isPlaying()) {
                setAiState("listening");
              }
            } else if (rawState === "THINK") {
              serverHasFinishedTurnRef.current = false;
              subtitlesRef.current.clear();
              playerRef.current?.setExpectingMoreAudio(true);
              setAiState("thinking");
            } else if (rawState === "SPEAK") {
              submissionPendingRef.current = false;
              setAiState("speaking");
            } else if (rawState === "COMPLETED") {
              pendingCompletionRef.current = true;
              if (!playerRef.current?.isPlaying()) {
                setAiState("completed");
                setIsCompleted(true);
              }
            }

            if (data.turn_id) setTurnId(data.turn_id);
            if (data.current_stage) setCurrentStage(data.current_stage);
            if (data.stages) setStagesList(data.stages);
            if (data.turn_in_stage) setTurnInStage(data.turn_in_stage);
            if (data.target_turns_in_stage) setTargetTurnsInStage(data.target_turns_in_stage);
          } else if (type === "conversation_history") {
            if (Array.isArray(data.turns) && data.turns.length > 0) {
              setTurns((prev) => {
                const merged = [...prev];
                for (const item of data.turns) {
                  const existingIdx = merged.findIndex(
                    (t) => t.speaker === item.speaker && t.turnNumber === item.turnNumber
                  );
                  if (existingIdx !== -1) {
                    merged[existingIdx] = {
                      ...merged[existingIdx],
                      text: item.text,
                    };
                  } else {
                    merged.push({
                      id: item.id || `turn-${item.speaker}-${item.turnNumber}`,
                      turnNumber: item.turnNumber,
                      speaker: item.speaker,
                      text: item.text,
                      durationSeconds: item.durationSeconds || item.duration_seconds,
                      audioUrl: item.audioUrl || item.audio_url || null,
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    });
                  }
                }
                return merged;
              });
            }
          } else if (type === "question_context" || type === "question_rerolled") {
            setCurrentIntent({
              question_id: data.question_id,
              intent: data.topic_label || data.intent || "",
              stage_key: data.stage_key || "",
              difficulty: data.difficulty || 3,
              topic_label: data.topic_label || "",
            });
          } else if (type === "voice_configured") {
            if (data.voice) setActiveVoice(data.voice);
          } else if (type === "pitch_configured") {
            if (data.pitch) setActivePitch(data.pitch);
          } else if (type === "stage_info" || type === "stage_change") {
            setPendingTransition(null);
            if (data.current_stage) setCurrentStage(data.current_stage);
            if (data.stages) setStagesList(data.stages);
            if (data.turn_in_stage) setTurnInStage(data.turn_in_stage);
            if (data.target_turns_in_stage) setTargetTurnsInStage(data.target_turns_in_stage);
            if (data.stage_max_seconds) setStageMaxSeconds(data.stage_max_seconds);
            if (data.stage_elapsed_seconds !== undefined) setStageElapsedSeconds(data.stage_elapsed_seconds);
            if (data.mock_mode) setMockModeState(data.mock_mode);
          } else if (type === "stage_transition_proposed") {
            setPendingTransition({
              currentStage: data.current_stage || "",
              nextStage: data.next_stage || "",
              stageIndex: data.stage_index || 1,
              totalStages: data.total_stages || 3,
              stageName: data.stage_name || "",
              turnId: data.turn_id || 1,
              elapsedSeconds: data.elapsed_seconds || 0,
              stageMaxSeconds: data.stage_max_seconds || 600,
              summaryMessage: data.summary_message || "",
            });
          } else if (type === "stage_transition_deferred") {
            setPendingTransition(null);
          } else if (type === "hint_response") {
            setCurrentHint(data.hint_text || "");
            setIsRequestingHint(false);
          } else if (type === "ai_token") {
            fullAiTextAccumulatorRef.current += data.token;
            setCurrentQuestion(fullAiTextAccumulatorRef.current);
          } else if (type === "subtitle") {
            subtitlesRef.current.set(data.sentence_index, data.sentence || "");
            if (ttsEngineRef.current === "browser" && data.sentence) {
              speakWithBrowserTTS(data.sentence);
            }
          } else if (type === "audio") {
            if (ttsEngineRef.current === "browser") {
              // Bo qua am thanh tu backend khi nguoi dung chon Browser Web Speech API
              return;
            }
            setAiState("speaking");
            if (data.audio_data && playerRef.current) {
              setAudioBlockedByAutoplay(playerRef.current.getAudioContext().state === "suspended");
              const subtitle = subtitlesRef.current.get(data.sentence_index) || "";
              void playerRef.current.enqueueBase64(data.audio_data, () => setCurrentSubtitle(subtitle));
              subtitlesRef.current.delete(data.sentence_index);
            }
          } else if (type === "interrupted") {
            if (generation) ignoredGenerationsRef.current.add(generation);
            if (playerRef.current) playerRef.current.stop();
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              browserTtsPendingCountRef.current = 0;
            }
            serverHasFinishedTurnRef.current = false;
            if (!submissionPendingRef.current) setAiState("listening");
            fullAiTextAccumulatorRef.current = "";
            setCurrentQuestion("");
          } else if (type === "done") {
            submissionPendingRef.current = false;
            serverHasFinishedTurnRef.current = true;
            playerRef.current?.setExpectingMoreAudio(false);
            if (ttsEngineRef.current === "browser" && browserTtsPendingCountRef.current === 0) {
              setIsAudioPlaying(false);
              setAiState("listening");
            }
            const aiResponse = (data.full_text || fullAiTextAccumulatorRef.current || "").trim();
            if (aiResponse) {
              const targetTurnNum = data.turn_id || turnIdRef.current;
              const aiAudioUrl = data.audio_url || `/api/v1/voice/audio/${sessionId}/turn_${targetTurnNum}_ai.mp3`;
              setTurns((prev) => {
                const existingIdx = prev.findIndex(
                  (t) => t.speaker === "ai" && t.turnNumber === targetTurnNum
                );
                if (existingIdx !== -1) {
                  const updated = [...prev];
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    text: aiResponse,
                    audioUrl: aiAudioUrl,
                  };
                  return updated;
                }
                return [
                  ...prev,
                  {
                    id: `turn-ai-${targetTurnNum}-${Date.now()}`,
                    turnNumber: targetTurnNum,
                    speaker: "ai",
                    text: aiResponse,
                    audioUrl: aiAudioUrl,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ];
              });
            }
            fullAiTextAccumulatorRef.current = "";
            setCurrentQuestion("");

            if (data.is_completed) {
              pendingCompletionRef.current = true;
              if (!playerRef.current?.isPlaying()) {
                setIsCompleted(true);
                setAiState("completed");
              }
            } else if (!playerRef.current?.isPlaying()) {
              playbackReadyTimerRef.current = setTimeout(() => {
                if (serverHasFinishedTurnRef.current && !isCompletedRef.current && !playerRef.current?.isPlaying()) {
                  setAiState("listening");
                }
              }, 400);
            }
          } else if (type === "error") {
            if (data.full_text) setCurrentQuestion(data.full_text);
            submissionPendingRef.current = false;
            playerRef.current?.setExpectingMoreAudio(false);
            serverHasFinishedTurnRef.current = true;
            if (!playerRef.current?.isPlaying()) setAiState("listening");
            setError(data.message || "Đã xảy ra lỗi trong phiên phỏng vấn.");
          }
        } catch (e) {
          console.error("WS Parse error:", e);
        }
      };

      ws.onerror = (e) => {
        if (wsRef.current !== ws) return;
        console.warn("WebSocket error occurred:", e);
      };

      ws.onclose = (event) => {
        if (wsRef.current !== ws) return;
        setIsConnected(false);
        submissionPendingRef.current = false;
        playerRef.current?.stop();
        setIsAudioPlaying(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        if (event.code === 1000 || isManuallyClosedRef.current || isCompleted) {
          return;
        }

        if (reconnectAttemptRef.current < 5) {
          setIsReconnecting(true);
          reconnectAttemptRef.current += 1;
          setReconnectCount(reconnectAttemptRef.current);
          const backoff = Math.min(1000 * Math.pow(1.5, reconnectAttemptRef.current), 5000);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, backoff);
        } else {
          setIsReconnecting(false);
          setError("Không thể kết nối đến máy chủ phỏng vấn sau nhiều lần thử. Vui lòng tải lại trang.");
        }
      };
    };

    connectWebSocket();

    return () => {
      isManuallyClosedRef.current = true;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (playbackReadyTimerRef.current) clearTimeout(playbackReadyTimerRef.current);
      if (playerRef.current) playerRef.current.stop();
      cleanupSocket(wsRef.current);
      wsRef.current = null;
    };
  }, [sessionId, enabled, getWsUrl, isCompleted]);

  return {
    isConnected,
    isReconnecting,
    reconnectCount,
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
    turns,
    isAudioPlaying,
    isAudioMuted,
    audioBlockedByAutoplay,
    bargeInEnabled,
    toggleBargeIn,
    toggleAudioMute,
    resumeAudio,
    interruptAi,
    sendTextMessage,
    currentIntent,
    rerollQuestion,
    skipToNextStage,
    endSessionEarly,
    activeVoice,
    changeVoice,
    activePitch,
    changePitch,
    updateTurnAudioUrl,
    // 3-Stage Transition & Adaptive Controls
    pendingTransition,
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
    ttsEngine,
    setTtsEngine,
    selectedBrowserVoice,
    setSelectedBrowserVoice,
  };
}
