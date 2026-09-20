"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  CheckCircle,
  CheckSquare,
  FileText,
  HelpCircle,
  Lightbulb,
  Mic,
  RotateCcw,
  Send,
  Square,
  XCircle,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  AlertTriangle,
  AlertCircle,
  Layers,
  Lock,
} from "lucide-react";
import { useQuestionPracticeSession } from "@/hooks/useQuestionPracticeSession";
import { useDeliveryVoiceRecorder } from "@/hooks/useDeliveryVoiceRecorder";
import { useEvaluationPullQueue } from "@/hooks/useEvaluationPullQueue";
import type { DeliveryMetrics } from "@/types/delivery";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useI18n } from "@/context/I18nContext";
import { catalogApi } from "@/services/catalogApi";
import { getDomainTheme, getLocalizedRoleName } from "@/constants/domainThemes";
import styles from "./practiceWorkspace.module.css";

export default function PracticeWorkspaceClient() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { isSubscribed } = useUserSubscription();

  const session = useQuestionPracticeSession();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const pullQueue = useEvaluationPullQueue();
  const currentQId = session.currentQuestion?.question_id || 0;
  const isCurrentLocked = Boolean(session.isQuestionLocked(currentQId));

  const voiceRecorder = useDeliveryVoiceRecorder({
    language: session.currentQuestion?.language === "en" ? "en-US" : "vi-VN",
  });

  // Collapsible STAR Guidance Accordion
  const [showGuidance, setShowGuidance] = useState(false);

  // Question multi-modal inputs state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuizChecked, setIsQuizChecked] = useState(false);
  const [writtenText, setWrittenText] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Evaluation loading state
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Incomplete warning modal state
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteIssues, setIncompleteIssues] = useState<string[]>([]);
  const [pendingTargetIndex, setPendingTargetIndex] = useState<number | null>(null);

  // Sync state when current question changes
  useEffect(() => {
    if (!session.currentQuestion) return;
    const qid = session.currentQuestion.question_id;
    const savedAns = session.answers[qid];

    if (savedAns) {
      setSelectedOption(savedAns.selected_option_id || null);
      setIsQuizChecked(Boolean(savedAns.selected_option_id));
      setWrittenText(savedAns.written_text || "");
      setRecordedAudioUrl(savedAns.audio_url || null);
      setRecordingSeconds(savedAns.audio_duration_seconds || 0);
    } else {
      setSelectedOption(null);
      setIsQuizChecked(false);
      setWrittenText("");
      setRecordedAudioUrl(null);
      setRecordingSeconds(0);
    }
  }, [session.currentIndex, session.currentQuestion]);

  const wordCount = useMemo(() => {
    const trimmed = writtenText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [writtenText]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyShareLink = () => {
    if (session.shareableUrl) {
      navigator.clipboard.writeText(session.shareableUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const startVoiceRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Trình duyệt chưa hỗ trợ ghi âm microphone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Không thể kết nối microphone. Vui lòng cấp quyền trong trình duyệt.");
    }
  };

  const handleStartVoice = async () => {
    if (isCurrentLocked) return;
    await voiceRecorder.startRecording();
  };

  const handleStopVoice = () => {
    const metrics = voiceRecorder.stopRecording();
    if (session.currentQuestion) {
      const qid = session.currentQuestion.question_id;
      session.saveAnswer(qid, {
        mode: "voice",
        selected_option_id: selectedOption,
        written_text: writtenText,
        audio_url: voiceRecorder.recordedAudioUrl,
        audio_duration_seconds: metrics ? Math.round(metrics.durationMs / 1000) : voiceRecorder.recordingSeconds,
        delivery_metrics: metrics,
        submitted_at: new Date().toISOString(),
      });
    }
  };

  // Check incomplete items of current question
  const checkCurrentIncomplete = (): string[] => {
    const issues: string[] = [];
    if (!selectedOption) {
      issues.push("Chưa chọn đáp án Trắc nghiệm tình huống (chiếm 15% tổng điểm câu hỏi).");
    }
    if (wordCount === 0) {
      issues.push("Chưa soạn thảo bài Tự luận theo khung STAR (chiếm 35% tổng điểm câu hỏi).");
    } else if (wordCount < 20) {
      issues.push(`Bài tự luận hiện chỉ có ${wordCount} từ (dưới mức tối thiểu 20 từ để AI phân tích cấu trúc STAR).`);
    }
    if (!recordedAudioUrl && recordingSeconds < 5) {
      issues.push("Chưa hoàn thành ghi âm câu trả lời trực tiếp đủ 5 giây (chiếm 50% tổng điểm câu hỏi).");
    }
    return issues;
  };

  // Forward-Only Progression Lock & Pipeline B Background Enqueue
  const proceedWithNavigation = (targetIdx: number) => {
    if (!session.currentQuestion) return;
    const qid = session.currentQuestion.question_id;

    // If moving forward, lock the current question immediately
    if (targetIdx > session.currentIndex) {
      session.lockQuestion(qid);

      // Trigger Pipeline B Background Enqueue (< 15ms latency, non-blocking)
      if (!session.evaluations[qid]) {
        let isCorrect: boolean | undefined = undefined;
        if (selectedOption) {
          const opt = session.currentQuestion.quiz_data?.options.find((o) => o.id === selectedOption);
          isCorrect = opt ? opt.is_correct : (selectedOption === "B");
        }

        const metrics = session.answers[qid]?.delivery_metrics || voiceRecorder.deliveryMetrics;
        const durSec = voiceRecorder.recordingSeconds || session.answers[qid]?.audio_duration_seconds || 0;

        pullQueue.enqueueQuestionEvaluation(
          {
            question_id: qid,
            quiz_answer: selectedOption,
            text_answer: writtenText,
            delivery_metrics: metrics,
            language: session.currentQuestion.language || "vi",
            is_quiz_correct: isCorrect,
            audio_duration_seconds: durSec,
          },
          (evalResult) => {
            session.saveEvaluation(qid, evalResult);
          }
        );
      }
    }

    session.goToIndex(targetIdx);
  };

  const handleAttemptNavigate = (targetIdx: number) => {
    if (targetIdx === session.currentIndex) return;

    // When moving forward, if current question is not locked and not evaluated, check completeness
    if (targetIdx > session.currentIndex && !isCurrentLocked && !session.currentEvaluation) {
      const issues = checkCurrentIncomplete();
      if (issues.length > 0) {
        setIncompleteIssues(issues);
        setPendingTargetIndex(targetIdx);
        setShowIncompleteModal(true);
        return;
      }
    }

    proceedWithNavigation(targetIdx);
  };

  const handleConfirmSkip = () => {
    setShowIncompleteModal(false);
    if (pendingTargetIndex !== null) {
      proceedWithNavigation(pendingTargetIndex);
      setPendingTargetIndex(null);
    }
  };

  const handleAttemptNext = () => {
    if (session.currentIndex < session.totalQuestions - 1) {
      handleAttemptNavigate(session.currentIndex + 1);
    } else {
      session.finishSession();
    }
  };

  const handleAttemptPrev = () => {
    if (session.currentIndex > 0) {
      handleAttemptNavigate(session.currentIndex - 1);
    }
  };

  const handleSubmitForEvaluation = async () => {
    if (!session.currentQuestion) return;
    const qid = session.currentQuestion.question_id;

    // Determine quiz correctness
    let isCorrect: boolean | undefined = undefined;
    if (selectedOption) {
      const opt = session.currentQuestion.quiz_data?.options.find((o) => o.id === selectedOption);
      isCorrect = opt ? opt.is_correct : (selectedOption === "B");
    }

    setIsEvaluating(true);
    try {
      const evalResult = await catalogApi.evaluateAnswer(qid, {
        type: "quiz",
        answer_text: writtenText || session.currentQuestion.sample_answer?.slice(0, 200) || "",
        audio_duration_seconds: recordingSeconds,
        selected_option_id: selectedOption || undefined,
        is_quiz_correct: isCorrect,
        language: session.currentQuestion.language || "vi",
      });

      session.saveAnswer(qid, {
        mode: "quiz",
        selected_option_id: selectedOption,
        written_text: writtenText,
        audio_url: recordedAudioUrl,
        audio_duration_seconds: recordingSeconds,
        submitted_at: new Date().toISOString(),
      });

      session.saveEvaluation(qid, evalResult);
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetCurrentQuestion = () => {
    setSelectedOption(null);
    setIsQuizChecked(false);
    setWrittenText("");
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    if (session.currentQuestion) {
      // Clear evaluation in session
      const qid = session.currentQuestion.question_id;
      const copy = { ...session.evaluations };
      delete copy[qid];
    }
  };
  if (session.isLoading) {
    return (
      <div className={styles.shell}>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Sparkles size={36} className="animate-spin" style={{ color: "var(--accent-warm)", margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 700, color: "var(--ink-soft)" }}>Đang tải không gian luyện tập...</p>
        </div>
      </div>
    );
  }

  if (session.errorMessage) {
    return (
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>Trở về Ngân hàng câu hỏi</span>
          </Link>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.75)", border: "1px solid rgba(106, 72, 49, 0.15)", marginTop: 20 }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 14px" }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Không thể nạp bài luyện tập</h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 20px" }}>{session.errorMessage}</p>
          <Link href="/questions" className={styles.btnPrimary}>
            <span>Khám phá Ngân hàng câu hỏi</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // FINAL SCORECARD SUMMARY SCREEN
  // ==========================================
  if (session.isFinished) {
    const stats = session.sessionStats;
    return (
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>Trở về Ngân hàng câu hỏi</span>
          </Link>
          <div className={styles.timerBadge}>
            <Clock size={14} />
            <span>Thời gian hoàn thành: {formatTimer(session.elapsedSeconds)}</span>
          </div>
        </div>

        {/* Scorecard Hero */}
        <div className={styles.scorecardHero}>
          <div className={styles.scorecardRing}>
            {stats.averageScore}
          </div>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", color: "var(--ink)" }}>
              {stats.isPassed ? "Chúc mừng! Bạn đã hoàn thành xuất sắc" : "Hoàn thành bài luyện tập câu hỏi"}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>
              Bạn đã hoàn thành {stats.evaluatedCount} / {stats.totalCount} câu hỏi trong {session.sessionTitle}.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={session.restartSession}
              className={styles.btnOutline}
            >
              <RotateCcw size={15} />
              <span>Luyện tập lại từ đầu</span>
            </button>
            <Link
              href="/profile?tab=history"
              className={styles.btnOutline}
              style={{ background: "#ffffff" }}
            >
              <Award size={15} />
              <span>Lịch sử luyện tập</span>
            </Link>
            <Link
              href="/questions"
              className={styles.btnPrimary}
            >
              <Sparkles size={15} />
              <span>Khám phá thêm câu hỏi khác</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Breakdown of each question */}
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
          Bảng điểm chi tiết từng câu hỏi ({session.questions.length} câu)
        </h3>

        <div className={styles.summaryGrid}>
          {session.questions.map((item, idx) => {
            const ev = session.evaluations[item.question_id];
            const ans = session.answers[item.question_id];
            const mb = ev?.modal_breakdown;

            return (
              <div
                key={item.question_id}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  background: "#ffffff",
                  border: "1px solid rgba(106, 72, 49, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513" }}>
                      Câu #{idx + 1}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)" }}>
                      {item.role_name || "Chuyên ngành"}
                    </span>
                    {mb && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>
                        • Trắc nghiệm: {mb.quiz_score}/15đ | Tự luận: {mb.text_score}/35đ | Nói: {mb.voice_score}/50đ
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    {item.question_text}
                  </h4>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {ev ? (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: ev.score >= 70 ? "#059669" : "#d97706" }}>
                        {ev.score}<small style={{ fontSize: 13 }}>/100đ</small>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ev.passed ? "#059669" : "#dc2626" }}>
                        {ev.passed ? "✓ Đạt yêu cầu" : "Cần rèn luyện thêm"}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, fontStyle: "italic", color: "var(--ink-muted)" }}>
                      Chưa nộp câu này
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      session.goToIndex(idx);
                      session.restartSession;
                    }}
                    className={styles.btnOutline}
                    style={{ padding: "6px 14px", fontSize: 12 }}
                  >
                    Xem lại
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // Current Question Data
  const q = session.currentQuestion;
  if (!q) {
    return (
      <div className={styles.shell}>
        <Link href="/questions" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>Trở về Ngân hàng câu hỏi</span>
        </Link>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <h2>Không có câu hỏi nào trong phiên luyện tập</h2>
          <p>Hãy vào Ngân hàng câu hỏi để bốc đề hoặc chọn một bộ đề tuyển dụng.</p>
        </div>
      </div>
    );
  }

  const evaluation = session.currentEvaluation;
  const mb = evaluation?.modal_breakdown;

  return (
    <div className={styles.shell}>
      {/* Top Bar Navigation */}
      <div className={styles.topBar}>
        <Link href="/questions" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>Thoát ra Ngân hàng câu hỏi</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className={styles.btnOutline}
            style={{ padding: "6px 14px", fontSize: 12 }}
            title="Sao chép đường dẫn bài luyện tập này"
          >
            {copiedUrl ? (
              <>
                <Check size={13} color="#10b981" />
                <span style={{ color: "#10b981", fontWeight: 800 }}>Đã sao chép link!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Chia sẻ link đề</span>
              </>
            )}
          </button>

          <div className={styles.timerBadge}>
            <Clock size={14} />
            <span>{formatTimer(session.elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={session.finishSession}
            className={styles.btnPrimary}
            style={{ padding: "8px 18px", fontSize: 12 }}
          >
            <CheckCircle2 size={14} />
            <span>Nộp bài & Tổng kết</span>
          </button>
        </div>
      </div>

      {/* Missing / Deleted Question Warning Banner */}
      {session.skippedCount > 0 && (
        <div style={{ marginBottom: "18px", padding: "12px 18px", borderRadius: "16px", background: "rgba(245, 158, 11, 0.1)", border: "1.5px solid rgba(245, 158, 11, 0.35)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#b45309", fontWeight: 600 }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>Hệ thống đã tự động bỏ qua {session.skippedCount} câu hỏi trong liên kết không còn khả dụng hoặc đã bị xóa khỏi hệ thống.</span>
        </div>
      )}

      {/* Stepper Card */}
      <div className={styles.sessionCard}>
        <div className={styles.sessionHeader}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-deep)" }}>
              {session.source === "set" ? "Bộ Đề Tuyển Dụng Chuẩn" : session.source === "basket" ? "Giỏ Câu Hỏi Tự Bốc" : "Câu Hỏi Lẻ"}
            </span>
            <h2 className={styles.sessionTitle}>{session.sessionTitle}</h2>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>
            Tiến độ: <strong style={{ color: "var(--ink)" }}>{session.currentIndex + 1}</strong> / {session.totalQuestions} câu
          </div>
        </div>

        {/* Stepper List */}
        <div className={styles.stepperWrapper}>
          {session.questions.map((item, idx) => {
            const isActive = idx === session.currentIndex;
            const isDone = Boolean(session.evaluations[item.question_id]);

            let pillClass = styles.stepPill;
            if (isActive) pillClass += " " + styles.stepPillActive;
            else if (isDone) pillClass += " " + styles.stepPillDone;

            return (
              <button
                key={item.question_id}
                type="button"
                onClick={() => handleAttemptNavigate(idx)}
                className={pillClass}
              >
                {isDone ? <CheckCircle2 size={13} /> : null}
                <span>Câu {idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className={styles.questionCard}>
        {/* Forward-Only Lock Banner */}
        {isCurrentLocked && (
          <div className={styles.lockedNotice}>
            <Lock size={16} style={{ flexShrink: 0 }} />
            <span>Câu hỏi này đã hoàn thành và khóa làm bài một chiều (Không thể chỉnh sửa sau khi đã chuyển sang câu tiếp theo).</span>
          </div>
        )}

        <div className={styles.badgeRow}>
          <span className={styles.badge}>{q.domain_name || "Chuyên ngành"}</span>
          <span className={`${styles.badge} ${styles.badgeRole}`}>
            {q.role_name ? getLocalizedRoleName({ role_name: q.role_name }, locale) : "Software Engineer"}
          </span>
          <span className={styles.badge} style={{ background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8" }}>
            Cấp độ: {q.experience_level?.toUpperCase() || "JUNIOR"}
          </span>
          <span className={styles.badge} style={{ background: "rgba(168, 85, 247, 0.12)", color: "#7e22ce" }}>
            Dạng đề: {q.question_type ? q.question_type.toUpperCase() : "TECHNICAL"}
          </span>
        </div>

        <h3 className={styles.questionText}>
          &ldquo;{q.question_text}&rdquo;
        </h3>

        {/* Collapsible STAR Guidance Accordion */}
        <div className={styles.guidanceAccordion}>
          <button
            type="button"
            className={styles.guidanceHeader}
            onClick={() => setShowGuidance((prev) => !prev)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lightbulb size={16} color="#d98236" />
              <span>Gợi ý phương pháp STAR & Tiêu chuẩn Rubric cho câu này</span>
            </div>
            {showGuidance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showGuidance && (
            <div className={styles.guidanceBody}>
              <div className={styles.guideItem}>
                <strong>S - Tình huống:</strong> {q.star_template?.situation_guide || "Mô tả bối cảnh dự án, thời điểm và quy mô thử thách ban đầu."}
              </div>
              <div className={styles.guideItem}>
                <strong>T - Nhiệm vụ:</strong> {q.star_template?.task_guide || "Nêu rõ trách nhiệm và mục tiêu bạn phải hoàn thành."}
              </div>
              <div className={styles.guideItem}>
                <strong>A - Hành động:</strong> {q.star_template?.action_guide || "Các giải pháp kỹ thuật, quyết định và công cụ bạn áp dụng."}
              </div>
              <div className={styles.guideItem}>
                <strong>R - Kết quả:</strong> {q.star_template?.result_guide || "Số liệu định lượng đo lường được và bài học rút ra."}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* INTEGRATED MULTI-MODAL PRACTICE WORKSPACE (15% - 35% - 50%) */}
      <div className={styles.sessionCard}>
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: "var(--ink)" }}>
            Bài làm đa thức tổng hợp (100% điểm câu hỏi)
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
            Điểm số câu này được đánh giá dựa trên 3 phần: Trắc nghiệm (15%), Tự luận STAR (35%) và Ghi âm giọng nói (50%).
          </p>
        </div>

        {/* SECTION 1: TRẮC NGHIỆM TÌNH HUỐNG (15%) */}
        <div className={styles.sectionCardBlock}>
          <div className={styles.sectionBlockHeader}>
            <h4 className={styles.sectionBlockTitle}>
              <CheckSquare size={17} color="#d98236" />
              <span>Phần 1: Trắc nghiệm tình huống</span>
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={styles.weightBadge}>Trọng số: 15% (15đ)</span>
              {selectedOption ? (
                <span className={styles.goodTag}><Check size={12} /> Đã chọn đáp án</span>
              ) : (
                <span className={styles.warnTag}><AlertTriangle size={12} /> Chưa chọn</span>
              )}
            </div>
          </div>

          <div className={styles.quizList}>
            {(
              q.quiz_data?.options || [
                { id: "A", text: "Tập trung giải thích nhanh phần kết quả và bỏ qua bối cảnh ban đầu.", is_correct: false, explanation: "Bỏ qua bối cảnh khiến người nghe không đánh giá được quy mô và độ khó." },
                { id: "B", text: "Áp dụng cấu trúc STAR: Bối cảnh (S), Vai trò (T), Hành động (A) và Dẫn chứng số liệu định lượng (R).", is_correct: true, explanation: "Cách tiếp cận chuẩn mực giúp câu trả lời logic và nổi bật năng lực cá nhân." },
                { id: "C", text: "Đổ lỗi cho hoàn cảnh hoặc đồng nghiệp để chứng minh bản thân luôn làm đúng.", is_correct: false, explanation: "Thái độ đổ lỗi là điểm trừ rất lớn trong phỏng vấn hành vi." },
                { id: "D", text: "Chỉ trả lời một câu ngắn gọn và chờ người phỏng vấn tự hỏi tiếp.", is_correct: false, explanation: "Quá thụ động, không thể hiện được chiều sâu tư duy và kỹ năng giao tiếp." },
              ]
            ).map((opt) => {
              const isSelected = selectedOption === opt.id;
              let cardClass = styles.quizOption;
              if (isSelected) cardClass += " " + styles.quizSelected;
              if (isQuizChecked) {
                if (opt.is_correct) cardClass += " " + styles.quizCorrect;
                else if (isSelected && !opt.is_correct) cardClass += " " + styles.quizIncorrect;
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedOption(opt.id);
                    setIsQuizChecked(false);
                  }}
                  className={cardClass}
                >
                  <div className={`${styles.quizBadge} ${isSelected ? styles.quizBadgeSelected : ""}`}>
                    {opt.id}
                  </div>
                  <div className={styles.quizText}>{opt.text}</div>
                  {isQuizChecked && opt.is_correct && <CheckCircle size={18} color="#10b981" />}
                  {isQuizChecked && isSelected && !opt.is_correct && <XCircle size={18} color="#ef4444" />}
                </div>
              );
            })}
          </div>

          {selectedOption && !isQuizChecked && (
            <button
              type="button"
              onClick={() => setIsQuizChecked(true)}
              className={styles.btnOutline}
              style={{ padding: "6px 14px", fontSize: "12px" }}
            >
              <CheckSquare size={13} />
              <span>Kiểm tra giải thích trắc nghiệm</span>
            </button>
          )}

          {isQuizChecked && (
            <div className={styles.explanationBox} style={{ marginTop: 12 }}>
              <strong>Giải thích chuyên môn: </strong>
              {q.quiz_data?.explanation || "Áp dụng khung STAR giúp bạn luôn giữ được sự mạch lạc, tập trung vào dẫn chứng định lượng và làm nổi bật giá trị đóng góp cho dự án."}
            </div>
          )}
        </div>

        {/* SECTION 2: TỰ LUẬN THEO KHUNG STAR (35%) */}
        <div className={styles.sectionCardBlock}>
          <div className={styles.sectionBlockHeader}>
            <h4 className={styles.sectionBlockTitle}>
              <FileText size={17} color="#d98236" />
              <span>Phần 2: Tự luận theo khung STAR</span>
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={styles.weightBadge}>Trọng số: 35% (35đ)</span>
              {wordCount >= 20 ? (
                <span className={styles.goodTag}><Check size={12} /> Đạt {wordCount} từ</span>
              ) : (
                <span className={styles.warnTag}><AlertTriangle size={12} /> {wordCount}/20 từ (Quá ngắn)</span>
              )}
            </div>
          </div>

          <div className={styles.promptChips}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-muted)", alignSelf: "center", marginRight: 4 }}>
              Chèn nhanh mẫu:
            </span>
            <button
              type="button"
              onClick={() => setWrittenText((prev) => prev + (prev ? "\n\n" : "") + "• Tình huống (Situation): ")}
              className={styles.promptChip}
            >
              + Tình huống (S)
            </button>
            <button
              type="button"
              onClick={() => setWrittenText((prev) => prev + (prev ? "\n\n" : "") + "• Nhiệm vụ (Task): ")}
              className={styles.promptChip}
            >
              + Nhiệm vụ (T)
            </button>
            <button
              type="button"
              onClick={() => setWrittenText((prev) => prev + (prev ? "\n\n" : "") + "• Hành động (Action): ")}
              className={styles.promptChip}
            >
              + Hành động (A)
            </button>
            <button
              type="button"
              onClick={() => setWrittenText((prev) => prev + (prev ? "\n\n" : "") + "• Kết quả (Result): ")}
              className={styles.promptChip}
            >
              + Kết quả (R)
            </button>
          </div>

          <textarea
            className={styles.textarea}
            value={writtenText}
            readOnly={isCurrentLocked}
            onChange={(e) => !isCurrentLocked && setWrittenText(e.target.value)}
            placeholder={isCurrentLocked ? "Câu hỏi đã bị khóa một chiều. Bạn không thể chỉnh sửa nội dung này." : "Soạn thảo câu trả lời của bạn tại đây theo phương pháp STAR (Tối thiểu 20 từ)..."}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: wordCount < 20 && wordCount > 0 ? "#b45309" : "var(--ink-muted)", fontWeight: 600 }}>
              Độ dài: {wordCount} từ • {writtenText.length} ký tự (Khuyến nghị 150 - 600 từ)
            </span>
          </div>
        </div>

        {/* SECTION 3: NÓI & GHI ÂM TRỰC TIẾP (50%) */}
        <div className={styles.sectionCardBlock}>
          <div className={styles.sectionBlockHeader}>
            <h4 className={styles.sectionBlockTitle}>
              <Mic size={17} color="#d98236" />
              <span>Phần 3: Nói & Ghi âm giọng nói trực tiếp</span>
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={styles.weightBadge}>Trọng số: 50% (50đ)</span>
              {recordingSeconds >= 5 || recordedAudioUrl ? (
                <span className={styles.goodTag}><Check size={12} /> Đã ghi âm ({recordingSeconds}s)</span>
              ) : (
                <span className={styles.warnTag}><AlertTriangle size={12} /> Chưa ghi âm đủ 5s</span>
              )}
            </div>
          </div>

          <div className={styles.voiceBox} style={{ margin: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent-deep)" }}>
              {formatTimer(recordingSeconds)}
            </div>

            <div className={styles.waveBars}>
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.waveBar}
                  style={{
                    height: isRecording ? `${10 + Math.sin(i + recordingSeconds) * 26}px` : "8px",
                  }}
                />
              ))}
            </div>

            {/* Silent Recording UX - Calm, focused, background-only tracking */}
            <div style={{ fontSize: 12, fontWeight: 700, color: voiceRecorder.isRecording ? "#10b981" : "var(--ink-soft)", marginBottom: 8 }}>
              {voiceRecorder.isRecording
                ? "🎙️ Đang ghi âm câu trả lời của bạn..."
                : (recordedAudioUrl || voiceRecorder.recordedAudioUrl)
                ? "✓ Bản ghi âm đã hoàn thành"
                : "Nhấn micro để bắt đầu phát biểu"}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {!voiceRecorder.isRecording ? (
                <button
                  type="button"
                  disabled={isCurrentLocked}
                  onClick={handleStartVoice}
                  className={styles.recordBtn}
                  style={isCurrentLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  <Mic size={18} />
                  <span>{isCurrentLocked ? "Đã khóa ghi âm" : (recordedAudioUrl || voiceRecorder.recordedAudioUrl) ? "Ghi âm lại" : "Bắt đầu ghi âm"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopVoice}
                  className={`${styles.recordBtn} ${styles.recordBtnActive}`}
                >
                  <Square size={18} fill="#ffffff" />
                  <span>Dừng ghi âm</span>
                </button>
              )}
            </div>



            {recordedAudioUrl && (
              <div style={{ marginTop: 10, width: "100%", maxWidth: 360 }}>
                <audio src={recordedAudioUrl} controls style={{ width: "100%" }} />
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT EVALUATION BUTTON (NỘP CHẤM ĐIỂM TOÀN DIỆN) */}
        {!evaluation && !isEvaluating && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleSubmitForEvaluation}
              className={styles.btnPrimary}
              style={{ background: "linear-gradient(135deg, #d98236, #8b4513)", padding: "14px 28px", fontSize: 14 }}
            >
              <Send size={16} />
              <span>Gửi bài để AI chấm điểm toàn diện (100đ)</span>
            </button>
          </div>
        )}

        {/* Evaluating State */}
        {isEvaluating && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Sparkles size={38} className="animate-spin" style={{ color: "var(--accent-warm)", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 17, fontWeight: 800 }}>AI Coach đang chấm điểm đa thức (Trắc nghiệm 15%, Tự luận 35%, Nói 50%)...</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>Đối chiếu câu trả lời với khung STAR và thang điểm Rubric chuẩn hóa quốc tế</p>
          </div>
        )}

        {/* AI EVALUATION REPORT DISPLAY */}
        {evaluation && (
          <div className={styles.aiReportCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(106, 72, 49, 0.12)", paddingBottom: 14 }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
                  Báo cáo chấm điểm tổng hợp câu #{session.currentIndex + 1}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                  Điểm số tổng hợp từ Trắc nghiệm (15%), Tự luận STAR (35%) và Giọng nói (50%)
                </p>
              </div>

              <div className={styles.scoreBadge}>
                <span className={styles.scoreVal}>{evaluation.score}</span>
                <small>/100đ</small>
              </div>
            </div>

            {/* Pipeline A Delivery Telemetry Summary */}
            {(evaluation.delivery_metrics || voiceRecorder.deliveryMetrics) && (() => {
              const dm = evaluation.delivery_metrics || voiceRecorder.deliveryMetrics;
              return (
                <div className={styles.deliveryBox}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Mic size={15} color="#d98236" />
                    <span>Phân tích phát âm & Tốc độ nói (Beevibe Pipeline A)</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-soft)" }}>
                    <span>⏱️ Thời lượng: <strong>{formatTimer(Math.round((dm.durationMs || 0) / 1000))}</strong> (Nói liên tục: {Math.round((dm.activeSpeechMs || 0) / 1000)}s)</span>
                    <span>• Tốc độ: <strong>{dm.activeSpeechWpm || 0} WPM</strong> {dm.activeSpeechWpm >= 110 && dm.activeSpeechWpm <= 165 ? "(Chuẩn)" : dm.activeSpeechWpm > 165 ? "(Nói nhanh)" : "(Cần nhanh hơn)"}</span>
                    <span>• <strong>{dm.fillerCount || 0}</strong> từ đệm</span>
                    <span>• <strong>{dm.longPauseCount || 0}</strong> ngắt quãng dài</span>
                    <span>• <strong>{dm.repetitionCount || 0}</strong> lặp từ</span>
                  </div>
                  {dm.fillers && dm.fillers.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-muted)" }}>
                      Từ đệm phát hiện: {dm.fillers.map((f: any) => `"${f.text}" ×${f.count}`).join(", ")}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3-Score Distribution Grid */}
            {mb && (
              <div className={styles.scoreGrid3}>
                <div className={styles.scoreItem3}>
                  <span className={styles.scoreItem3Title}>Trắc nghiệm (15%)</span>
                  <span className={styles.scoreItem3Val}>{mb.quiz_score}<small style={{ fontSize: 13, fontWeight: 700 }}>/15đ</small></span>
                </div>
                <div className={styles.scoreItem3}>
                  <span className={styles.scoreItem3Title}>Tự luận STAR (35%)</span>
                  <span className={styles.scoreItem3Val}>{mb.text_score}<small style={{ fontSize: 13, fontWeight: 700 }}>/35đ</small></span>
                </div>
                <div className={styles.scoreItem3}>
                  <span className={styles.scoreItem3Title}>Ghi âm nói (50%)</span>
                  <span className={styles.scoreItem3Val}>{mb.voice_score}<small style={{ fontSize: 13, fontWeight: 700 }}>/50đ</small></span>
                </div>
              </div>
            )}

            <div style={{ background: "rgba(33, 25, 20, 0.04)", padding: "14px 18px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.65 }}>
              <strong>Nhận xét tổng quan: </strong> {evaluation.general_feedback}
            </div>

            {/* 4 STAR Breakdown & Detailed Rubrics with Freemium Policy */}
            <div style={{ position: "relative", marginTop: 4 }}>
              <div style={!isSubscribed ? { filter: "blur(5px)", userSelect: "none", pointerEvents: "none", opacity: 0.55 } : {}}>
                {/* 4 STAR Breakdown */}
                <div>
                  <h5 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 800 }}>Phân tích 4 thành tố STAR</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                        <span>S - Tình huống</span>
                        <span style={{ color: "#d98236" }}>{evaluation.star_breakdown.situation_score}/10đ</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-soft)" }}>{evaluation.star_breakdown.situation_feedback}</p>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                        <span>T - Nhiệm vụ</span>
                        <span style={{ color: "#d98236" }}>{evaluation.star_breakdown.task_score}/10đ</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-soft)" }}>{evaluation.star_breakdown.task_feedback}</p>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                        <span>A - Hành động</span>
                        <span style={{ color: "#d98236" }}>{evaluation.star_breakdown.action_score}/10đ</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-soft)" }}>{evaluation.star_breakdown.action_feedback}</p>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>
                        <span>R - Kết quả</span>
                        <span style={{ color: "#d98236" }}>{evaluation.star_breakdown.result_score}/10đ</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-soft)" }}>{evaluation.star_breakdown.result_feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                    <div style={{ fontWeight: 800, fontSize: 12.5, color: "#065f46", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle size={15} /> Điểm mạnh
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>
                      {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(234, 88, 12, 0.08)", border: "1px solid rgba(234, 88, 12, 0.25)" }}>
                    <div style={{ fontWeight: 800, fontSize: 12.5, color: "#9a3412", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <Lightbulb size={15} /> Gợi ý cải thiện
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>
                      {evaluation.improvements.map((im, i) => <li key={i}>{im}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Freemium Pro Lock Overlay for Free candidates */}
              {!isSubscribed && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.72)",
                  backdropFilter: "blur(3px)",
                  borderRadius: 16,
                  padding: "24px 20px",
                  textAlign: "center",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: "linear-gradient(135deg, #d98236, #8b4513)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 10, boxShadow: "0 4px 12px rgba(217, 130, 54, 0.35)" }}>
                    <Lock size={20} />
                  </div>
                  <h5 style={{ fontSize: 15.5, fontWeight: 900, margin: "0 0 6px", color: "var(--ink)" }}>
                    Đặc quyền gói Pro: Mở khóa toàn bộ nhận xét & hướng dẫn từ AI Coach
                  </h5>
                  <p style={{ fontSize: 12.5, color: "var(--ink-soft)", maxWidth: 460, margin: "0 0 14px", lineHeight: 1.5 }}>
                    Tài khoản Free xem được tổng điểm và phân bổ 3 thành phần. Nâng cấp <strong>Pro Member</strong> để xem phân tích chuyên sâu 4 thành tố STAR, thang điểm Rubric và hướng dẫn cải thiện chi tiết.
                  </p>
                  <Link
                    href="/subscription"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 20px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #d98236, #8b4513)",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 12.5,
                      textDecoration: "none",
                      boxShadow: "0 4px 12px rgba(217, 130, 54, 0.3)",
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Nâng cấp Pro mở khóa ngay</span>
                  </Link>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={handleResetCurrentQuestion}
                className={styles.btnOutline}
                style={{ padding: "7px 16px", fontSize: 12 }}
              >
                <RotateCcw size={13} />
                <span>Làm lại câu này</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className={styles.navRow}>
          <button
            type="button"
            disabled={session.currentIndex <= 0}
            onClick={handleAttemptPrev}
            className={styles.btnOutline}
          >
            <span>← Câu trước</span>
          </button>

          {session.currentIndex < session.totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleAttemptNext}
              className={styles.btnPrimary}
            >
              <span>Câu kế tiếp →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={session.finishSession}
              className={styles.btnPrimary}
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <CheckCircle2 size={16} />
              <span>Nộp bài & Xem tổng kết</span>
            </button>
          )}
        </div>
      </div>

      {/* INCOMPLETE WARNING MODAL (CẢNH BÁO BỎ DỞ KHI CHUYỂN CÂU) */}
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

            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>
              Bạn có thể ở lại để hoàn thiện nhằm đạt điểm tối đa, hoặc vẫn tiếp tục chuyển câu (bạn có thể quay lại làm bổ sung bất cứ lúc nào).
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className={styles.btnOutline}
              >
                <span>Ở lại hoàn thiện</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSkip}
                className={styles.btnPrimary}
                style={{ background: "#ea580c" }}
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

