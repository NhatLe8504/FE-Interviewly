"use client";

import { useState, useRef, useCallback } from "react";
import { catalogApi } from "@/services/catalogApi";
import type { AIEvaluationResult } from "@/types/catalog";
import type { DeliveryMetrics } from "@/types/delivery";

export interface EnqueuePayload {
  question_id: number | string;
  quiz_answer?: string | null;
  text_answer?: string;
  delivery_metrics?: DeliveryMetrics | null;
  language?: string;
  is_quiz_correct?: boolean | null;
  audio_duration_seconds?: number;
}

export interface PullTaskRecord {
  taskId: string;
  status: "queued" | "processing" | "completed" | "failed";
  quizScore?: number;
  result?: AIEvaluationResult;
}

export function useEvaluationPullQueue() {
  const [tasksMap, setTasksMap] = useState<Record<number, PullTaskRecord>>({});
  const activePollersRef = useRef<Set<number>>(new Set());

  const pollTaskUntilComplete = useCallback(
    async (
      questionId: number,
      taskId: string,
      onResult?: (result: AIEvaluationResult) => void
    ) => {
      if (activePollersRef.current.has(questionId)) return;
      activePollersRef.current.add(questionId);

      let delayMs = 250;
      const maxAttempts = 25;
      let attempt = 0;

      while (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, delayMs));
        attempt++;

        try {
          const resp = await catalogApi.pullEvaluation(taskId);
          if (!resp) break;

          setTasksMap((prev) => ({
            ...prev,
            [questionId]: {
              taskId,
              status: resp.status,
              result: resp.result,
            },
          }));

          if (resp.status === "completed" && resp.result) {
            onResult?.(resp.result);
            break;
          } else if (resp.status === "failed") {
            break;
          }

          // Exponential backoff with ceiling
          delayMs = Math.min(1500, Math.round(delayMs * 1.5));
        } catch (err) {
          console.warn("Polling error for task:", taskId, err);
          break;
        }
      }

      activePollersRef.current.delete(questionId);
    },
    []
  );

  const enqueueQuestionEvaluation = useCallback(
    async (
      payload: EnqueuePayload,
      onComplete?: (result: AIEvaluationResult) => void
    ) => {
      const qid = Number(payload.question_id);

      // Attempt background enqueue via Pipeline B Pull MQ
      const enqueueResp = await catalogApi.enqueueEvaluation(payload);

      if (enqueueResp && enqueueResp.task_id) {
        const taskId = enqueueResp.task_id;
        setTasksMap((prev) => ({
          ...prev,
          [qid]: {
            taskId,
            status: "queued",
            quizScore: enqueueResp.quiz_score,
          },
        }));

        // Kick off background polling worker without blocking UI
        pollTaskUntilComplete(qid, taskId, onComplete);
        return taskId;
      }

      // Fallback to synchronous direct evaluation if queue is unavailable
      try {
        const directResult = await catalogApi.evaluateAnswer(qid, {
          type: "quiz",
          answer_text: payload.text_answer || "",
          audio_duration_seconds: payload.audio_duration_seconds,
          selected_option_id: payload.quiz_answer || undefined,
          is_quiz_correct: payload.is_quiz_correct !== undefined ? payload.is_quiz_correct : undefined,
          language: payload.language || "vi",
        });

        setTasksMap((prev) => ({
          ...prev,
          [qid]: {
            taskId: `sync-${Date.now()}`,
            status: "completed",
            result: directResult,
          },
        }));

        onComplete?.(directResult);
      } catch (err) {
        console.error("Direct evaluation fallback failed:", err);
      }
      return null;
    },
    [pollTaskUntilComplete]
  );

  return {
    tasksMap,
    enqueueQuestionEvaluation,
    isTaskProcessing: (qid: number) => {
      const t = tasksMap[qid];
      return t ? t.status === "queued" || t.status === "processing" : false;
    },
    getTaskResult: (qid: number) => tasksMap[qid]?.result,
  };
}
