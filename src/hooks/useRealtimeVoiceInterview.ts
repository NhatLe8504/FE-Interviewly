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
}

export interface UseRealtimeVoiceInterviewOptions {
  sessionId: string;
  roleName?: string;
  level?: string;
  language?: string;
  voice?: string;
  selectedStages?: string[];
  stageConfigs?: StageConfigIn[];
  selectedQuestionIds?: number[];
  bargeInInitial?: boolean;
}

// Silence duration threshold in milliseconds to detect end of candidate speech (Xiaozhi VAD model)
const VAD_SILENCE_THRESHOLD_MS = 1500;

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
    return this.ctx.currentTime < this.scheduledEndTime || this.activeSources.length > 0 || this.isExpectingMoreAudio;
  }

  public setExpectingMoreAudio(expecting: boolean) {
    this.isExpectingMoreAudio = expecting;
    if (expecting) {
      this.startEndCheck();
    }
  }

  public async enqueueBase64(base64Data: string): Promise<void> {
    this.isExpectingMoreAudio = true;
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

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(this.scheduledEndTime, currentTime);
      source.start(startTime);
      this.scheduledEndTime = startTime + audioBuffer.duration;
      this.activeSources.push(source);

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
      if (this.isExpectingMoreAudio) {
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
  sessionId,
  roleName = "Software Engineer",
  level = "Senior",
  language = "vi",
  voice = "vi-VN-HoaiMyNeural",
  selectedStages = ["warmup", "technical", "closing"],
  stageConfigs,
  selectedQuestionIds,
  bargeInInitial = true,
}: UseRealtimeVoiceInterviewOptions) {
  // Connection & Lifecycle State
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [aiState, setAiState] = useState<AiVoiceState>("idle");
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

  // Realtime Subtitles & Tokens
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [candidateTranscript, setCandidateTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);

  // Audio, Mic & Barge-in Controls
  const [bargeInEnabled, setBargeInEnabled] = useState(bargeInInitial);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioBlockedByAutoplay, setAudioBlockedByAutoplay] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [volume, setVolume] = useState(0);

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
  const speechAccumulatorRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const serverHasFinishedTurnRef = useRef<boolean>(false);

  // Audio subsystem references
  const playerRef = useRef<StreamingAudioPlayer | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastPlaybackEndedAtRef = useRef<number>(0);
  const lastAiSpokenTextRef = useRef<string>("");
  const isAudioPlayingRef = useRef<boolean>(false);

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
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
    selectedQuestionIds,
  });

  useEffect(() => {
    optionsRef.current = {
      roleName,
      level,
      language,
      voice,
      bargeInEnabled,
      selectedStages,
      questionsPerStage,
      selectedQuestionIds,
    };
  }, [
    roleName,
    level,
    language,
    voice,
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
    selectedQuestionIds,
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
    }
  }, []);

  // Initialize StreamingAudioPlayer
  useEffect(() => {
    if (typeof window === "undefined") return;

    playerRef.current = new StreamingAudioPlayer(
      () => {
        // Physical audio playback has completely finished on speakers!
        lastPlaybackEndedAtRef.current = Date.now();
        if (serverHasFinishedTurnRef.current && !isCompletedRef.current) {
          setTimeout(() => {
            if (serverHasFinishedTurnRef.current && !isCompletedRef.current && aiStateRef.current !== "speaking") {
              setAiState("listening");
              speechAccumulatorRef.current = "";
              setInterimTranscript("");
              if (isMicActive) {
                try {
                  recognitionRef.current?.start();
                } catch {}
              }
            }
          }, 600);
        }
      },
      (playing) => {
        setIsAudioPlaying(playing);
        isAudioPlayingRef.current = playing;
        if (playing) {
          setAiState("speaking");
          try {
            recognitionRef.current?.abort();
          } catch {}
        }
      }
    );

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  // Resume audio playback if blocked by browser autoplay policy
  const resumeAudio = useCallback(() => {
    setAudioBlockedByAutoplay(false);
    if (playerRef.current) {
      playerRef.current.getAudioContext().resume().catch(() => {});
    }
  }, []);

  // Toggle speaker mute
  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      playerRef.current?.setMuted(next);
      return next;
    });
  }, []);

  // Interrupt AI immediately (Xiaozhi Abort / Barge-in)
  const interruptAi = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setIsAudioPlaying(false);
    serverHasFinishedTurnRef.current = false;

    // Send abort to backend to cancel LLM / TTS pipeline
    sendMessage({ type: "abort" });
    sendMessage({ type: "user_speech_start" });

    setAiState("listening");
    speechAccumulatorRef.current = "";
    setInterimTranscript("");
  }, [sendMessage]);

  // Commit Candidate Answer (Auto-VAD or manual submit)
  const commitCandidateAnswer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const finalAnswer = (speechAccumulatorRef.current || interimTranscript).trim();
    if (finalAnswer.length < 3) return;

    const lastAi = (lastAiSpokenTextRef.current || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
    const cand = finalAnswer.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
    if (cand && lastAi && lastAi.includes(cand) && cand.length < 60) {
      console.warn("[Echo Suppression] Suppressed auto-commit of echoed AI question:", finalAnswer);
      speechAccumulatorRef.current = "";
      setInterimTranscript("");
      return;
    }

    setCandidateTranscript(finalAnswer);
    setInterimTranscript("");
    speechAccumulatorRef.current = "";

    setTurns((prev) => [
      ...prev,
      {
        id: `turn-u-${Date.now()}`,
        turnNumber: turnIdRef.current,
        speaker: "user",
        text: finalAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Transition to THINKING while AI processes answer
    serverHasFinishedTurnRef.current = false;
    setAiState("thinking");

    sendMessage({
      type: "final_transcript",
      text: finalAnswer,
      duration_seconds: 5,
    });
  }, [interimTranscript, sendMessage]);

  // Re-roll current situational question
  const rerollQuestion = useCallback(() => {
    if (playerRef.current) playerRef.current.stop();
    serverHasFinishedTurnRef.current = false;
    sendMessage({ type: "reroll_question" });
  }, [sendMessage]);

  // Manual Stage Advance
  const skipToNextStage = useCallback(() => {
    if (playerRef.current) playerRef.current.stop();
    serverHasFinishedTurnRef.current = false;
    sendMessage({ type: "next_stage" });
  }, [sendMessage]);

  // End Session Early
  const endSessionEarly = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (playerRef.current) playerRef.current.stop();
    sendMessage({ type: "stop_session" });
    setIsCompleted(true);
    setAiState("completed");
  }, [sendMessage]);

  // Send Typed Text Message
  const sendTextMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      speechAccumulatorRef.current = "";

      if (playerRef.current) playerRef.current.stop();
      serverHasFinishedTurnRef.current = false;
      setCandidateTranscript(clean);
      setInterimTranscript("");
      setAiState("thinking");

      setTurns((prev) => [
        ...prev,
        {
          id: `turn-u-${Date.now()}`,
          turnNumber: turnIdRef.current,
          speaker: "user",
          text: clean,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      sendMessage({
        type: "final_transcript",
        text: clean,
        duration_seconds: 5,
      });
    },
    [sendMessage]
  );

  // Toggle Barge-in
  const toggleBargeIn = useCallback(() => {
    setBargeInEnabled((prev) => {
      const next = !prev;
      sendMessage({ type: "config", barge_in_enabled: next });
      return next;
    });
  }, [sendMessage]);

  // Initialize Speech Recognition (STT) with Xiaozhi VAD & Acoustic Echo Suppression
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language.startsWith("en") ? "en-US" : "vi-VN";

    recognition.onresult = (event: any) => {
      if (!isMicActive || isCompletedRef.current) return;

      const now = Date.now();
      const inEchoCooldown = now - lastPlaybackEndedAtRef.current < 800;
      const isAiSpeaking =
        aiStateRef.current !== "listening" ||
        isAudioPlayingRef.current ||
        inEchoCooldown ||
        Boolean(playerRef.current && playerRef.current.isPlaying());

      if (isAiSpeaking) {
        return;
      }

      if (aiStateRef.current !== "listening") {
        return;
      }

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0].transcript;
        if (item.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        const cleanFinal = final.trim();
        if (cleanFinal) {
          const lastAi = (lastAiSpokenTextRef.current || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
          const cand = cleanFinal.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
          if (cand && lastAi && lastAi.includes(cand) && cand.length >= 4) {
            console.warn("[Echo Suppression] Ignored speaker echo substring:", cleanFinal);
            return;
          }
          speechAccumulatorRef.current = speechAccumulatorRef.current
            ? `${speechAccumulatorRef.current} ${cleanFinal}`
            : cleanFinal;
          setCandidateTranscript(speechAccumulatorRef.current);
          setInterimTranscript("");
        }
      }

      const currentSpeech = (speechAccumulatorRef.current + " " + interim).trim();

      // Whenever candidate is actively speaking, reset the silence countdown
      if (currentSpeech.length > 0) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // When candidate stays quiet for VAD_SILENCE_THRESHOLD_MS (1.5s), finalize their answer!
        silenceTimerRef.current = setTimeout(() => {
          commitCandidateAnswer();
        }, VAD_SILENCE_THRESHOLD_MS);
      }
    };

    recognition.onerror = (err: any) => {
      if (err.error === "no-speech") {
        return;
      }
      if (err.error === "not-allowed" || err.error === "service-not-allowed") {
        setMicPermissionDenied(true);
        setIsMicActive(false);
        setError("Quyền truy cập micro đã bị từ chối. Bạn có thể sử dụng chế độ nhập văn bản.");
        return;
      }
      console.warn("Speech recognition notice:", err.error);
    };

    recognition.onend = () => {
      if (
        aiStateRef.current === "listening" &&
        isMicActive &&
        !isCompletedRef.current &&
        !isManuallyClosedRef.current &&
        !micPermissionDenied
      ) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    try {
      if (isMicActive) {
        recognition.start();
      }
    } catch {}

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [language, isMicActive, micPermissionDenied, commitCandidateAnswer]);

  // Audio Waveform Analyser (Mic volume during listening, AI volume during speaking)
  useEffect(() => {
    if (typeof window === "undefined" || !isMicActive) return;

    let localStream: MediaStream | null = null;
    let localContext: AudioContext | null = null;

    navigator.mediaDevices
      ?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((stream) => {
        localStream = stream;
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        localContext = new AudioCtx();

        const source = localContext.createMediaStreamSource(stream);
        const analyser = localContext.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        micAnalyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          // If AI is speaking, read volume from the AI audio player analyser
          const activeAnalyser =
            aiStateRef.current === "speaking" && playerRef.current
              ? playerRef.current.getAnalyser() || micAnalyserRef.current
              : micAnalyserRef.current;

          if (activeAnalyser) {
            activeAnalyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const norm = Math.min(1, avg / 80);
            setVolume(norm);
          }
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      })
      .catch((err) => {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setMicPermissionDenied(true);
          setIsMicActive(false);
          setError("Microphone bị từ chối. Hãy cho phép truy cập micro để trải nghiệm đàm thoại.");
        }
      });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (localContext && localContext.state !== "closed") {
        localContext.close().catch(() => {});
      }
      micAnalyserRef.current = null;
    };
  }, [isMicActive]);

  // Construct WebSocket connection URL
  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = process.env.NEXT_PUBLIC_API_PORT || "8000";
    return `${protocol}//${host}:${port}/api/v1/voice/ws/${sessionId}`;
  }, [sessionId]);

  // Main WebSocket Lifecycle
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    isManuallyClosedRef.current = false;

    const connectWebSocket = () => {
      if (isManuallyClosedRef.current || isCompleted) return;

      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
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
            barge_in_enabled: currentOpts.bargeInEnabled,
            selected_stages: currentOpts.selectedStages,
            questions_per_stage: currentOpts.questionsPerStage,
          })
        );

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type;

          if (type === "state") {
            const rawState = data.state;
            if (rawState === "LISTEN") {
              serverHasFinishedTurnRef.current = true;
              // Transition to listening only after all audio playback has completely finished on speakers
              if (!playerRef.current?.isPlaying()) {
                setAiState("listening");
                speechAccumulatorRef.current = "";
                setInterimTranscript("");
              }
            } else if (rawState === "THINK") {
              serverHasFinishedTurnRef.current = false;
              setAiState("thinking");
            } else if (rawState === "SPEAK") {
              setAiState("speaking");
            } else if (rawState === "COMPLETED") {
              setAiState("completed");
              setIsCompleted(true);
            }

            if (data.turn_id) setTurnId(data.turn_id);
            if (data.current_stage) setCurrentStage(data.current_stage);
            if (data.stages) setStagesList(data.stages);
            if (data.turn_in_stage) setTurnInStage(data.turn_in_stage);
            if (data.target_turns_in_stage) setTargetTurnsInStage(data.target_turns_in_stage);
          } else if (type === "question_context" || type === "question_rerolled") {
            setCurrentIntent({
              question_id: data.question_id,
              intent: data.topic_label || data.intent || "",
              stage_key: data.stage_key || "",
              difficulty: data.difficulty || 3,
              topic_label: data.topic_label || "",
            });
          } else if (type === "stage_info" || type === "stage_change") {
            if (data.current_stage) setCurrentStage(data.current_stage);
            if (data.stages) setStagesList(data.stages);
            if (data.turn_in_stage) setTurnInStage(data.turn_in_stage);
            if (data.target_turns_in_stage) setTargetTurnsInStage(data.target_turns_in_stage);
          } else if (type === "ai_token") {
            fullAiTextAccumulatorRef.current += data.token;
            setCurrentQuestion(fullAiTextAccumulatorRef.current);
          } else if (type === "subtitle") {
            setCurrentSubtitle(data.sentence || "");
          } else if (type === "audio") {
            setAiState("speaking");
            if (data.audio_data && playerRef.current) {
              playerRef.current.enqueueBase64(data.audio_data);
            }
          } else if (type === "interrupted") {
            if (playerRef.current) playerRef.current.stop();
            serverHasFinishedTurnRef.current = false;
            setAiState("listening");
            fullAiTextAccumulatorRef.current = "";
          } else if (type === "done") {
            serverHasFinishedTurnRef.current = true;
            playerRef.current?.setExpectingMoreAudio(false);
            const aiResponse = data.full_text || fullAiTextAccumulatorRef.current;
            lastAiSpokenTextRef.current = aiResponse.trim();
            if (aiResponse.trim()) {
              setTurns((prev) => [
                ...prev,
                {
                  id: `turn-ai-${Date.now()}`,
                  turnNumber: data.turn_id || turnIdRef.current,
                  speaker: "ai",
                  text: aiResponse.trim(),
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
            }
            fullAiTextAccumulatorRef.current = "";

            if (data.is_completed) {
              setIsCompleted(true);
              setAiState("completed");
            } else if (!playerRef.current?.isPlaying()) {
              lastPlaybackEndedAtRef.current = Date.now();
              setTimeout(() => {
                if (serverHasFinishedTurnRef.current && !isCompletedRef.current && aiStateRef.current !== "speaking") {
                  setAiState("listening");
                  speechAccumulatorRef.current = "";
                  setInterimTranscript("");
                  if (isMicActive) {
                    try { recognitionRef.current?.start(); } catch {}
                  }
                }
              }, 600);
            }
          } else if (type === "error") {
            setError(data.message || "Đã xảy ra lỗi trong phiên phỏng vấn.");
          }
        } catch (e) {
          console.error("WS Parse error:", e);
        }
      };

      ws.onerror = (e) => {
        console.warn("WebSocket error occurred:", e);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
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
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (playerRef.current) playerRef.current.stop();
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [sessionId, getWsUrl, isCompleted]);

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
    candidateTranscript,
    interimTranscript,
    turns,
    volume,
    isAudioPlaying,
    isAudioMuted,
    audioBlockedByAutoplay,
    isMicActive,
    micPermissionDenied,
    sttSupported,
    bargeInEnabled,
    toggleBargeIn,
    toggleMic: () => setIsMicActive((prev) => !prev),
    toggleAudioMute,
    resumeAudio,
    interruptAi,
    commitCandidateAnswer,
    sendTextMessage,
    currentIntent,
    rerollQuestion,
    skipToNextStage,
    endSessionEarly,
  };
}
