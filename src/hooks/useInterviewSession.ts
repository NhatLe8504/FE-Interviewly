"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { interviewApi, SessionResponse } from "@/services/interviewApi";
import { useSseStreaming } from "@/hooks/useSseStreaming";
import { mockSessionMeta, MOCK_SCRIPT } from "@/mock/practice";

export type AiStageState = "speaking" | "listening" | "thinking" | "idle";

export interface InterviewTurnItem {
  id: string;
  turnNumber: number;
  speaker: "ai" | "user";
  text: string;
  durationSeconds?: number;
}

export interface SessionMetadata {
  domainLabel: string;
  roleLabel: string;
  levelLabel: string;
  languageLabel: string;
  mode: "text" | "voice";
}

export interface UseInterviewSessionReturn {
  sessionId: string;
  metadata: SessionMetadata;
  turns: InterviewTurnItem[];
  turnNumber: number;
  totalEstimatedTurns: number;
  currentQuestion: string;
  currentStarTip: string;
  aiState: AiStageState;
  isStreaming: boolean;
  isSubmitting: boolean;
  isCompleted: boolean;
  sessionDurationSeconds: number;
  error: string | null;
  submitTurn: (
    answerText: string,
    audioBlob?: Blob | null,
    durationSeconds?: number
  ) => Promise<boolean>;
  endSessionEarly: () => void;
}

export function useInterviewSession(sessionId: string): UseInterviewSessionReturn {
  const [metadata, setMetadata] = useState<SessionMetadata>(() => {
    const meta = mockSessionMeta(sessionId);
    return {
      domainLabel: meta.domainLabel,
      roleLabel: meta.roleLabel,
      levelLabel: meta.levelLabel,
      languageLabel: meta.languageLabel,
      mode: (meta.mode === 'voice' ? 'voice' : 'text'),
    };
  });

  const [turns, setTurns] = useState<InterviewTurnItem[]>([]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [totalEstimatedTurns] = useState(4);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentStarTip, setCurrentStarTip] = useState("");
  const [aiState, setAiState] = useState<AiStageState>("speaking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { streamedText, isStreaming, startStream } = useSseStreaming();
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync currently streaming question text to UI
  useEffect(() => {
    if (isStreaming && streamedText) {
      setCurrentQuestion(streamedText);
    }
  }, [isStreaming, streamedText]);

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

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      setError(null);
      setAiState("speaking");

      let initialQuestionText =
        MOCK_SCRIPT[0]?.text ||
        "Xin chào, hãy giới thiệu sơ lược về bản thân và kinh nghiệm liên quan nhất của bạn.";
      let initialStarTip =
        MOCK_SCRIPT[0]?.starTip ||
        "Cung cấp bối cảnh (Situation), vai trò cá nhân (Task), giải pháp chính (Action) và kết quả (Result).";

      try {
        const sessionData: SessionResponse | null = await interviewApi.getSession(sessionId);
        if (sessionData && isMounted) {
          if (sessionData.role_name) {
            setMetadata((prev) => ({
              ...prev,
              roleLabel: sessionData.role_name || prev.roleLabel,
              domainLabel: sessionData.domain_name || prev.domainLabel,
              mode: (sessionData.mode === 'voice' ? 'voice' : (sessionData.mode === 'text' ? 'text' : prev.mode)),
            }));
          }
          if (sessionData.current_turn?.question_text) {
            initialQuestionText = sessionData.current_turn.question_text;
            initialStarTip = sessionData.current_turn.star_tip || initialStarTip;
          }
        }
      } catch {
        // Fallback to default
      }

      if (!isMounted) return;

      setCurrentStarTip(initialStarTip);

      // Stream the first question
      const streamUrl = interviewApi.getSessionStreamUrl(sessionId);
      await startStream(streamUrl, initialQuestionText, (finalQuestion) => {
        if (!isMounted) return;
        setCurrentQuestion(finalQuestion);
        setTurns((prev) => [
          ...prev,
          {
            id: `turn-ai-1`,
            turnNumber: 1,
            speaker: "ai",
            text: finalQuestion,
          },
        ]);
        setAiState("listening");
      });
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId, startStream]);

  // Submit candidate answer
  const submitTurn = useCallback(
    async (
      answerText: string,
      audioBlob?: Blob | null,
      durationSeconds: number = 0
    ): Promise<boolean> => {
      const cleanAnswer = answerText.trim();
      if (!cleanAnswer || isSubmitting || isCompleted) return false;

      setIsSubmitting(true);
      setAiState("thinking");
      setError(null);

      // Add user turn immediately to conversation
      const userTurnItem: InterviewTurnItem = {
        id: `turn-user-${turnNumber}-${Date.now()}`,
        turnNumber,
        speaker: "user",
        text: cleanAnswer,
        durationSeconds,
      };

      setTurns((prev) => [...prev, userTurnItem]);

      try {
        const result = await interviewApi.submitTurn(sessionId, turnNumber, {
          answer_text: cleanAnswer,
          duration_seconds: durationSeconds,
          audio_blob: audioBlob || undefined,
        });

        if (result.is_completed || !result.next_turn) {
          // Session is finished
          setIsCompleted(true);
          setAiState("idle");
          const wrapText =
            metadata.languageLabel === "English"
              ? "Thank you for completing this interview session. All your responses have been recorded and your rubric evaluation is being calculated."
              : "Cảm ơn bạn đã hoàn thành các câu hỏi trong phiên phỏng vấn. Hệ thống AI đang tổng hợp báo cáo và tính toán bảng điểm Rubric cho bạn.";

          setTurns((prev) => [
            ...prev,
            {
              id: `turn-ai-final`,
              turnNumber: turnNumber + 1,
              speaker: "ai",
              text: wrapText,
            },
          ]);
          setCurrentQuestion(wrapText);
          setIsSubmitting(false);
          return true;
        }

        // Next round
        const nextTurnData = result.next_turn;
        const nextTurnNum = turnNumber + 1;
        setTurnNumber(nextTurnNum);
        setCurrentStarTip(
          nextTurnData.star_tip ||
            "Tập trung vào kết quả định lượng và bài học rút ra (Action & Result)."
        );

        setAiState("speaking");
        const streamUrl = interviewApi.getSessionStreamUrl(sessionId);

        await startStream(streamUrl, nextTurnData.question_text, (finalNextQ) => {
          setCurrentQuestion(finalNextQ);
          setTurns((prev) => [
            ...prev,
            {
              id: `turn-ai-${nextTurnNum}-${Date.now()}`,
              turnNumber: nextTurnNum,
              speaker: "ai",
              text: finalNextQ,
            },
          ]);
          setAiState("listening");
        });

        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setError("Không thể nộp câu trả lời. Vui lòng thử lại.");
        setAiState("listening");
        setIsSubmitting(false);
        return false;
      }
    },
    [isCompleted, isSubmitting, metadata.languageLabel, sessionId, startStream, turnNumber]
  );

  const endSessionEarly = useCallback(() => {
    setIsCompleted(true);
    setAiState("idle");
  }, []);

  return {
    sessionId,
    metadata,
    turns,
    turnNumber,
    totalEstimatedTurns,
    currentQuestion,
    currentStarTip,
    aiState,
    isStreaming,
    isSubmitting,
    isCompleted,
    sessionDurationSeconds,
    error,
    submitTurn,
    endSessionEarly,
  };
}

