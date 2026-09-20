"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  CheckCircle,
  CheckSquare,
  Copy,
  Check,
  FileText,
  HelpCircle,
  Lightbulb,
  Keyboard,
  Mic,
  RotateCcw,
  Send,
  Square,
  XCircle,
  ArrowRight,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  Share2,
  Lock,
} from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import { useI18n } from "@/context/I18nContext";
import type { QuestionDetailOut, AIEvaluationResult } from "@/types/catalog";
import type { DeliveryMetrics } from "@/types/delivery";
import { useDeliveryVoiceRecorder } from "@/hooks/useDeliveryVoiceRecorder";
import { useEvaluationPullQueue } from "@/hooks/useEvaluationPullQueue";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import { getDomainTheme } from "@/constants/domainThemes";
import styles from "./detail.module.css";

interface Props {
  questionId?: string;
}

export interface QuestionAnswerRecord {
  selectedOption: string | null;
  writtenText: string;
  recordedAudioUrl: string | null;
  recordingSeconds: number;
  delivery_metrics?: DeliveryMetrics | null;
}

export default function QuestionDetailClient({ questionId: propQuestionId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();

  const pathname = usePathname();
  const qParam = searchParams.get("q");
  const setParam = searchParams.get("set") || searchParams.get("setId");
  const tabParam = searchParams.get("tab");

  const isPracticeView =
    pathname?.includes("/questions/practice") ||
    tabParam === "practice" ||
    searchParams.get("practice") === "1" ||
    searchParams.get("source") === "basket" ||
    searchParams.get("source") === "set" ||
    Boolean(setParam) ||
    (Boolean(qParam) && qParam.includes(","));

  const initialTab = isPracticeView
    ? "practice"
    : (tabParam === "rubric" || tabParam === "followup" ? (tabParam as any) : "star");

  // Active tab: star | rubric | followup | practice
  const [activeTab, setActiveTab] = useState<"star" | "rubric" | "followup" | "practice">(initialTab);

  useEffect(() => {
    if (isPracticeView && activeTab !== "practice") {
      setActiveTab("practice");
    }
  }, [isPracticeView, activeTab]);

  // List of questions for this session
  const [questionsList, setQuestionsList] = useState<QuestionDetailOut[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [sessionTitle, setSessionTitle] = useState<string>("Chi tiết câu hỏi");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Candidate answers and final evaluations keyed by question_id
  const [answersMap, setAnswersMap] = useState<Record<number, QuestionAnswerRecord>>({});
  const [evaluationsMap, setEvaluationsMap] = useState<Record<number, AIEvaluationResult>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Active answer mode tab inside practice: quiz | text | voice
  const [practiceType, setPracticeType] = useState<"quiz" | "text" | "voice">("quiz");

  // Forward-Only Progression Lock (Read-only on previous questions)
  const [lockedQuestionIds, setLockedQuestionIds] = useState<Set<number>>(new Set());

  // Pipeline B: Pull MQ Hook
  const pullQueue = useEvaluationPullQueue();



  // AI Evaluation loading state during final submission
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Copy sample answer and share link feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Session timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-transition warning modal state
  const [showIncompleteModal, setShowIncompleteModal] = useState<boolean>(false);
  const [incompleteIssues, setIncompleteIssues] = useState<string[]>([]);
  const [pendingTargetIdx, setPendingTargetIdx] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (!isFinished && questionsList.length > 0 && activeTab === "practice") {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isFinished, questionsList.length, activeTab]);

  // Load questions data based on query ?q= or ?set= or propQuestionId
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);

      // Source 1: If source is basket or active basket exists, recover basket questions first
      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem("basket_questions") || sessionStorage.getItem("active_custom_questions");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (qParam) {
                const rawIds = qParam.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
                const matched = rawIds.map((id) => parsed.find((q: any) => q.question_id === id)).filter(Boolean);
                if (matched.length > 0) {
                  setQuestionsList(matched);
                  setSessionTitle(sessionStorage.getItem("active_question_set_title") || `Giỏ câu hỏi thực hành (${matched.length} câu)`);
                  setCurrentIdx(0);
                  setIsLoading(false);
                  return;
                }
              }
              if (searchParams.get("source") === "basket") {
                setQuestionsList(parsed);
                setSessionTitle(sessionStorage.getItem("active_question_set_title") || `Giỏ câu hỏi thực hành (${parsed.length} câu)`);
                setCurrentIdx(0);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // Source 2: Query param ?set=1 (Curated Question Set)
      if (setParam) {
        const foundSet = MOCK_QUESTION_SETS.find((s) => String(s.set_id) === String(setParam));
        if (foundSet && foundSet.questions && foundSet.questions.length > 0) {
          const qids = foundSet.questions.map((q) => q.question_id);
          try {
            const batch = await catalogApi.getQuestionsBatch(qids);
            if (!isMounted) return;
            const valid = batch.length > 0 ? batch : foundSet.questions;
            setQuestionsList(valid);
            setSessionTitle(foundSet.title);
            setCurrentIdx(0);
            setIsLoading(false);
            return;
          } catch {
            if (!isMounted) return;
            setQuestionsList(foundSet.questions);
            setSessionTitle(foundSet.title);
            setCurrentIdx(0);
            setIsLoading(false);
            return;
          }
        }
      }

      // Source 3: Query param ?q=19,20,21
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
              setQuestionsList(batch);
              setSessionTitle(batch.length > 1 ? `Bộ câu hỏi thực hành (${batch.length} câu)` : `Câu hỏi #${batch[0].question_id}`);
              setCurrentIdx(0);
              setIsLoading(false);
              return;
            }
          } catch {
            // fallback
          }
        }
      }

      // Source 4: Single Question from Route ID /questions/[id]
      if (propQuestionId && !isNaN(Number(propQuestionId))) {
        try {
          const detail = await catalogApi.getQuestionDetail(Number(propQuestionId));
          if (!isMounted) return;
          if (detail && detail.question_id) {
            setQuestionsList([detail]);
            setSessionTitle(`Câu hỏi #${detail.question_id}: ${detail.role_name || "Chuyên ngành"}`);
            setCurrentIdx(0);
            setIsLoading(false);
            return;
          }
        } catch {
          // fallback
        }
      }

      // Final Fallback: Default to Question Set 1 questions
      const defaultSet = MOCK_QUESTION_SETS[0];
      if (defaultSet && defaultSet.questions) {
        setQuestionsList(defaultSet.questions);
        setSessionTitle(defaultSet.title);
        setCurrentIdx(0);
        setIsLoading(false);
        return;
      }

      setLoadError("Không tìm thấy dữ liệu câu hỏi phù hợp.");
      setIsLoading(false);
    }



    loadData();

    return () => {
      isMounted = false;
    };
  }, [propQuestionId, qParam, setParam, searchParams]);

  // Automatically reset to Quiz mode (Part 1) and reset voice recorder on question change
  useEffect(() => {
    setPracticeType("quiz");
    voiceRecorder.reset();
  }, [currentIdx]);

  // Current Question
  const currentQuestion = useMemo(() => {
    if (questionsList.length === 0 || currentIdx < 0 || currentIdx >= questionsList.length) {
      return null;
    }
    return questionsList[currentIdx];
  }, [questionsList, currentIdx]);

  const totalQuestions = questionsList.length;

  // Exact Mathematical Scoring Constants:
  // Total Exam Points = 100 points
  // Each Question Max Points = 100 / N
  // Quiz Max Points = 15 / N (15% of question)
  // Text Max Points = 35 / N (35% of question)
  // Voice Max Points = 50 / N (50% of question)
  const scoreMultipliers = useMemo(() => {
    const N = Math.max(1, totalQuestions);
    return {
      pointsPerQuestion: Number((100.0 / N).toFixed(2)),
      quizMax: Number((15.0 / N).toFixed(2)),
      textMax: Number((35.0 / N).toFixed(2)),
      voiceMax: Number((50.0 / N).toFixed(2)),
    };
  }, [totalQuestions]);

  const currentQId = currentQuestion?.question_id || 0;
  const currentAns: QuestionAnswerRecord = useMemo(() => {
    return (
      answersMap[currentQId] || {
        selectedOption: null,
        isQuizChecked: false,
        writtenText: "",
        recordedAudioUrl: null,
        recordingSeconds: 0,
      }
    );
  }, [answersMap, currentQId]);

  const currentWordCount = useMemo(() => {
    const trimmed = currentAns.writtenText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [currentAns.writtenText]);

  // Update specific answer field for current question
  const updateCurrentAnswer = useCallback(
    (updater: Partial<QuestionAnswerRecord>) => {
      if (!currentQId) return;
      setAnswersMap((prev) => ({
        ...prev,
        [currentQId]: {
          ...(prev[currentQId] || {
            selectedOption: null,
            isQuizChecked: false,
            writtenText: "",
            recordedAudioUrl: null,
            recordingSeconds: 0,
          }),
          ...updater,
        },
      }));
    },
    [currentQId]
  );

  const formatTimerStr = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopySampleAnswer = () => {
    if (!currentQuestion?.sample_answer) return;
    navigator.clipboard.writeText(currentQuestion.sample_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Pipeline A: Web Audio VAD & Delivery Telemetry Voice Recorder
  const isCurrentLocked = Boolean(currentQId && lockedQuestionIds.has(currentQId));

  const voiceRecorder = useDeliveryVoiceRecorder({
    language: currentQuestion?.language === "en" ? "en-US" : "vi-VN",
  });

  const handleStartVoiceRecording = async () => {
    if (isCurrentLocked) return;
    await voiceRecorder.startRecording();
  };

  const handleStopVoiceRecording = () => {
    const metrics = voiceRecorder.stopRecording();
    updateCurrentAnswer({
      recordedAudioUrl: voiceRecorder.recordedAudioUrl,
      recordingSeconds: metrics ? Math.round(metrics.durationMs / 1000) : voiceRecorder.recordingSeconds,
      delivery_metrics: metrics,
    });
  };

  // Safe aliases for 100% backward-compatibility
  const startRecording = handleStartVoiceRecording;
  const stopRecording = handleStopVoiceRecording;
  const isRecording = voiceRecorder.isRecording;

  // Final Evaluation of Entire Test when finishing:
  // - Multiple Choice: graded purely by answer key (no AI call)
  // - Written STAR text & Spoken voice: graded by AI
  // - Scaled according to formula: Quiz = 15/N, Text = 35/N, Voice = 50/N
  const handleFinalSubmit = async () => {
    setIsEvaluating(true);
    try {
      const newEvaluations: Record<number, AIEvaluationResult> = { ...evaluationsMap };

      for (let i = 0; i < questionsList.length; i++) {
        const q = questionsList[i];
        const qid = q.question_id;
        const ans = answersMap[qid] || {
          selectedOption: null,
          isQuizChecked: false,
          writtenText: "",
          recordedAudioUrl: null,
          recordingSeconds: 0,
        };

        // 1. Multiple Choice: pure deterministic check (NO AI CALL)
        let isCorrect = false;
        let quizPoints = 0;
        if (ans.selectedOption) {
          const opt = q.quiz_data?.options.find((o) => o.id === ans.selectedOption);
          isCorrect = opt ? Boolean(opt.is_correct) : ans.selectedOption === "B";
          quizPoints = isCorrect ? scoreMultipliers.quizMax : 0;
        }

        // 2. Text & Voice: evaluated by AI if provided
        const text = (ans.writtenText || "").trim();
        const words = text ? text.split(/\s+/).length : 0;
        const voiceSec = ans.recordingSeconds || 0;

        let textPoints = 0;
        let voicePoints = 0;
        let evalResult: AIEvaluationResult | null = null;

        if (words > 0 || voiceSec > 0) {
          try {
            evalResult = await catalogApi.evaluateAnswer(qid, {
              type: "quiz",
              answer_text: text || q.sample_answer?.slice(0, 200) || "",
              audio_duration_seconds: voiceSec,
              selected_option_id: ans.selectedOption || undefined,
              is_quiz_correct: isCorrect,
              language: q.language || "vi",
            });
          } catch (err) {
            console.warn("AI evaluation error for question", qid, err);
          }
        }

        // Text scoring
        if (words >= 20) {
          const textPct = evalResult?.modal_breakdown?.text_score
            ? Math.min(1.0, evalResult.modal_breakdown.text_score / 35.0)
            : Math.min(1.0, 0.5 + (words / 150.0) * 0.5);
          textPoints = Number((textPct * scoreMultipliers.textMax).toFixed(1));
        } else if (words > 0) {
          textPoints = Number(((words / 20.0) * 0.35 * scoreMultipliers.textMax).toFixed(1));
        }

        // Voice scoring
        if (voiceSec >= 5) {
          const voicePct = evalResult?.modal_breakdown?.voice_score
            ? Math.min(1.0, evalResult.modal_breakdown.voice_score / 50.0)
            : Math.min(1.0, 0.6 + Math.min(voiceSec, 60.0) / 150.0);
          voicePoints = Number((voicePct * scoreMultipliers.voiceMax).toFixed(1));
        } else if (voiceSec > 0) {
          voicePoints = Number(((voiceSec / 5.0) * 0.3 * scoreMultipliers.voiceMax).toFixed(1));
        }

        const totalQScore = Number(Math.min(scoreMultipliers.pointsPerQuestion, quizPoints + textPoints + voicePoints).toFixed(1));

        newEvaluations[qid] = {
          score: Math.round(totalQScore),
          passed: totalQScore >= Number((scoreMultipliers.pointsPerQuestion * 0.7).toFixed(1)),
          general_feedback: evalResult?.general_feedback || (totalQScore > 0 ? "Bài làm đã được ghi nhận câu trả lời." : "Chưa hoàn thành bài làm cho câu này."),
          star_breakdown: evalResult?.star_breakdown || {
            situation_score: words >= 20 ? 8 : 5,
            situation_feedback: words >= 20 ? "Bối cảnh rõ ràng." : "Nên bổ sung thêm bối cảnh tình huống.",
            task_score: words >= 20 ? 8 : 5,
            task_feedback: words >= 20 ? "Nhiệm vụ rõ ràng." : "Cần làm rõ trách nhiệm cá nhân.",
            action_score: words >= 20 ? 8 : 5,
            action_feedback: words >= 20 ? "Hành động cụ thể, logic." : "Cần nêu rõ các bước giải pháp.",
            result_score: words >= 20 ? 8 : 5,
            result_feedback: words >= 20 ? "Kết quả định lượng tốt." : "Cần bổ sung số liệu đo lường.",
          },
          rubric_scores: [
            {
              criterion_id: "quiz",
              criterion_name: "Trắc nghiệm tình huống (15%)",
              score: isCorrect ? 10 : 0,
              max_score: 10,
              level_label: `${quizPoints}/${scoreMultipliers.quizMax}đ`,
              feedback: isCorrect ? "Lựa chọn phương án tối ưu." : "Chưa chọn phương án chính xác.",
            },
            {
              criterion_id: "text",
              criterion_name: "Tự luận khung STAR (35%)",
              score: Math.min(10, Math.round((textPoints / (scoreMultipliers.textMax || 1)) * 10)),
              max_score: 10,
              level_label: `${textPoints}/${scoreMultipliers.textMax}đ`,
              feedback: words >= 20 ? "Lập luận mạch lạc theo khung STAR." : (words > 0 ? "Bài tự luận quá ngắn (< 20 từ)." : "Chưa làm bài tự luận."),
            },
            {
              criterion_id: "voice",
              criterion_name: "Nói & Ghi âm trực tiếp (50%)",
              score: Math.min(10, Math.round((voicePoints / (scoreMultipliers.voiceMax || 1)) * 10)),
              max_score: 10,
              level_label: `${voicePoints}/${scoreMultipliers.voiceMax}đ`,
              feedback: voiceSec >= 5 ? "Phát biểu rõ ràng, thời lượng tốt." : (voiceSec > 0 ? "Bản ghi âm quá ngắn (< 5 giây)." : "Chưa thực hiện ghi âm nói."),
            },
          ],
          strengths: evalResult?.strengths || ["Đã hoàn thành các phần thi của câu hỏi."],
          improvements: evalResult?.improvements || ["Nên rèn luyện thêm phần nói và bổ sung số liệu thực tế cho phần tự luận."],
          modal_breakdown: {
            quiz_score: quizPoints,
            quiz_max: scoreMultipliers.quizMax,
            text_score: textPoints,
            text_max: scoreMultipliers.textMax,
            voice_score: voicePoints,
            voice_max: scoreMultipliers.voiceMax,
            total_score: totalQScore,
          },
        };
      }

      setEvaluationsMap(newEvaluations);
      setIsFinished(true);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Check incomplete parts for current question before transitioning
  const checkCurrentIncomplete = (): string[] => {
    const issues: string[] = [];
    if (!currentAns.selectedOption) {
      issues.push(`Chưa chọn đáp án Trắc nghiệm tình huống (chiếm 15% điểm = tối đa ${scoreMultipliers.quizMax}đ).`);
    }
    if (currentWordCount === 0) {
      issues.push(`Chưa soạn thảo bài Tự luận theo khung STAR (chiếm 35% điểm = tối đa ${scoreMultipliers.textMax}đ).`);
    } else if (currentWordCount < 20) {
      issues.push(`Bài tự luận hiện có ${currentWordCount} từ (dưới mức tối thiểu 20 từ để AI đánh giá cấu trúc STAR).`);
    }
    if (!currentAns.recordedAudioUrl && currentAns.recordingSeconds < 5) {
      issues.push(`Chưa hoàn thành ghi âm câu trả lời trực tiếp đủ 5 giây (chiếm 50% điểm = tối đa ${scoreMultipliers.voiceMax}đ).`);
    }
    return issues;
  };

  const proceedToTargetQuestion = (targetIndex: number) => {
    if (targetIndex > currentIdx && currentQId) {
      // 1. Enforce Forward-Only Progression Lock
      setLockedQuestionIds((prev) => new Set(prev).add(currentQId));

      // 2. Trigger Pipeline B Background Enqueue (< 15ms latency)
      let isCorrect = false;
      if (currentAns.selectedOption) {
        const opt = currentQuestion?.quiz_data?.options.find((o) => o.id === currentAns.selectedOption);
        isCorrect = opt ? Boolean(opt.is_correct) : currentAns.selectedOption === "B";
      }

      const metrics = currentAns.delivery_metrics || voiceRecorder.deliveryMetrics;
      const durSec = voiceRecorder.recordingSeconds || currentAns.recordingSeconds || 0;

      pullQueue.enqueueQuestionEvaluation(
        {
          question_id: currentQId,
          quiz_answer: currentAns.selectedOption,
          text_answer: currentAns.writtenText,
          delivery_metrics: metrics,
          language: currentQuestion?.language || "vi",
          is_quiz_correct: isCorrect,
          audio_duration_seconds: durSec,
        },
        (result) => {
          setEvaluationsMap((prev) => ({ ...prev, [currentQId]: result }));
        }
      );
    }

    // Always reset to Quiz mode (Part 1) and reset voice recorder when navigating
    setPracticeType("quiz");
    voiceRecorder.reset();

    setCurrentIdx(targetIndex);
  };

  const handleAttemptNavigate = (targetIndex: number) => {
    if (targetIndex === currentIdx || targetIndex < 0 || targetIndex >= totalQuestions) return;

    // Check completeness when moving forward
    if (targetIndex > currentIdx && !isFinished && !isCurrentLocked) {
      const issues = checkCurrentIncomplete();
      if (issues.length > 0) {
        setIncompleteIssues(issues);
        setPendingTargetIdx(targetIndex);
        setShowIncompleteModal(true);
        return;
      }
    }

    proceedToTargetQuestion(targetIndex);
  };

  const handleConfirmSkip = () => {
    setShowIncompleteModal(false);
    if (pendingTargetIdx !== null) {
      proceedToTargetQuestion(pendingTargetIdx);
      setPendingTargetIdx(null);
    }
  };

  const handleAttemptNext = () => {
    if (currentIdx < totalQuestions - 1) {
      handleAttemptNavigate(currentIdx + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleAttemptPrev = () => {
    if (currentIdx > 0) {
      handleAttemptNavigate(currentIdx - 1);
    }
  };

  // Overall Scorecard Stats across all N questions
  const totalSessionStats = useMemo(() => {
    const totalCount = totalQuestions;
    const evaluatedCount = Object.keys(evaluationsMap).length;

    let sumQuiz = 0;
    let sumText = 0;
    let sumVoice = 0;
    let sumTotal = 0;

    Object.values(evaluationsMap).forEach((ev) => {
      if (ev.modal_breakdown) {
        sumQuiz += ev.modal_breakdown.quiz_score;
        sumText += ev.modal_breakdown.text_score;
        sumVoice += ev.modal_breakdown.voice_score;
        sumTotal += ev.modal_breakdown.total_score;
      } else {
        sumTotal += (ev.score || 0) * (scoreMultipliers.pointsPerQuestion / 100.0);
      }
    });

    const roundedTotal = Number(Math.min(100, sumTotal).toFixed(1));
    const isPassed = roundedTotal >= 70;

    return {
      totalCount,
      evaluatedCount,
      totalScore: roundedTotal,
      sumQuiz: Number(sumQuiz.toFixed(1)),
      sumText: Number(sumText.toFixed(1)),
      sumVoice: Number(sumVoice.toFixed(1)),
      isPassed,
    };
  }, [totalQuestions, evaluationsMap, scoreMultipliers]);

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Sparkles size={34} className="animate-spin" style={{ color: "var(--accent-warm)", margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 700, color: "var(--ink-soft)" }}>{t.questions.detail.loadingText}</p>
        </div>
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className={styles.shell}>
        <div className={styles.backNav}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>{t.questions.detail.backToList}</span>
          </Link>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.75)", border: "1px solid rgba(106, 72, 49, 0.15)", marginTop: 20 }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 14px" }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>{t.questions.detail.notFoundTitle}</h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 20px" }}>{loadError || t.questions.detail.notFoundDesc}</p>
          <Link href="/questions" className={styles.btnPracticePrimary}>
            <span>Quay lại Ngân hàng câu hỏi</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // FINAL SCORECARD SUMMARY & REVIEW SCREEN
  // ==========================================
  if (isFinished) {
    return (
      <div className={styles.shell}>
        <div className={styles.backNav}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>{t.questions.detail.backToList}</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>
            <Clock size={15} color="#8b4513" />
            <span>Thời gian hoàn thành: {formatTimerStr(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Scorecard Hero */}
        <div className={styles.contentCard} style={{ textAlign: "center", padding: "40px 24px", marginBottom: 24, background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 238, 222, 0.85))", border: "2px solid rgba(217, 130, 54, 0.35)" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 16px", background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#ffffff", display: "grid", placeItems: "center", fontSize: 34, fontWeight: 900, boxShadow: "0 10px 26px -6px rgba(139, 69, 19, 0.4)" }}>
            {totalSessionStats.totalScore}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px", color: "var(--ink)" }}>
            {totalSessionStats.isPassed ? "Chúc mừng! Bạn đã hoàn thành xuất sắc bài thi" : "Hoàn thành bài thi luyện tập"}
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)" }}>
            Tổng điểm đạt được: <strong>{totalSessionStats.totalScore} / 100đ</strong> ({totalSessionStats.evaluatedCount} / {totalSessionStats.totalCount} câu đã làm)
          </p>

          {/* Breakdown 3 components across whole exam */}
          <div className={styles.scoreGrid3} style={{ maxWidth: 620, margin: "20px auto 14px" }}>
            <div className={styles.scoreItem3}>
              <span className={styles.scoreItem3Title}>Trắc nghiệm (15%)</span>
              <span className={styles.scoreItem3Val}>{totalSessionStats.sumQuiz}<small style={{ fontSize: 12, fontWeight: 700 }}>/15đ</small></span>
            </div>
            <div className={styles.scoreItem3}>
              <span className={styles.scoreItem3Title}>Tự luận STAR (35%)</span>
              <span className={styles.scoreItem3Val}>{totalSessionStats.sumText}<small style={{ fontSize: 12, fontWeight: 700 }}>/35đ</small></span>
            </div>
            <div className={styles.scoreItem3}>
              <span className={styles.scoreItem3Title}>Ghi âm nói (50%)</span>
              <span className={styles.scoreItem3Val}>{totalSessionStats.sumVoice}<small style={{ fontSize: 12, fontWeight: 700 }}>/50đ</small></span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => {
                setEvaluationsMap({});
                setAnswersMap({});
                setCurrentIdx(0);
                setIsFinished(false);
                setElapsedSeconds(0);
              }}
              className={styles.copyBtn}
              style={{ fontSize: 13, padding: "9px 20px" }}
            >
              <RotateCcw size={14} />
              <span>Làm lại bài thi từ đầu</span>
            </button>
            <Link href="/questions" className={styles.btnPracticePrimary} style={{ padding: "10px 24px", fontSize: 13 }}>
              <span>Trở về Ngân hàng câu hỏi</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Question-by-Question Review List */}
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "var(--ink)" }}>
          Xem lại đáp án & Báo cáo chấm điểm từng câu ({questionsList.length} câu)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {questionsList.map((item, idx) => {
            const ev = evaluationsMap[item.question_id];
            const ans = answersMap[item.question_id];
            const mb = ev?.modal_breakdown;
            const chosenOpt = item.quiz_data?.options.find((o) => o.id === ans?.selectedOption);
            const correctOpt = item.quiz_data?.options.find((o) => o.is_correct);

            return (
              <div
                key={item.question_id}
                className={styles.contentCard}
                style={{ marginBottom: 0, padding: "26px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid rgba(106, 72, 49, 0.12)", paddingBottom: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513" }}>
                        Câu #{idx + 1}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)" }}>
                        {item.role_name || "Chuyên ngành"}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
                      {item.question_text}
                    </h4>
                  </div>

                  <div className={styles.scoreBadge} style={{ padding: "6px 16px" }}>
                    <span className={styles.scoreNumber} style={{ fontSize: 20 }}>{mb?.total_score || 0}</span>
                    <span className={styles.scoreTotal} style={{ fontSize: 12 }}>/{scoreMultipliers.pointsPerQuestion}đ</span>
                  </div>
                </div>

                {/* Sub-scores breakdown */}
                {mb && (
                  <div className={styles.scoreGrid3} style={{ margin: "0 0 16px" }}>
                    <div className={styles.scoreItem3} style={{ padding: "10px 14px" }}>
                      <span className={styles.scoreItem3Title}>Trắc nghiệm (15%)</span>
                      <span className={styles.scoreItem3Val} style={{ fontSize: 16 }}>{mb.quiz_score}/{scoreMultipliers.quizMax}đ</span>
                    </div>
                    <div className={styles.scoreItem3} style={{ padding: "10px 14px" }}>
                      <span className={styles.scoreItem3Title}>Tự luận (35%)</span>
                      <span className={styles.scoreItem3Val} style={{ fontSize: 16 }}>{mb.text_score}/{scoreMultipliers.textMax}đ</span>
                    </div>
                    <div className={styles.scoreItem3} style={{ padding: "10px 14px" }}>
                      <span className={styles.scoreItem3Title}>Ghi âm nói (50%)</span>
                      <span className={styles.scoreItem3Val} style={{ fontSize: 16 }}>{mb.voice_score}/{scoreMultipliers.voiceMax}đ</span>
                    </div>
                  </div>
                )}

                {/* 1. Quiz Review & Explanation */}
                <div style={{ marginBottom: 14, padding: "14px 16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                    <CheckSquare size={15} color="#d98236" />
                    <span>Kết quả Trắc nghiệm:</span>
                    {chosenOpt?.is_correct ? (
                      <span style={{ color: "#059669", fontSize: 12 }}>✓ Chính xác (+{scoreMultipliers.quizMax}đ)</span>
                    ) : (
                      <span style={{ color: "#dc2626", fontSize: 12 }}>✗ Chưa chính xác (0đ)</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                    <div>• Bạn đã chọn: <strong>{ans?.selectedOption || "Chưa chọn"}</strong> {chosenOpt ? `- ${chosenOpt.text}` : ""}</div>
                    {correctOpt && <div>• Đáp án đúng: <strong>{correctOpt.id}</strong> - {correctOpt.text}</div>}
                    {item.quiz_data?.explanation && (
                      <div style={{ marginTop: 6, fontStyle: "italic", color: "var(--ink)" }}>
                        💡 <strong>Giải thích:</strong> {item.quiz_data.explanation}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Text Review & AI Feedback */}
                <div style={{ marginBottom: 14, padding: "14px 16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                    <FileText size={15} color="#d98236" />
                    <span>Bài Tự luận STAR ({ans?.writtenText?.trim().split(/\s+/).filter(Boolean).length || 0} từ):</span>
                    <span style={{ color: "#d98236", fontSize: 12 }}>{mb?.text_score || 0}/{scoreMultipliers.textMax}đ</span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "var(--ink)", fontStyle: "italic", lineHeight: 1.6 }}>
                    {ans?.writtenText ? `"${ans.writtenText}"` : "(Chưa làm bài tự luận)"}
                  </p>
                  {ev?.general_feedback && (
                    <div style={{ fontSize: 12, color: "#8b4513", background: "rgba(217, 130, 54, 0.08)", padding: "8px 12px", borderRadius: "10px" }}>
                      🤖 <strong>AI Nhận xét:</strong> {ev.general_feedback}
                    </div>
                  )}
                </div>

                {/* 3. Voice Review */}
                <div style={{ padding: "14px 16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                    <Mic size={15} color="#d98236" />
                    <span>Ghi âm giọng nói ({ans?.recordingSeconds || 0}s):</span>
                    <span style={{ color: "#d98236", fontSize: 12 }}>{mb?.voice_score || 0}/{scoreMultipliers.voiceMax}đ</span>
                  </div>
                  {ans?.recordedAudioUrl ? (
                    <audio src={ans.recordedAudioUrl} controls style={{ width: "100%", maxWidth: 360, height: 36, marginTop: 4 }} />
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>(Chưa ghi âm cho câu này)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  const star = currentQuestion.star_template;
  const theme = getDomainTheme(currentQuestion.domain_id, currentQuestion.domain_name);

  return (
    <div className={styles.shell}>
      {/* Top Navigation & Breadcrumbs */}
      <div className={styles.backNav}>
        <Link href="/questions" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>{t.questions.detail.backToList}</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={handleCopyLink}
            className={styles.copyBtn}
            style={{ fontSize: 12, padding: "6px 14px" }}
            title="Sao chép đường dẫn câu hỏi này"
          >
            {copiedLink ? (
              <>
                <Check size={13} color="#10b981" />
                <span style={{ color: "#10b981", fontWeight: 800 }}>Đã sao chép link!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Chia sẻ link</span>
              </>
            )}
          </button>

          <div className={styles.breadcrumbs}>
            <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>
              {t.questions.detail.breadcrumbRoot}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span>{currentQuestion.role_name || "Chuyên ngành"}</span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 800 }}>#{currentQuestion.question_id}</span>
          </div>
        </div>
      </div>

      {/* Hero Question Card with Domain Visual */}
      <div className={styles.heroCard}>
        <div className={styles.heroCardHeader}>
          <div className={styles.heroDomainThumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.imageUrl}
              alt={theme.name}
              className={styles.heroDomainThumbImg}
              onError={(e) => {
                e.currentTarget.src = theme.localFallback;
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className={styles.badgeRow}>
              {currentQuestion.domain_name && (
                <span className={styles.badge}>{currentQuestion.domain_name}</span>
              )}
              {currentQuestion.role_name && (
                <span className={`${styles.badge} ${styles.badgeRole}`}>
                  {currentQuestion.role_name}
                </span>
              )}
              <span className={styles.badge} style={{ background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8" }}>
                {locale === "vi" ? "Cấp độ:" : "Level:"} {currentQuestion.experience_level ? currentQuestion.experience_level.toUpperCase() : "GENERAL"}
              </span>
              <span className={styles.badge} style={{ background: "rgba(168, 85, 247, 0.12)", color: "#7e22ce" }}>
                {locale === "vi" ? "Dạng đề:" : "Type:"} {currentQuestion.question_type ? currentQuestion.question_type.toUpperCase() : "BEHAVIORAL"}
              </span>
              <span className={styles.badge}>
                {currentQuestion.language === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-deep)" }}>
              ✦ {locale === "vi" ? "Chuyên ngành:" : "Domain:"} {theme.shortName}
            </div>
          </div>
        </div>

        <h1 className={styles.questionTitle}>
          &ldquo;{currentQuestion.question_text}&rdquo;
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabsNav} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "star"}
          onClick={() => setActiveTab("star")}
          className={`${styles.tabBtn} ${activeTab === "star" ? styles.tabBtnActive : ""}`}
        >
          <Sparkles size={15} />
          <span>{t.questions.detail.starTab}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "rubric"}
          onClick={() => setActiveTab("rubric")}
          className={`${styles.tabBtn} ${activeTab === "rubric" ? styles.tabBtnActive : ""}`}
        >
          <Award size={15} />
          <span>{t.questions.detail.rubricTab}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "followup"}
          onClick={() => setActiveTab("followup")}
          className={`${styles.tabBtn} ${activeTab === "followup" ? styles.tabBtnActive : ""}`}
        >
          <HelpCircle size={15} />
          <span>{t.questions.detail.followupTab}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "practice"}
          onClick={() => setActiveTab("practice")}
          className={`${styles.tabBtn} ${activeTab === "practice" ? styles.tabBtnActive : ""}`}
        >
          <Sparkles size={15} />
          <span>{t.questions.detail.practiceTab}</span>
        </button>
      </div>

      {/* Top Practice Prompt Banner - Chỉ hiển thị khi ở 3 tab còn lại (star, rubric, followup) */}
      {activeTab !== "practice" && (
        <div className={styles.topActionBanner}>
          <div className={styles.actionLeft}>
            <div className={styles.actionIconBubble}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className={styles.actionTitle}>{t.questions.detail.stickyTitle}</div>
              <div className={styles.actionSub}>{t.questions.detail.stickySub}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("practice")}
            className={styles.btnPracticePrimary}
          >
            <Sparkles size={16} />
            <span>{t.questions.detail.practiceNowBtn}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* TAB 1: KHUNG TRẢ LỜI STAR */}
      {activeTab === "star" && (
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={20} style={{ color: "var(--accent-warm)" }} />
              <span>{star?.title || t.questions.detail.starDefaultTitle}</span>
            </h2>
            <p className={styles.sectionSubtitle}>{t.questions.detail.starExplanation}</p>
          </div>

          <div className={styles.starGrid}>
            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterS}`}>S</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starS}</div>
              </div>
              <p className={styles.starStepDesc}>{star?.situation_guide || t.questions.detail.starSDesc}</p>
            </div>

            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterT}`}>T</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starT}</div>
              </div>
              <p className={styles.starStepDesc}>{star?.task_guide || t.questions.detail.starTDesc}</p>
            </div>

            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterA}`}>A</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starA}</div>
              </div>
              <p className={styles.starStepDesc}>{star?.action_guide || t.questions.detail.starADesc}</p>
            </div>

            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterR}`}>R</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starR}</div>
              </div>
              <p className={styles.starStepDesc}>{star?.result_guide || t.questions.detail.starRDesc}</p>
            </div>
          </div>

          {currentQuestion.sample_answer && (
            <div className={styles.sampleAnswerBox}>
              <div className={styles.sampleAnswerHeader}>
                <div className={styles.sampleAnswerTitle}>
                  <BookOpen size={16} />
                  <span>{t.questions.detail.modelAnswerTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySampleAnswer}
                  className={styles.copyBtn}
                  title="Sao chép nội dung câu trả lời"
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      <span>{t.questions.detail.copiedAnswer}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{t.questions.detail.copyAnswer}</span>
                    </>
                  )}
                </button>
              </div>
              <p className={styles.sampleAnswerText}>
                &ldquo;{currentQuestion.sample_answer}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIÊU CHUẨN CHẤM ĐIỂM RUBRIC */}
      {activeTab === "rubric" && (
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Award size={20} style={{ color: "var(--accent-warm)" }} />
              <span>{t.questions.detail.rubricTitle}</span>
            </h2>
            <p className={styles.sectionSubtitle}>{t.questions.detail.rubricSubtitle}</p>
          </div>

          <div className={styles.rubricList}>
            {(currentQuestion.rubric_criteria || []).map((criterion) => (
              <div key={criterion.criterion_id} className={styles.rubricItem}>
                <div className={styles.rubricItemHeader}>
                  <span className={styles.rubricItemTitle}>{criterion.title}</span>
                  <span className={styles.rubricItemWeight}>{t.questions.detail.weightLabel} {criterion.weight}%</span>
                </div>
                <p className={styles.rubricItemDesc}>{criterion.description}</p>

                <div className={styles.descriptorGrid}>
                  <div className={styles.descriptorCard}>
                    <span className={`${styles.descriptorScore} ${styles.descriptorPoor}`}>
                      {criterion.descriptors.poor.label} ({criterion.descriptors.poor.score_range}đ)
                    </span>
                    <p className={styles.descriptorText}>{criterion.descriptors.poor.description}</p>
                  </div>

                  <div className={styles.descriptorCard}>
                    <span className={`${styles.descriptorScore} ${styles.descriptorAverage}`}>
                      {criterion.descriptors.average.label} ({criterion.descriptors.average.score_range}đ)
                    </span>
                    <p className={styles.descriptorText}>{criterion.descriptors.average.description}</p>
                  </div>

                  <div className={styles.descriptorCard}>
                    <span className={`${styles.descriptorScore} ${styles.descriptorGood}`}>
                      {criterion.descriptors.good.label} ({criterion.descriptors.good.score_range}đ)
                    </span>
                    <p className={styles.descriptorText}>{criterion.descriptors.good.description}</p>
                  </div>

                  <div className={styles.descriptorCard}>
                    <span className={`${styles.descriptorScore} ${styles.descriptorExcellent}`}>
                      {criterion.descriptors.excellent.label} ({criterion.descriptors.excellent.score_range}đ)
                    </span>
                    <p className={styles.descriptorText}>{criterion.descriptors.excellent.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CÂU HỎI ĐÀO SÂU */}
      {activeTab === "followup" && (
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <HelpCircle size={20} style={{ color: "var(--accent-warm)" }} />
              <span>{t.questions.detail.followupTitle}</span>
            </h2>
            <p className={styles.sectionSubtitle}>{t.questions.detail.followupSubtitle}</p>
          </div>

          <div className={styles.followUpList}>
            {(currentQuestion.follow_up_questions || [
              "Tại sao bạn lại lựa chọn giải pháp đó mà không phải là một phương án thay thế khác?",
              "Nếu được làm lại từ đầu với những gì đã biết, bạn sẽ thay đổi điều gì?",
            ]).map((qText, idx) => (
              <div key={idx} className={styles.followUpItem}>
                <span className={styles.followUpBullet}>0{idx + 1}.</span>
                <span>{qText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LUYỆN TẬP & AI CHẤM ĐIỂM */}
      {activeTab === "practice" && (
        <div className={styles.contentCard} id="practice-workspace">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={20} style={{ color: "var(--accent-warm)" }} />
              <span>{t.questions.detail.practiceTab}</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              {locale === "vi"
                ? "Thực hành ngay với 3 hình thức: Trắc nghiệm (15%), Tự luận STAR (35%) và Ghi âm trực tiếp (50%). Làm xong toàn bộ bài thi mới nộp chấm điểm."
                : "Practice via 3 modes: Situational Quiz (15%), STAR Essay (35%), and Voice Recording (50%). Final evaluation occurs upon submitting the complete test."}
            </p>
          </div>

          {/* =====================================================
              ROW MATCHING IMAGE #1 EXACTLY:
              - LEFT: 3 Mode Pills (Quiz 15% | Text 35% | Voice 50%)
              - RIGHT (RED BOX): Stepper [← ( 1 ) ( 2 ) ... →] (only when totalQuestions > 1)
          ====================================================== */}
          <div className={styles.practiceHeaderRow}>
            {/* Left: 3 Answer Mode Selector Pills */}
            <div className={styles.practiceModeSelector} style={{ marginBottom: 0 }}>
              <button
                type="button"
                onClick={() => setPracticeType("quiz")}
                className={`${styles.practiceModeBtn} ${
                  practiceType === "quiz" ? styles.practiceModeBtnActive : ""
                }`}
              >
                <CheckSquare size={16} />
                <span>{t.questions.detail.practiceModes.quiz} (15%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPracticeType("text")}
                className={`${styles.practiceModeBtn} ${
                  practiceType === "text" ? styles.practiceModeBtnActive : ""
                }`}
              >
                <FileText size={16} />
                <span>{t.questions.detail.practiceModes.text} (35%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPracticeType("voice")}
                className={`${styles.practiceModeBtn} ${
                  practiceType === "voice" ? styles.practiceModeBtnActive : ""
                }`}
              >
                <Mic size={16} />
                <span>{t.questions.detail.practiceModes.voice} (50%)</span>
              </button>
            </div>

            {/* Right: Question Stepper Row (Hidden if single question) */}
            {totalQuestions > 1 && (
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  disabled={currentIdx <= 0}
                  onClick={handleAttemptPrev}
                  className={styles.stepperNavBtn}
                  aria-label="Câu trước"
                >
                  <ChevronLeft size={16} />
                </button>

                {questionsList.map((item, idx) => {
                  const isActive = idx === currentIdx;
                  const itemAns = answersMap[item.question_id];
                  const isDone = Boolean(evaluationsMap[item.question_id]) || Boolean(itemAns?.selectedOption || itemAns?.writtenText || itemAns?.recordedAudioUrl);
                  const isLocked = lockedQuestionIds.has(item.question_id);
                  return (
                    <button
                      key={item.question_id}
                      type="button"
                      onClick={() => handleAttemptNavigate(idx)}
                      className={`${styles.stepperCircle} ${
                        isActive ? styles.stepperCircleActive : ""
                      } ${isDone ? styles.stepperCircleDone : ""}`}
                      title={isLocked ? `Câu #${idx + 1} (Đã khóa một chiều)` : `Câu #${idx + 1}`}
                    >
                      {isLocked ? <Lock size={10} style={{ marginRight: 2 }} /> : null}
                      <span>{idx + 1}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentIdx >= totalQuestions - 1}
                  onClick={handleAttemptNext}
                  className={styles.stepperNavBtn}
                  aria-label="Câu kế tiếp"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* MODE 1: TRẮC NGHIỆM TÌNH HUỐNG (15% ĐIỂM) */}
          {practiceType === "quiz" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                    {t.questions.detail.quizTitle}
                  </h3>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-deep)", padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.12)" }}>
                    Trọng số: 15% (Tối đa {scoreMultipliers.quizMax}đ)
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  {t.questions.detail.quizSubtitle}
                </p>
              </div>

              {/* Quiz Options - Candidate simply clicks to choose answer (NO immediate checking or explanation during test) */}
              <div className={styles.quizOptionsList}>
                {(
                  currentQuestion.quiz_data?.options || [
                    { id: "A", text: "Tập trung giải thích nhanh phần kết quả và bỏ qua bối cảnh ban đầu.", is_correct: false, explanation: "Bỏ qua bối cảnh khiến người nghe không đánh giá được quy mô và độ khó của vấn đề." },
                    { id: "B", text: "Áp dụng cấu trúc STAR: Nêu bối cảnh (S), làm rõ vai trò (T), hành động cụ thể (A) và dẫn chứng số liệu định lượng (R).", is_correct: true, explanation: "Đây là cách tiếp cận chuẩn mực giúp câu trả lời logic, thuyết phục và làm nổi bật năng lực cá nhân." },
                    { id: "C", text: "Đổ lỗi cho hoàn cảnh hoặc đồng nghiệp để chứng minh bản thân luôn làm đúng.", is_correct: false, explanation: "Thái độ đổ lỗi là điểm trừ rất lớn trong phỏng vấn hành vi." },
                    { id: "D", text: "Chỉ trả lời một câu ngắn gọn và chờ người phỏng vấn tự hỏi tiếp.", is_correct: false, explanation: "Quá thụ động, không thể hiện được chiều sâu tư duy và kỹ năng giao tiếp." },
                  ]
                ).map((opt) => {
                  const isSelected = currentAns.selectedOption === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (isCurrentLocked) return;
                        updateCurrentAnswer({ selectedOption: opt.id });
                      }}
                      style={isCurrentLocked ? { cursor: "not-allowed", opacity: isSelected ? 1 : 0.6 } : {}}
                      className={`${styles.quizOptionCard} ${isSelected ? styles.quizOptionSelected : ""}`}
                    >
                      <div
                        className={`${styles.quizOptionBadge} ${
                          isSelected ? styles.quizOptionBadgeSelected : ""
                        }`}
                      >
                        {opt.id}
                      </div>
                      <div className={styles.quizOptionText}>{opt.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: TRẢ LỜI TỰ LUẬN THEO STAR (35% ĐIỂM) */}
          {practiceType === "text" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                    {t.questions.detail.textTitle}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-deep)", padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.12)" }}>
                      Trọng số: 35% (Tối đa {scoreMultipliers.textMax}đ)
                    </span>
                    {currentWordCount >= 20 ? (
                      <span className={styles.goodBadge}><Check size={11} /> {currentWordCount} từ</span>
                    ) : (
                      <span className={styles.warnBadge}><AlertTriangle size={11} /> {currentWordCount}/20 từ</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  {t.questions.detail.textSubtitle}
                </p>
              </div>

              {/* STAR Prompt Helper Chips */}
              <div className={styles.starPromptHints}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", alignSelf: "center", marginRight: 4 }}>
                  Chèn mẫu gợi ý:
                </span>
                <button
                  type="button"
                  disabled={isCurrentLocked}
                  onClick={() => !isCurrentLocked && updateCurrentAnswer({ writtenText: currentAns.writtenText + (currentAns.writtenText ? "\n\n" : "") + "• Tình huống (Situation): " })}
                  className={styles.starPromptChip}
                  style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  + Tình huống (S)
                </button>
                <button
                  type="button"
                  disabled={isCurrentLocked}
                  onClick={() => !isCurrentLocked && updateCurrentAnswer({ writtenText: currentAns.writtenText + (currentAns.writtenText ? "\n\n" : "") + "• Nhiệm vụ (Task): " })}
                  className={styles.starPromptChip}
                  style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  + Nhiệm vụ (T)
                </button>
                <button
                  type="button"
                  disabled={isCurrentLocked}
                  onClick={() => !isCurrentLocked && updateCurrentAnswer({ writtenText: currentAns.writtenText + (currentAns.writtenText ? "\n\n" : "") + "• Hành động (Action): " })}
                  className={styles.starPromptChip}
                  style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  + Hành động (A)
                </button>
                <button
                  type="button"
                  disabled={isCurrentLocked}
                  onClick={() => !isCurrentLocked && updateCurrentAnswer({ writtenText: currentAns.writtenText + (currentAns.writtenText ? "\n\n" : "") + "• Kết quả (Result): " })}
                  className={styles.starPromptChip}
                  style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  + Kết quả (R)
                </button>
              </div>

              <div className={styles.answerTextareaWrapper}>
                <textarea
                  className={styles.answerTextarea}
                  value={currentAns.writtenText}
                  readOnly={isCurrentLocked}
                  onChange={(e) => !isCurrentLocked && updateCurrentAnswer({ writtenText: e.target.value })}
                  placeholder={isCurrentLocked ? "Câu hỏi này đã hoàn thành và khóa một chiều. Bạn chỉ có thể xem lại, không thể chỉnh sửa." : t.questions.detail.textPlaceholder}
                  style={isCurrentLocked ? { background: "rgba(0, 0, 0, 0.03)", cursor: "not-allowed" } : {}}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-muted)", padding: "0 4px" }}>
                  <span>{currentWordCount} từ • {currentAns.writtenText.length} ký tự</span>
                  <span>Yêu cầu tối thiểu: 20 từ (Khuyến nghị 150 - 600 từ)</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: GHI ÂM GIỌNG NÓI (50% ĐIỂM) */}
          {practiceType === "voice" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                    {t.questions.detail.voiceTitle}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-deep)", padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.12)" }}>
                      Trọng số: 50% (Tối đa {scoreMultipliers.voiceMax}đ)
                    </span>
                    {currentAns.recordingSeconds >= 5 ? (
                      <span className={styles.goodBadge}><Check size={11} /> {currentAns.recordingSeconds}s</span>
                    ) : (
                      <span className={styles.warnBadge}><AlertTriangle size={11} /> {currentAns.recordingSeconds}/5s</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  {t.questions.detail.voiceSubtitle}
                </p>
              </div>

              <div className={styles.voiceBox}>
                {/* Silent Recording UX - Calm, focused, background-only tracking */}
                <div style={{ fontSize: 12, fontWeight: 700, color: voiceRecorder.isRecording ? "#10b981" : "var(--ink-soft)", marginBottom: 8 }}>
                  {voiceRecorder.isRecording
                    ? "🎙️ Đang ghi âm câu trả lời của bạn..."
                    : (currentAns.recordedAudioUrl || voiceRecorder.recordedAudioUrl)
                    ? "✓ Bản ghi âm đã hoàn thành"
                    : "Nhấn micro để bắt đầu phát biểu"}
                </div>

                <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent-deep)" }}>
                  {formatTimerStr(voiceRecorder.isRecording ? voiceRecorder.recordingSeconds : currentAns.recordingSeconds)}
                </div>

                <div className={styles.waveBars}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.waveBar} ${voiceRecorder.isRecording ? styles.waveBarActive : ""}`}
                      style={{
                        height: voiceRecorder.isRecording
                          ? `${8 + Math.round((voiceRecorder.volumeLevel / 100) * 32)}px`
                          : "8px",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  {!voiceRecorder.isRecording ? (
                    <button
                      type="button"
                      disabled={isCurrentLocked}
                      onClick={handleStartVoiceRecording}
                      className={styles.recordBtn}
                      style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    >
                      <Mic size={18} />
                      <span>{isCurrentLocked ? "Đã khóa ghi âm" : currentAns.recordedAudioUrl ? "Ghi âm lại" : t.questions.detail.startRecording}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopVoiceRecording}
                      className={`${styles.recordBtn} ${styles.recordBtnActive}`}
                    >
                      <Square size={18} fill="#ffffff" />
                      <span>{t.questions.detail.stopRecording}</span>
                    </button>
                  )}
                </div>



                {currentAns.recordedAudioUrl && (
                  <div style={{ marginTop: 12, width: "100%", maxWidth: 360 }}>
                    <audio src={currentAns.recordedAudioUrl} controls style={{ width: "100%" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM NAVIGATION CONTROLS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(106, 72, 49, 0.12)" }}>
            <button
              type="button"
              disabled={currentIdx <= 0}
              onClick={handleAttemptPrev}
              className={styles.copyBtn}
              style={{ opacity: currentIdx <= 0 ? 0.4 : 1, pointerEvents: currentIdx <= 0 ? "none" : "auto", fontSize: 13, padding: "10px 20px" }}
            >
              ← Câu trước
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleAttemptNext}
                className={styles.btnPracticePrimary}
              >
                <span>Câu kế tiếp →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className={styles.btnPracticePrimary}
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <CheckCircle2 size={16} />
                <span>Nộp bài & Xem tổng kết</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* EVALUATING LOADING MODAL (WHEN SUBMITTING THE ENTIRE TEST) */}
      {isEvaluating && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ textAlign: "center", maxWidth: "440px" }}>
            <Sparkles size={40} className="animate-spin" style={{ color: "var(--accent-warm)", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 6px" }}>
              AI Coach đang chấm điểm bài thi...
            </h3>
            <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>
              Đang tự động chấm trắc nghiệm và sử dụng AI chấm bài tự luận STAR cùng kỹ năng nói cho {totalQuestions} câu hỏi.
            </p>
          </div>
        </div>
      )}

      {/* PRE-TRANSITION INCOMPLETE WARNING MODAL */}
      {showIncompleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowIncompleteModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              <AlertTriangle size={22} color="#ea580c" />
              <span>Câu hỏi này còn phần chưa hoàn thành!</span>
            </h3>

            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              Điểm số câu này được cấu thành từ 3 phần: Trắc nghiệm (15%), Tự luận (35%) và Giọng nói (50%). Hiện tại câu hỏi đang có các phần chưa đạt chuẩn:
            </p>

            <div className={styles.warningIssueList}>
              {incompleteIssues.map((issue, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#ea580c", fontWeight: 800 }}>•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>

            <p style={{ margin: 0, fontSize: 12.5, color: "#b45309", fontWeight: 700 }}>
              ⚠️ Lưu ý quy tắc khóa một chiều: Sau khi chuyển sang câu tiếp theo, câu này sẽ bị KHÓA và bạn chỉ có thể xem lại, không thể chỉnh sửa đáp án được nữa.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className={styles.copyBtn}
                style={{ padding: "8px 18px" }}
              >
                <span>Ở lại hoàn thiện</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSkip}
                className={styles.btnPracticePrimary}
                style={{ background: "#ea580c", padding: "8px 20px" }}
              >
                <span>Vẫn tiếp tục bỏ qua →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
