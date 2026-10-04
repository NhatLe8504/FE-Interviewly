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

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isManuallyClosedRef = useRef(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio queue for streaming chunks
  const audioQueueRef = useRef<{ url: string; sentenceIdx?: number }[]>([]);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAudioRef = useRef<boolean>(false);
  const isAudioMutedRef = useRef<boolean>(isAudioMuted);
  isAudioMutedRef.current = isAudioMuted;

  const fullAiTextAccumulatorRef = useRef<string>("");
  const questionsPerStage = useMemo(
    () =>
      Object.fromEntries(
        (stageConfigs?.length
          ? stageConfigs
          : selectedStages.map((stageKey) => ({
              stage_key: stageKey,
              max_turns: stageKey === "technical" ? 2 : 1,
            })))
          .map((stageConfig) => [stageConfig.stage_key, stageConfig.max_turns])
      ),
    [selectedStages, stageConfigs]
  );

  // Construct WebSocket URL with secure wss: check
  const getWsUrl = useCallback(() => {
    let host = "localhost:8000";
    if (typeof window !== "undefined") {
      const isHttps = window.location.protocol === "https:";
      const proto = isHttps ? "wss:" : "ws:";
      const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (envUrl) {
        try {
          const parsed = new URL(envUrl);
          host = parsed.host;
        } catch {
          host = `${window.location.hostname}:8000`;
        }
      } else {
        host = `${window.location.hostname}:8000`;
      }
      return `${proto}//${host}/api/v1/voice/ws/${sessionId}`;
    }
    return `ws://localhost:8000/api/v1/voice/ws/${sessionId}`;
  }, [sessionId]);

  // Overall session clock
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

  // Stop current audio and clear queue immediately (Barge-in / interruption helper)
  const stopAudioPlayback = useCallback(() => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.onended = null;
      currentAudioElementRef.current.onerror = null;
      try {
        currentAudioElementRef.current.pause();
        currentAudioElementRef.current.currentTime = 0;
      } catch {}
      currentAudioElementRef.current = null;
    }
    // Revoke queued blob URLs to free memory
    while (audioQueueRef.current.length > 0) {
      const item = audioQueueRef.current.shift();
      if (item?.url) {
        try {
          URL.revokeObjectURL(item.url);
        } catch {}
      }
    }
    isPlayingAudioRef.current = false;
    setIsAudioPlaying(false);
  }, []);

  // Play next audio chunk from queue
  const playNextChunk = useCallback(() => {
    if (isPlayingAudioRef.current) return;
    if (audioQueueRef.current.length === 0) {
      setIsAudioPlaying(false);
      return;
    }

    const nextItem = audioQueueRef.current.shift();
    if (!nextItem) return;

    isPlayingAudioRef.current = true;
    setIsAudioPlaying(true);

    const audio = new Audio(nextItem.url);
    if (isAudioMutedRef.current) {
      audio.muted = true;
    }
    currentAudioElementRef.current = audio;

    const cleanup = () => {
      try {
        URL.revokeObjectURL(nextItem.url);
      } catch {}
      audio.onended = null;
      audio.onerror = null;
      currentAudioElementRef.current = null;
      isPlayingAudioRef.current = false;
    };

    audio.onended = () => {
      cleanup();
      playNextChunk();
    };

    audio.onerror = (e) => {
      cleanup();
      playNextChunk();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name === "NotAllowedError") {
          setAudioBlockedByAutoplay(true);
        }
        cleanup();
        setTimeout(playNextChunk, 150);
      });
    }
  }, []);

  // Enqueue base64 audio data
  const enqueueAudioChunk = useCallback(
    (base64Data: string, sentenceIdx?: number) => {
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        audioQueueRef.current.push({ url, sentenceIdx });
        playNextChunk();
      } catch (err) {
        console.error("Audio decode error:", err);
      }
    },
    [playNextChunk]
  );

  // Resume audio playback if blocked by browser autoplay policy
  const resumeAudio = useCallback(() => {
    setAudioBlockedByAutoplay(false);
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    if (!isPlayingAudioRef.current && audioQueueRef.current.length > 0) {
      playNextChunk();
    }
  }, [playNextChunk]);

  // Toggle speaker mute
  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.muted = next;
      }
      return next;
    });
  }, []);

  // Send message helper
  const sendMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // Re-roll current situational question
  const rerollQuestion = useCallback(() => {
    stopAudioPlayback();
    sendMessage({ type: "reroll_question" });
  }, [sendMessage, stopAudioPlayback]);

  // Manual Stage Advance
  const skipToNextStage = useCallback(() => {
    stopAudioPlayback();
    sendMessage({ type: "next_stage" });
  }, [sendMessage, stopAudioPlayback]);

  // End Session Early
  const endSessionEarly = useCallback(() => {
    isManuallyClosedRef.current = true;
    stopAudioPlayback();
    sendMessage({ type: "stop_session" });
    setIsCompleted(true);
    setAiState("completed");
  }, [sendMessage, stopAudioPlayback]);

  // Send Text Message
  const sendTextMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      stopAudioPlayback();
      setCandidateTranscript(clean);
      setInterimTranscript("");

      setTurns((prev) => [
        ...prev,
        {
          id: `turn-u-${Date.now()}`,
          turnNumber: turnId,
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
    [sendMessage, stopAudioPlayback, turnId]
  );

  // Toggle Barge-in
  const toggleBargeIn = useCallback(() => {
    setBargeInEnabled((prev) => {
      const next = !prev;
      sendMessage({ type: "config", barge_in_enabled: next });
      return next;
    });
  }, [sendMessage]);

  // Initialize Speech Recognition (STT)
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

        // BARGE-IN TRIGGER:
        // When user speaks something substantial, interrupt AI speech immediately!
        if (bargeInEnabled && interim.trim().length >= 3) {
          if (aiState === "speaking" || aiState === "thinking") {
            stopAudioPlayback();
            sendMessage({ type: "user_speech_start" });
            sendMessage({ type: "interim_transcript", text: interim });
          }
        }
      }

      if (final) {
        const cleanFinal = final.trim();
        if (cleanFinal) {
          setCandidateTranscript(cleanFinal);
          setInterimTranscript("");

          setTurns((prev) => [
            ...prev,
            {
              id: `turn-u-${Date.now()}`,
              turnNumber: turnId,
              speaker: "user",
              text: cleanFinal,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);

          sendMessage({
            type: "final_transcript",
            text: cleanFinal,
            duration_seconds: 5,
          });
        }
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
      if (isMicActive && !isCompleted && !isManuallyClosedRef.current && !micPermissionDenied) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {}
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    if (isMicActive && !isCompleted && !micPermissionDenied) {
      try {
        recognition.start();
      } catch {}
    }

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [language, bargeInEnabled, aiState, isMicActive, isCompleted, micPermissionDenied, sendMessage, stopAudioPlayback, turnId]);

  // Audio Analyser for Waveform
  useEffect(() => {
    if (typeof window === "undefined" || !isMicActive || isCompleted || micPermissionDenied) return;

    let localStream: MediaStream | null = null;
    let localContext: AudioContext | null = null;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        localStream = stream;
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        localContext = new AudioCtx();
        audioContextRef.current = localContext;

        const source = localContext.createMediaStreamSource(stream);
        const analyser = localContext.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLoop = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLoop);
        };
        animFrameRef.current = requestAnimationFrame(updateLoop);
      })
      .catch((err) => {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setMicPermissionDenied(true);
          setIsMicActive(false);
        }
      });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (localContext) {
        localContext.close().catch(() => {});
      }
    };
  }, [isMicActive, isCompleted, micPermissionDenied]);

  // Store mutable options in a ref to avoid reconnecting on every render
  const optionsRef = useRef({
    roleName,
    level,
    language,
    voice,
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
  });
  optionsRef.current = {
    roleName,
    level,
    language,
    voice,
    bargeInEnabled,
    selectedStages,
    questionsPerStage,
  };

  // WebSocket Connection with Reconnection Resilience
  useEffect(() => {
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
        // Send ready payload
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
            if (rawState === "LISTEN") setAiState("listening");
            else if (rawState === "THINK") setAiState("thinking");
            else if (rawState === "SPEAK") setAiState("speaking");
            else if (rawState === "COMPLETED") {
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
            if (data.audio_data) {
              enqueueAudioChunk(data.audio_data, data.sentence_index);
            }
          } else if (type === "interrupted") {
            stopAudioPlayback();
            setAiState("listening");
            fullAiTextAccumulatorRef.current = "";
          } else if (type === "done") {
            const aiResponse = data.full_text || fullAiTextAccumulatorRef.current;
            if (aiResponse.trim()) {
              setTurns((prev) => [
                ...prev,
                {
                  id: `turn-ai-${Date.now()}`,
                  turnNumber: data.turn_id || turnId,
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

        // If closed cleanly with code 1000 or manually closed or completed, don't reconnect
        if (event.code === 1000 || isManuallyClosedRef.current || isCompleted) {
          return;
        }

        // Auto-reconnect if not intentionally closed and session still active
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
      stopAudioPlayback();
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [sessionId, getWsUrl]);

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
    sendTextMessage,
    currentIntent,
    rerollQuestion,
    skipToNextStage,
    endSessionEarly,
  };
}