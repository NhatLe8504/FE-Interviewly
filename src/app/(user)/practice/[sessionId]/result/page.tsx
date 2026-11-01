"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Bot,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { historyApi } from "@/services/historyApi";
import { SessionResultData } from "@/types/analytics";
import { SpeechQualityCard } from "@/components/analytics/SpeechQualityCard";
import { StarBreakdownCard } from "@/components/analytics/StarBreakdownCard";
import { AudioPlayerTurn } from "@/components/analytics/AudioPlayerTurn";
import styles from "./result.module.css";

export default function InterviewResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [data, setData] = useState<SessionResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function loadResult(attempt = 0) {
      if (attempt === 0) setLoading(true);
      setLoadError(false);
      try {
        const res = await historyApi.getSessionResult(sessionId, true);
        if (!active) return;
        setData(res);
        if (attempt === 0 && res?.turns?.length > 0) {
          const firstAnswer = res.turns.find((turn) => turn.speaker === "candidate" || turn.transcribed_text);
          setExpandedTurns({ [firstAnswer ? firstAnswer.turn_id : res.turns[0].turn_id]: true });
        }
        if (res.evaluation_status === "pending" || res.evaluation_status === "partial") {
          if (attempt < 8) timer = setTimeout(() => loadResult(attempt + 1), 3000);
        }
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResult();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [sessionId]);

  const refreshResult = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setData(await historyApi.getSessionResult(sessionId, true));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleTurn = (turnId: number) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [turnId]: !prev[turnId],
    }));
  };

  if (loading && !data) {
    return (
      <div className={styles.loadingShell}>
        <RefreshCw className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Đang tính toán bảng điểm và nhận xét AI...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loadingShell}>
        <p className={styles.loadingText}>Chưa tải được kết quả phỏng vấn. Vui lòng thử lại.</p>
        <button type="button" onClick={refreshResult} className={styles.primaryBtn}>Tải lại</button>
        <Link href={`/practice/${sessionId}`} className={styles.ghostBtn}>Quay lại phiên phỏng vấn</Link>
      </div>
    );
  }

  const result = data;
  const pdfUrl = historyApi.getPdfDownloadUrl(sessionId);

  return (
    <div className={styles.shell}>
      {/* Header Result Bar */}
      <div className={styles.headerCard}>
        <div>
          <span className={styles.eyebrow}>
            Đánh Giá Phiên Phỏng Vấn #{sessionId}
          </span>
          <h1 className={styles.title}>
            Kết Quả & Báo Cáo Kỹ Năng
          </h1>
          <p className={styles.meta}>
            <Clock className="w-3.5 h-3.5 text-[#d98236]" />
            <span>{result.evaluation_status === "ready" ? "Đã chấm đủ các lượt chuyên môn" :
              result.evaluation_status === "unavailable" ? "Chưa có câu trả lời chuyên môn để chấm" :
              `Đã chấm ${result.evaluated_turns}/${result.eligible_turns} lượt chuyên môn`}</span>
          </p>
        </div>

        <div className={styles.actions}>
          {(result.evaluation_status !== "ready" || loadError) && (
            <button type="button" onClick={refreshResult} disabled={loading} className={styles.ghostBtn}>
              <RefreshCw className={`w-4 h-4 ${loading ? styles.loadingSpinner : ""}`} />
              <span>{loading ? "Đang cập nhật" : "Kiểm tra lại điểm"}</span>
            </button>
          )}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryBtn}
          >
            <Download className="w-4 h-4" />
            <span>Tải Báo Cáo PDF</span>
          </a>

          <Link
            href={`/practice/${sessionId}/report`}
            className={styles.ghostBtn}
          >
            <FileText className="w-4 h-4 text-[#8b4513]" />
            <span>Bản In Chuẩn A4</span>
          </Link>

          <Link
            href="/practice"
            className={styles.ghostBtn}
          >
            <RotateCcw className="w-4 h-4 text-[#8b4513]" />
            <span>Luyện phiên mới</span>
          </Link>
        </div>
      </div>

      {/* Overall Score & Readiness Badge */}
      <div className={styles.overviewGrid}>
        {/* Score Card */}
        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>Điểm Tổng Quát (Overall Score)</span>
          <div className={styles.scoreNumber}>
            {result.total_score ?? "—"}
            {result.total_score !== null && <span className={styles.scoreMax}>/ 100</span>}
          </div>
          <div className={styles.readinessBadge}>
            <Award className="w-4 h-4 text-[#d98236]" />
            <span>{result.readiness_badge}</span>
          </div>
          {result.evaluation_status === "ready" && (
            <p className={styles.meta}>Với kịch bản JD, các lượt đào sâu cùng nội dung được gộp trước khi tính điểm tổng.</p>
          )}
          {result.evaluation_status !== "ready" && (
            <p className={styles.meta}>{result.evaluation_status === "partial"
              ? "Một số lượt chưa được chấm. Điểm tổng chỉ xuất hiện khi hệ thống hoàn tất đánh giá; tải lại trang không chấm lại các lượt bị lỗi."
              : "Không tự suy diễn điểm khi chưa có đủ đánh giá thực tế."}</p>
          )}
        </div>

        {/* 3-Criteria Rubric Breakdown */}
        <div className={styles.rubricCard}>
          <h2 className={styles.rubricTitle}>
            Chi Tiết 3 Tiêu Chí Chấm Điểm Rubric
          </h2>

          <div className={styles.rubricRow}>
            <div className={styles.rubricHead}>
              <span className={styles.rubricName}>Độ Rõ Ràng & Mạch Lạc (Clarity)</span>
              <span className={styles.rubricScore}>{result.clarity_score === null ? "Chưa chấm" : `${result.clarity_score} / 100`}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${result.clarity_score ?? 0}%` }}
              />
            </div>
          </div>

          <div className={styles.rubricRow}>
            <div className={styles.rubricHead}>
              <span className={styles.rubricName}>Cấu Trúc Logic (Logical Structure)</span>
              <span className={styles.rubricScore}>{result.structure_score === null ? "Chưa chấm" : `${result.structure_score} / 100`}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${result.structure_score ?? 0}%` }}
              />
            </div>
          </div>

          <div className={styles.rubricRow}>
            <div className={styles.rubricHead}>
              <span className={styles.rubricName}>Dẫn Chứng Thực Tế (Concrete Evidence)</span>
              <span className={styles.rubricScore}>{result.evidence_score === null ? "Chưa chấm" : `${result.evidence_score} / 100`}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${result.evidence_score ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Speech Quality & STAR Breakdown */}
      <div className={styles.analyticsGrid}>
        {(result.speaking_pace_wpm !== null || result.filler_count !== null) && <SpeechQualityCard
          wpm={result.speaking_pace_wpm}
          paceRating={result.pace_rating}
          fillerCount={result.filler_count}
          fillerWords={result.filler_words}
          pauseDuration={result.pause_duration}
        />}

        {result.star_analysis && <StarBreakdownCard analysis={result.star_analysis} />}
      </div>

      {/* Detailed Turn-by-Turn Accordion Review */}
      <div className={styles.turnsSection}>
        <div className={styles.turnsHeader}>
          <div>
            <h2 className={styles.turnsTitle}>Chi Tiết Từng Lượt Hỏi - Đáp & Nhận Xét</h2>
            <p className={styles.turnsDesc}>Xem lại từng câu trả lời, nhận xét của AI và câu trả lời mẫu xuất sắc</p>
          </div>
          <span className={styles.turnsCountBadge}>{result.turns.length} lượt tương tác</span>
        </div>

        <div className={styles.turnsList}>
          {result.turns.map((turn) => {
            const isExpanded = !!expandedTurns[turn.turn_id];
            const isCandidate = turn.speaker === "candidate";
            const hasAnswer = isCandidate || Boolean(turn.transcribed_text);

            return (
              <div key={turn.turn_id} className={styles.turnItem}>
                <button
                  type="button"
                  onClick={() => toggleTurn(turn.turn_id)}
                  className={styles.turnHeaderBtn}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`${styles.speakerAvatar} ${
                        isCandidate ? styles.avatarCandidate : styles.avatarAi
                      }`}
                    >
                      {isCandidate ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className={styles.turnMeta}>
                        <span className={styles.turnSpeakerName}>
                          Lượt #{turn.turn_number} · {hasAnswer && !isCandidate ? "AI · Ứng viên" : isCandidate ? "Ứng viên trả lời" : "AI Người phỏng vấn"}
                        </span>
                        {turn.overall_score !== null && (
                          <span className={styles.turnScoreBadge}>
                            {turn.overall_score} điểm
                          </span>
                        )}
                      </div>
                      <p className={styles.turnPreview}>
                        {turn.message_text || turn.transcribed_text || "Không có nội dung văn bản"}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#543a2a]/60 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#543a2a]/60 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className={styles.turnBody}>
                    {/* Message / Transcript text */}
                    <div className={styles.transcriptBubble}>
                      {turn.message_text || (isCandidate ? turn.transcribed_text : null)}
                    </div>
                    {!isCandidate && turn.transcribed_text && (
                      <div className={styles.transcriptBubble}><strong>Ứng viên:</strong> {turn.transcribed_text}</div>
                    )}

                    {/* Audio Player if audio available */}
                    {hasAnswer && (
                      <AudioPlayerTurn
                        audioUrl={isCandidate ? turn.audio_url : turn.user_audio_url}
                        turnNumber={turn.turn_number}
                      />
                    )}

                    {/* Feedback and Rubric Scores if candidate turn */}
                    {hasAnswer && turn.feedback_text && (
                      <div className={styles.feedbackBox}>
                        <div className={styles.feedbackHeader}>
                          <Sparkles className="w-4 h-4 text-[#d98236]" />
                          <span>Nhận Xét Chi Tiết Của AI</span>
                        </div>
                        <p className={styles.feedbackText}>
                          {turn.feedback_text}
                        </p>

                        {/* Sub scores */}
                        <div className={styles.subScoreGrid}>
                          <div className={styles.subScoreCard}>
                            <span className={styles.subScoreLabel}>Rõ ràng</span>
                            <span className={styles.subScoreVal}>
                              {turn.clarity_score ?? "-"}
                            </span>
                          </div>
                          <div className={styles.subScoreCard}>
                            <span className={styles.subScoreLabel}>Logic</span>
                            <span className={styles.subScoreVal}>
                              {turn.logic_score ?? "-"}
                            </span>
                          </div>
                          <div className={styles.subScoreCard}>
                            <span className={styles.subScoreLabel}>Dẫn chứng</span>
                            <span className={styles.subScoreVal}>
                              {turn.example_score ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Ideal Answer */}
                    {hasAnswer && turn.ideal_answer && (
                      <div className={styles.idealBox}>
                        <div className={styles.idealHeader}>
                          <CheckCircle2 className="w-4 h-4 text-[#2e6b34]" />
                          <span>Câu Trả Lời Mẫu Xuất Sắc (AI Ideal Answer)</span>
                        </div>
                        <p className={styles.idealText}>{turn.ideal_answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
