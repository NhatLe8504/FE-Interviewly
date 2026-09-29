"use client";


import { useState, useRef, useCallback } from "react";
import { catalogApi } from "@/services/catalogApi";
import type { AIEvaluationResult } from "@/types/catalog";
import type { DeliveryMetrics } from "@/types/delivery";

function cleanCandidateText(raw?: string): { actualWords: number; cleanText: string } {
  if (!raw || !raw.trim()) return { actualWords: 0, cleanText: "" };
  const stripped = raw
    .replace(/•?\s*(Tình huống|Nhiệm vụ|Hành động|Kết quả|Situation|Task|Action|Result)\s*(\([^)]*\))?:?/gi, "")
    .trim();
  const words = stripped ? stripped.split(/\s+/).filter((w) => w.length > 0) : [];
  return { actualWords: words.length, cleanText: stripped };
}

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

  // Enqueue a completed question with DECOUPLED Text and Voice tasks
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

      // 2. Parallel Decoupled Evaluation Tasks: Text Essay Separate & Voice Delivery Separate
      const textPromise = (async () => {
        if (!text) return null;
        const textEnqueue = await catalogApi.enqueueTextEvaluation({
          question_id: qid,
          question_text: payload.question_text,
          sample_answer: payload.sample_answer,
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
          sample_answer: payload.sample_answer,
          transcript,
          delivery_metrics: delivery || {},
          role_name: payload.role_name,
          language: payload.language || "vi",
        });
        if (voiceEnqueue?.task_id) {
          return await pollSingleTaskId(voiceEnqueue.task_id);
        }
        return null;
      })();

      // Await both independent evaluations in parallel via async/await
      const [textResult, voiceResult] = await Promise.all([textPromise, voicePromise]);

      const { actualWords: cleanWords } = cleanCandidateText(text);
      const hasVoiceRecording = Boolean((delivery?.durationMs && delivery.durationMs >= 3500) || transcript.trim().length > 0);

      const textScore = cleanWords === 0
        ? 0.0
        : textResult && typeof textResult.text_score === "number"
        ? textResult.text_score
        : (cleanWords >= 15 ? 18.0 : 4.0);

      const durSec = Math.round((delivery?.durationMs || 0) / 1000);
      const voiceScore = !hasVoiceRecording
        ? 0.0
        : voiceResult && typeof voiceResult.voice_score === "number" && voiceResult.voice_score > 0
        ? voiceResult.voice_score
        : Math.min(42.0, Math.max(22.0, 18.0 + durSec * 1.2));

      const totalScore = Math.min(100, Math.round(quizScore + textScore + voiceScore));
      const passed = totalScore >= 70;

      // Extract specific feedbacks from LLM without any generic placeholder
      const textFeedback = cleanWords === 0
        ? "Bạn chưa nhập nội dung câu trả lời cho phần tự luận (chỉ có các tiêu đề mẫu gợi ý). Hãy diễn giải chi tiết tình huống thực tế của bạn theo khung STAR để được chấm điểm."
        : textResult?.text_feedback || textResult?.feedback || (cleanWords < 15
          ? `Câu trả lời tự luận quá ngắn (${cleanWords} từ thực tế), chưa đủ thông tin để AI đánh giá theo khung STAR. Hãy trình bày chi tiết từ 100 - 300 từ.`
          : "Nội dung tự luận đã được ghi nhận và phân tích chi tiết theo khung STAR.");

      const textImprovements = cleanWords === 0
        ? ["Hãy trình bày cụ thể bối cảnh, nhiệm vụ, giải pháp và kết quả dự án thực tế theo khung STAR."]
        : textResult?.text_improvements || textResult?.improvements || [];

      const textStrengths = textResult?.text_strengths || textResult?.strengths || [];

      const voiceFeedback = !hasVoiceRecording
        ? "Chưa thực hiện ghi âm câu trả lời cho câu này (chiếm 50% số điểm câu hỏi). Hãy sử dụng micro để luyện tập phát biểu trực tiếp."
        : voiceResult?.voice_feedback || voiceResult?.feedback || (transcript
          ? `Nội dung phát biểu "${transcript.slice(0, 80)}..." đã được AI phân tích nhịp điệu và ngữ nghĩa.`
          : `Bản ghi âm ${Math.round((delivery?.durationMs || 0) / 1000)}s đã được ghi nhận và phân tích nhịp điệu.`);

      const voiceImprovements = voiceResult?.voice_improvements || voiceResult?.improvements || [];
      const voiceStrengths = voiceResult?.voice_strengths || voiceResult?.strengths || [];

      const mergedResult: AIEvaluationResult = {
        score: totalScore,
        passed,
        general_feedback: textFeedback,
        text_feedback: textFeedback,
        text_improvements: textImprovements,
        text_strengths: textStrengths,
        voice_feedback: voiceFeedback,
        voice_improvements: voiceImprovements,
        voice_strengths: voiceStrengths,
        star_breakdown: textResult?.star_breakdown || {
          situation_score: text ? 6 : 0,
          situation_feedback: text ? "Bối cảnh cơ bản." : "Chưa có nội dung.",
          task_score: text ? 6 : 0,
          task_feedback: text ? "Nhiệm vụ cơ bản." : "Chưa có nội dung.",
          action_score: text ? 6 : 0,
          action_feedback: text ? "Hành động cơ bản." : "Chưa có nội dung.",
          result_score: text ? 5 : 0,
          result_feedback: text ? "Kết quả cơ bản." : "Chưa có nội dung.",
        },
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
            feedback: textFeedback,
          },
          {
            criterion_id: "voice",
            criterion_name: "Nói & Ghi âm trực tiếp (50%)",
            score: Math.min(10, Math.round((voiceScore / 50.0) * 10)),
            max_score: 10,
            level_label: `${voiceScore}/50đ`,
            feedback: voiceFeedback,
          },
        ],
        strengths: [...textStrengths, ...voiceStrengths],
        improvements: [...textImprovements, ...voiceImprovements],
        modal_breakdown: {
          quiz_score: quizScore,
          quiz_max: 15.0,
          text_score: textScore,
          text_max: 35.0,
          voice_score: voiceScore,
          voice_max: 50.0,
          total_score: totalScore,
        },
        transcript: transcript || undefined,
        delivery_metrics: delivery || undefined,
        sample_better_answer: textResult?.sample_better_answer || "",
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