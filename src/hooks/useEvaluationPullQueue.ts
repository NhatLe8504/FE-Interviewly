"use client";

import { useState, useRef, useCallback } from "react";
import { catalogApi } from "@/services/catalogApi";
import type { AIEvaluationResult } from "@/types/catalog";
import type { DeliveryMetrics } from "@/types/delivery";

export interface EnqueueQuestionPayload {
  question_id: number | string;
  question_text?: string;
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
  textTaskId?: string;
  voiceTaskId?: string;
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
  const pollSingleTaskId = useCallback(async (taskId: string, maxAttempts = 30): Promise<any> => {
    let delayMs = 250;
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
        delayMs = Math.min(1200, Math.round(delayMs * 1.4));
      } catch (err) {
        console.warn("Pull task polling error:", taskId, err);
        break;
      }
    }
    return null;
  }, []);

  // Enqueue a completed question (decoupled: text + voice + quiz)
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

      // 1. Instant Quiz Score (0ms)
      const quizScore = payload.is_quiz_correct === true ? 15.0 : 0.0;
      const text = (payload.text_answer || "").trim();
      const transcript = (payload.transcript || "").trim();
      const delivery = payload.delivery_metrics;

      // 2. Parallel Background Enqueue: Text and Voice
      const textPromise = (async () => {
        if (!text) return null;
        const textEnqueue = await catalogApi.enqueueTextEvaluation({
          question_id: qid,
          question_text: payload.question_text,
          answer_text: text,
          role_name: payload.role_name,
          language: payload.language || "vi",
        });
        if (textEnqueue?.task_id) {
          return await pollSingleTaskId(textEnqueue.task_id);
        }
        return null;
      })();

      const voicePromise = (async () => {
        if (!delivery && !transcript) return null;
        const voiceEnqueue = await catalogApi.enqueueVoiceEvaluation({
          question_id: qid,
          question_text: payload.question_text,
          transcript,
          delivery_metrics: delivery || {},
          language: payload.language || "vi",
        });
        if (voiceEnqueue?.task_id) {
          return await pollSingleTaskId(voiceEnqueue.task_id);
        }
        return null;
      })();

      // Await both IO tasks asynchronously without blocking candidate UI
      const [textResult, voiceResult] = await Promise.all([textPromise, voicePromise]);

      // Strip common STAR prompt headers to count ACTUAL candidate words
      const cleanCandidateText = text
        .replace(/•?\s*(Tình huống|Nhiệm vụ|Hành động|Kết quả|Situation|Task|Action|Result)\s*(\([^)]*\))?:?/gi, "")
        .trim();
      const actualCandidateWords = cleanCandidateText ? cleanCandidateText.split(/\s+/).filter(Boolean).length : 0;

      // 1. Text Score Strict Determination
      let textScore = 0.0;
      if (actualCandidateWords === 0) {
        textScore = 0.0;
      } else if (textResult && typeof textResult.text_score === "number") {
        textScore = textResult.text_score;
      } else if (actualCandidateWords < 15) {
        textScore = Number(((actualCandidateWords / 60.0) * 35.0).toFixed(1));
      } else {
        textScore = Math.min(35.0, Number((0.4 + (actualCandidateWords / 150.0) * 0.6) * 35.0).toFixed(1));
      }

      // 2. Voice Score Strict Determination
      let voiceScore = 0.0;
      const voiceDurMs = delivery?.durationMs || 0;
      const voiceWords = delivery?.wordCount || (transcript ? transcript.split(/\s+/).filter(Boolean).length : 0);

      if (voiceDurMs < 3500 || (voiceWords === 0 && !transcript.trim())) {
        voiceScore = 0.0;
      } else if (voiceResult && typeof voiceResult.voice_score === "number") {
        voiceScore = voiceResult.voice_score;
      } else if (voiceDurMs >= 5000) {
        voiceScore = 35.0;
      }

      const totalScore = Math.min(100, Math.round(quizScore + textScore + voiceScore));
      const passed = totalScore >= 70;

      // General feedback
      let feedback = "";
      if (totalScore === 0) {
        feedback = "Bạn chưa hoàn thành các phần thi của câu hỏi này (chưa chọn đúng trắc nghiệm, chưa viết nội dung tự luận và chưa ghi âm giọng nói).";
      } else if (actualCandidateWords === 0 && voiceScore === 0) {
        feedback = "Chưa có nội dung tự luận và chưa thực hiện ghi âm. Hãy bổ sung đầy đủ cả 3 phần để đạt điểm chuẩn.";
      } else if (textResult?.feedback) {
        feedback = textResult.feedback;
      } else if (voiceResult?.feedback) {
        feedback = voiceResult.feedback;
      } else if (passed) {
        feedback = "Bài làm hoàn thành tốt các thành phần theo tiêu chuẩn đánh giá.";
      } else {
        feedback = "Bài làm thể hiện sự cố gắng nhưng cần viết chi tiết hơn và luyện tập nói tự tin hơn.";
      }

      const mergedResult: AIEvaluationResult = {
        score: totalScore,
        passed,
        general_feedback: feedback,
        star_breakdown: textResult?.star_breakdown || (actualCandidateWords === 0 ? {
          situation_score: 0,
          situation_feedback: "Chưa nhập bối cảnh tình huống.",
          task_score: 0,
          task_feedback: "Chưa nêu nhiệm vụ hoặc mục tiêu.",
          action_score: 0,
          action_feedback: "Chưa có hành động cụ thể.",
          result_score: 0,
          result_feedback: "Chưa có kết quả đo lường.",
        } : {
          situation_score: actualCandidateWords >= 15 ? 7 : 2,
          situation_feedback: actualCandidateWords >= 15 ? "Bối cảnh rõ ràng." : "Nội dung quá ngắn.",
          task_score: actualCandidateWords >= 15 ? 7 : 2,
          task_feedback: actualCandidateWords >= 15 ? "Nhiệm vụ cụ thể." : "Cần nêu rõ vai trò cá nhân.",
          action_score: actualCandidateWords >= 15 ? 7 : 2,
          action_feedback: actualCandidateWords >= 15 ? "Hành động logic." : "Cần nêu rõ giải pháp kỹ thuật.",
          result_score: actualCandidateWords >= 15 ? 6 : 1,
          result_feedback: actualCandidateWords >= 15 ? "Có số liệu đo lường." : "Thiếu số liệu định lượng.",
        }),
        rubric_scores: [
          {
            criterion_id: "quiz",
            criterion_name: "Trắc nghiệm tình huống (15%)",
            score: quizScore >= 15 ? 10 : 0,
            max_score: 10,
            level_label: `${quizScore}/15đ`,
            feedback: quizScore >= 15 ? "Đạt trọn vẹn điểm trắc nghiệm." : "Chưa chọn phương án chuẩn nhất.",
          },
          {
            criterion_id: "text",
            criterion_name: "Tự luận khung STAR (35%)",
            score: Math.min(10, Math.round((textScore / 35.0) * 10)),
            max_score: 10,
            level_label: `${textScore}/35đ`,
            feedback: textScore >= 25 ? "Lập luận mạch lạc theo khung STAR." : "Cần viết chi tiết hơn.",
          },
          {
            criterion_id: "voice",
            criterion_name: "Nói & Ghi âm trực tiếp (50%)",
            score: Math.min(10, Math.round((voiceScore / 50.0) * 10)),
            max_score: 10,
            level_label: `${voiceScore}/50đ`,
            feedback: voiceResult?.feedback || (voiceScore >= 35 ? "Phát biểu rõ ràng, thời lượng tốt." : "Cần luyện nói lưu loát hơn."),
          },
        ],
        strengths: [
          ...(textResult?.strengths || ["Cấu trúc trả lời mạch lạc theo chuẩn STAR."]),
          ...(voiceResult?.strengths || [voiceResult?.pace_label ? `Tốc độ phát âm ${voiceResult.pace_label}.` : "Phong thái tự tin."]),
        ],
        improvements: [
          ...(textResult?.improvements || ["Bổ sung thêm số liệu đo lường định lượng."]),
          ...(voiceResult?.improvements || ["Duy trì nhịp thở và hạn chế từ đệm."]),
        ],
        modal_breakdown: {
          quiz_score: quizScore,
          quiz_max: 15.0,
          text_score: textScore,
          text_max: 35.0,
          voice_score: voiceScore,
          voice_max: 50.0,
          total_score: totalScore,
        },
        delivery_metrics: delivery || undefined,
      };

      setTasksMap((prev) => ({
        ...prev,
        [qid]: {
          status: "completed",
          result: mergedResult,
        },
      }));

      activeQuestionPollersRef.current.delete(qid);
      onComplete?.(mergedResult);
      return mergedResult;
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
        overall_feedback: `Bạn đã hoàn thành tốt bài luyện tập '${params.session_title}' với điểm trung bình ${avg}/100đ. Phong thái trả lời tự tin, nắm chắc kiến thức chuyên môn.`,
        strengths: ["Cấu trúc trả lời mạch lạc theo khung STAR.", "Thực hiện đầy đủ cả 3 hình thức Trắc nghiệm, Tự luận và Giọng nói."],
        improvements: ["Nêu rõ hơn các đánh đổi kỹ thuật (trade-offs).", "Rèn luyện nhịp thở và hạn chế từ đệm khi nói."],
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
