"use client";

import { useState, useRef, useCallback } from "react";
import { catalogApi } from "@/services/catalogApi";
import type { AIEvaluationResult } from "@/types/catalog";
import type { DeliveryMetrics } from "@/types/delivery";

export interface EnqueueQuestionPayload {
  question_id: number | string;
  question_text?: string;
  sample_answer?: string;
  quiz_answer?: string | null;
  text_answer?: string;
  transcript?: string;
  delivery_metrics?: DeliveryMetrics | null;
  language?: string;
  is_quiz_correct?: boolean | null;
  audio_duration_seconds?: number;
  role_name?: string;
}

export interface QuestionTaskState {
  status: "queued" | "processing" | "completed" | "failed";
  taskId?: string;
  result?: AIEvaluationResult;
}

export interface OverallSynthesisState {
  status: "idle" | "queued" | "processing" | "completed" | "failed";
  taskId?: string;
  result?: {
    session_title: string;
    average_score: number;
    overall_feedback: string;
    strengths: string[];
    improvements: string[];
    career_readiness_verdict: string;
  };
}

export function useEvaluationPullQueue() {
  const [tasksMap, setTasksMap] = useState<Record<number, QuestionTaskState>>({});
  const [overallSynthesis, setOverallSynthesis] = useState<OverallSynthesisState>({ status: "idle" });

  const activeQuestionPollersRef = useRef<Set<number>>(new Set());
  const activeSynthesisPollerRef = useRef<boolean>(false);

  // Poll a single generic task_id until completed
  const pollSingleTaskId = useCallback(async (taskId: string, maxAttempts = 35): Promise<any> => {
    let delayMs = 300;
    let attempt = 0;

    while (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt++;

      try {
        const resp = await catalogApi.pullEvaluation(taskId);
        if (!resp) break;

        if (resp.status === "completed" && resp.result) {
          return resp.result;
        } else if (resp.status === "failed") {
          return null;
        }
        // Exponential backoff
        delayMs = Math.min(1500, Math.round(delayMs * 1.35));
      } catch (err) {
        console.warn("Pull task polling error:", taskId, err);
        break;
      }
    }
    return null;
  }, []);

  // Enqueue a completed question (all multimodal inputs in single request)
  const enqueueQuestionEvaluation = useCallback(
    async (
      payload: EnqueueQuestionPayload,
      onComplete?: (result: AIEvaluationResult) => void
    ) => {
      const qid = Number(payload.question_id);
      if (activeQuestionPollersRef.current.has(qid)) return;
      activeQuestionPollersRef.current.add(qid);

      setTasksMap((prev) => ({
        ...prev,
        [qid]: { status: "processing" },
      }));

      // Call unified backend queue endpoint
      const enqueueRes = await catalogApi.enqueueEvaluation({
        question_id: qid,
        question_text: payload.question_text,
        sample_answer: payload.sample_answer,
        quiz_answer: payload.quiz_answer,
        text_answer: payload.text_answer,
        transcript: payload.transcript,
        delivery_metrics: payload.delivery_metrics,
        language: payload.language || "vi",
        is_quiz_correct: payload.is_quiz_correct,
        audio_duration_seconds: payload.audio_duration_seconds,
        role_name: payload.role_name,
      });

      if (enqueueRes?.task_id) {
        const taskResult = await pollSingleTaskId(enqueueRes.task_id);
        if (taskResult) {
          setTasksMap((prev) => ({
            ...prev,
            [qid]: {
              status: "completed",
              taskId: enqueueRes.task_id,
              result: taskResult,
            },
          }));
          activeQuestionPollersRef.current.delete(qid);
          onComplete?.(taskResult);
          return taskResult;
        }
      }

      activeQuestionPollersRef.current.delete(qid);
      return null;
    },
    [pollSingleTaskId]
  );

  // Trigger final overall examination synthesis across all evaluated questions
  const triggerOverallSynthesis = useCallback(
    async (params: {
      session_title: string;
      total_questions: number;
      evaluated_questions: Array<{
        question_id: number;
        question_text?: string;
        quiz_score?: number;
        text_score?: number;
        voice_score?: number;
        total_score?: number;
      }>;
      language?: string;
    }) => {
      if (activeSynthesisPollerRef.current) return;
      activeSynthesisPollerRef.current = true;

      setOverallSynthesis({ status: "processing" });

      try {
        const enqueueRes = await catalogApi.enqueueOverallSynthesis(params);
        if (enqueueRes?.task_id) {
          const synthesisResult = await pollSingleTaskId(enqueueRes.task_id);
          if (synthesisResult) {
            setOverallSynthesis({
              status: "completed",
              taskId: enqueueRes.task_id,
              result: synthesisResult,
            });
            activeSynthesisPollerRef.current = false;
            return synthesisResult;
          }
        }
      } catch (err) {
        console.warn("Overall synthesis error:", err);
      }

      // Fallback synthesis
      const scores = params.evaluated_questions.map((q) => q.total_score || 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const fallbackResult = {
        session_title: params.session_title,
        average_score: avg,
        overall_feedback: `Bạn đã hoàn thành bài luyện tập '${params.session_title}' với điểm trung bình ${avg}/100đ.`,
        strengths: ["Cấu trúc trả lời mạch lạc theo khung STAR."],
        improvements: ["Bổ sung số liệu định lượng về tác động thực tế của dự án."],
        career_readiness_verdict: avg >= 70 ? "Sẵn sàng nhận việc (Job Ready)" : "Cần rèn luyện thêm",
      };

      setOverallSynthesis({
        status: "completed",
        result: fallbackResult,
      });
      activeSynthesisPollerRef.current = false;
      return fallbackResult;
    },
    [pollSingleTaskId]
  );

  return {
    tasksMap,
    overallSynthesis,
    enqueueQuestionEvaluation,
    triggerOverallSynthesis,
    isQuestionEvaluating: (qid: number) => {
      const t = tasksMap[qid];
      return t ? t.status === "queued" || t.status === "processing" : false;
    },
    getQuestionResult: (qid: number) => tasksMap[qid]?.result,
  };
}
