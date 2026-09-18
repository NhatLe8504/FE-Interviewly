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
  const [isMicActive, setIsMicActive] = useState(true);
  const [volume, setVolume] = useState(0);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Construct WebSocket URL
  const getWsUrl = useCallback(() => {
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    let wsBase = baseUrl.replace(/^http/, "ws");
    if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_BASE_URL) {
      wsBase = `ws://${window.location.hostname}:8000`;
    }
    return `${wsBase}/api/v1/voice/ws/${sessionId}`;
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

  // Stop current audio and clear queue immediately (Barge-in helper)
  const stopAudioPlayback = useCallback(() => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current = null;
    }
    // Revoke queued blob URLs
    while (audioQueueRef.current.length > 0) {
      const item = audioQueueRef.current.shift();
      if (item?.url) {
        try {
          URL.revokeObjectURL(item.url);
        } catch {
          // ignore
        }
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
    currentAudioElementRef.current = audio;

    audio.onended = () => {
      try {
        URL.revokeObjectURL(nextItem.url);
      } catch {
        // ignore
      }
      isPlayingAudioRef.current = false;
      playNextChunk();
    };

    audio.onerror = () => {
      isPlayingAudioRef.current = false;
      playNextChunk();
    };

    audio.play().catch(() => {
      isPlayingAudioRef.current = false;
      playNextChunk();
    });
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
      setError("Trình duyệt không hỗ trợ Web Speech API. Bạn có thể sử dụng chế độ nhập văn bản.");
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
        // When user starts speaking something substantial, immediately interrupt AI if enabled!
        if (bargeInEnabled && interim.trim().length >= 2) {
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

          // Record in conversation history
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
      if (err.error !== "no-speech") {
        console.warn("Speech recognition error:", err.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart recognition if mic is active and session is not completed
      if (isMicActive && !isCompleted) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;

    if (isMicActive && !isCompleted) {
      try {
        recognition.start();
      } catch {
        // ignore
      }
    }

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [language, bargeInEnabled, aiState, isMicActive, isCompleted, sendMessage, stopAudioPlayback, turnId]);

  // Audio Analyser for Waveform
  useEffect(() => {
    if (typeof window === "undefined" || !isMicActive || isCompleted) return;

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
      .catch(() => {
        // Mic permission denied or unavailable
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
  }, [isMicActive, isCompleted]);

  // Connect WebSocket on mount
  useEffect(() => {
    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);

      // Send initial ready configuration with selected stages
      ws.send(
        JSON.stringify({
          type: "client_ready",
          role_name: roleName,
          level,
          language,
          voice,
          barge_in_enabled: bargeInEnabled,
          selected_stages: selectedStages,
          questions_per_stage: questionsPerStage,
        })
      );

      // Heartbeat ping every 15s
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

    ws.onerror = () => {
      setError("Không thể kết nối đến máy chủ WebSocket Voice. Vui lòng kiểm tra lại dịch vụ Backend.");
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      stopAudioPlayback();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [getWsUrl, roleName, level, language, voice, bargeInEnabled, selectedStages, questionsPerStage, enqueueAudioChunk, stopAudioPlayback, turnId]);

  return {
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
    toggleMic: () => setIsMicActive((prev) => !prev),
    sendTextMessage,
    currentIntent,
    rerollQuestion,
    skipToNextStage,
    endSessionEarly,
  };
}
