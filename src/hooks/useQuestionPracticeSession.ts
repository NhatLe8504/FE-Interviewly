"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { catalogApi } from "@/services/catalogApi";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import type {
  QuestionDetailOut,
  AIEvaluationResult,
} from "@/types/catalog";

export interface UserPracticeAnswer {
  mode: "quiz" | "text" | "voice" | "all";
  selected_option_id?: string | null;
  written_text?: string;
  audio_url?: string | null;
  audio_duration_seconds?: number;
  submitted_at?: string;
}

export function useQuestionPracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query params: ?q=1,2,3 or ?set=1 or ?questionId=1
  const qParam = searchParams.get("q");
  const setParam = searchParams.get("set") || searchParams.get("setId");
  const singleQuestionId = searchParams.get("questionId");
  const sourceParam = searchParams.get("source") || (qParam ? "url" : setParam ? "set" : "basket");
  const customTitle = searchParams.get("title");

  const [questions, setQuestions] = useState<QuestionDetailOut[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string>("Không gian luyện tập");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Missing / Deleted questions tracking
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User answers and AI evaluation results keyed by question_id
  const [answers, setAnswers] = useState<Record<number, UserPracticeAnswer>>({});
  const [evaluations, setEvaluations] = useState<Record<number, AIEvaluationResult>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, questions.length]);

  // Load session questions based on URL query (?q=... or ?set=...)
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      setErrorMessage(null);
      setSkippedCount(0);

      // PRIORITY 1: Comma-separated IDs in URL: ?q=1,4,7,999
      if (qParam && qParam.trim()) {
        const rawIds = qParam
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);

        if (rawIds.length > 0) {
          try {
            const batch = await catalogApi.getQuestionsBatch(rawIds);
            if (!isMounted) return;

            if (batch.length > 0) {
              setQuestions(batch);
              const missing = rawIds.length - batch.length;
              if (missing > 0) {
                setSkippedCount(missing);
              }
              const defaultTitle = batch.length === 1
                ? `Luyện câu hỏi: ${batch[0].role_name || "Chuyên ngành"}`
                : `Bộ câu hỏi thực hành (${batch.length} câu)`;
              setSessionTitle(customTitle ? decodeURIComponent(customTitle) : defaultTitle);
              setIsLoading(false);
              return;
            } else {
              setErrorMessage("Không tìm thấy câu hỏi nào hợp lệ từ liên kết. Các câu hỏi này có thể đã bị xóa hoặc ngưng kích hoạt.");
              setIsLoading(false);
              return;
            }
          } catch {
            // Fallback continues
          }
        }
      }

      // PRIORITY 2: Curated Question Set by ID: ?set=1
      if (setParam) {
        const foundSet = MOCK_QUESTION_SETS.find((s) => String(s.set_id) === String(setParam));
        if (foundSet && foundSet.questions && foundSet.questions.length > 0) {
          const setQids = foundSet.questions.map((q) => q.question_id);
          try {
            // Fetch fresh details for the set questions from API
            const batch = await catalogApi.getQuestionsBatch(setQids);
            if (!isMounted) return;
            const valid = batch.length > 0 ? batch : foundSet.questions;
            setQuestions(valid);
            if (setQids.length > valid.length) {
              setSkippedCount(setQids.length - valid.length);
            }
            setSessionTitle(customTitle ? decodeURIComponent(customTitle) : foundSet.title);
            setIsLoading(false);
            return;
          } catch {
            if (!isMounted) return;
            setQuestions(foundSet.questions);
            setSessionTitle(foundSet.title);
            setIsLoading(false);
            return;
          }
        }
      }

      // PRIORITY 3: Single Question: ?questionId=5
      if (singleQuestionId) {
        try {
          const detail = await catalogApi.getQuestionDetail(singleQuestionId);
          if (!isMounted) return;
          setQuestions([detail]);
          setSessionTitle(detail.role_name ? `Luyện câu hỏi: ${detail.role_name}` : "Luyện câu hỏi đơn lẻ");
          setIsLoading(false);
          return;
        } catch {
          // Fallback
        }
      }

      // PRIORITY 4: SessionStorage Basket Backup
      try {
        const raw = sessionStorage.getItem("basket_questions");
        const activeTitle = sessionStorage.getItem("active_question_set_title");
        if (raw) {
          const list: QuestionDetailOut[] = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            if (!isMounted) return;
            setQuestions(list);
            setSessionTitle(activeTitle || `Giỏ đề tự chọn (${list.length} câu)`);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // PRIORITY 5: Default live catalog questions
      try {
        const fallbackPage = await catalogApi.getQuestions({ limit: 4 });
        if (!isMounted) return;
        if (fallbackPage.items.length > 0) {
          const details = await catalogApi.getQuestionsBatch(fallbackPage.items.map((i) => i.question_id));
          if (!isMounted) return;
          const valid = details.length > 0 ? details : fallbackPage.items.map((q) => ({
            ...q,
            star_template: null,
            rubric_criteria: [],
          }));
          setQuestions(valid);
          setSessionTitle("Đề luyện tập khởi đầu (Chọn lọc)");
        } else {
          setErrorMessage("Chưa có câu hỏi nào trong hệ thống. Vui lòng thử lại sau.");
        }
      } catch {
        setErrorMessage("Không thể nạp dữ liệu câu hỏi từ máy chủ.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [qParam, setParam, singleQuestionId, customTitle]);

  const currentQuestion = useMemo(() => {
    if (questions.length === 0 || currentIndex < 0 || currentIndex >= questions.length) {
      return null;
    }
    return questions[currentIndex];
  }, [questions, currentIndex]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const saveAnswer = useCallback((questionId: number, answer: UserPracticeAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const saveEvaluation = useCallback((questionId: number, result: AIEvaluationResult) => {
    setEvaluations((prev) => ({
      ...prev,
      [questionId]: result,
    }));
  }, []);

  const finishSession = useCallback(() => {
    setIsFinished(true);

    if (questions.length > 0) {
      const qSummaries = questions.map((q) => {
        const ev = evaluations[q.question_id];
        const mb = ev?.modal_breakdown;
        return {
          question_id: q.question_id,
          question_text: q.question_text,
          score: ev ? ev.score : 0,
          passed: ev ? ev.passed : false,
          quiz_score: mb ? mb.quiz_score : undefined,
          text_score: mb ? mb.text_score : undefined,
          voice_score: mb ? mb.voice_score : undefined,
        };
      });

      const evaluatedList = Object.values(evaluations);
      const evaluatedCount = evaluatedList.length;
      const scores = evaluatedList.map((e) => e.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const quizScores = evaluatedList.map((e) => e.modal_breakdown?.quiz_score || 0);
      const textScores = evaluatedList.map((e) => e.modal_breakdown?.text_score || 0);
      const voiceScores = evaluatedList.map((e) => e.modal_breakdown?.voice_score || 0);

      const quizAvg = quizScores.length > 0 ? Number((quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)) : 0;
      const textAvg = textScores.length > 0 ? Number((textScores.reduce((a, b) => a + b, 0) / textScores.length).toFixed(1)) : 0;
      const voiceAvg = voiceScores.length > 0 ? Number((voiceScores.reduce((a, b) => a + b, 0) / voiceScores.length).toFixed(1)) : 0;

      const historyRecord = {
        history_id: `h-${Date.now()}`,
        session_title: sessionTitle,
        source_type: sourceParam || "basket",
        source_id: setParam || null,
        domain_id: questions[0]?.domain_id || null,
        domain_name: questions[0]?.domain_name || null,
        role_name: questions[0]?.role_name || null,
        total_questions: questions.length,
        evaluated_count: evaluatedCount,
        average_score: avgScore,
        quiz_score_avg: quizAvg,
        text_score_avg: textAvg,
        voice_score_avg: voiceAvg,
        duration_seconds: elapsedSeconds,
        questions_summary: qSummaries,
        created_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("interviewly_practice_history");
          const existing = raw ? JSON.parse(raw) : [];
          existing.unshift(historyRecord);
          localStorage.setItem("interviewly_practice_history", JSON.stringify(existing.slice(0, 50)));
        } catch (e) {
          console.warn("Save to localStorage failed:", e);
        }
      }

      catalogApi.savePracticeHistory(historyRecord).catch((err) => {
        console.warn("Save history to backend error:", err);
      });
    }
  }, [questions, evaluations, sessionTitle, sourceParam, setParam, elapsedSeconds]);

  const restartSession = useCallback(() => {
    setAnswers({});
    setEvaluations({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setIsFinished(false);
  }, []);

  // Compute shareable URL
  const shareableUrl = useMemo(() => {
    if (typeof window === "undefined" || questions.length === 0) return "";
    const ids = questions.map((q) => q.question_id).join(",");
    return `${window.location.origin}/questions/practice?q=${ids}`;
  }, [questions]);

  // Compute total statistics
  const sessionStats = useMemo(() => {
    const totalCount = questions.length;
    const evaluatedCount = Object.keys(evaluations).length;
    const scores = Object.values(evaluations).map((e) => e.score);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const isPassed = averageScore >= 70;

    return {
      totalCount,
      evaluatedCount,
      averageScore,
      isPassed,
      completedPercentage: totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0,
    };
  }, [questions.length, evaluations]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    sessionTitle,
    source: sourceParam,
    answers,
    evaluations,
    currentAnswer: currentQuestion ? answers[currentQuestion.question_id] || null : null,
    currentEvaluation: currentQuestion ? evaluations[currentQuestion.question_id] || null : null,
    elapsedSeconds,
    isLoading,
    isFinished,
    skippedCount,
    errorMessage,
    shareableUrl,
    sessionStats,
    goToIndex,
    nextQuestion,
    prevQuestion,
    saveAnswer,
    saveEvaluation,
    finishSession,
    restartSession,
  };
}

