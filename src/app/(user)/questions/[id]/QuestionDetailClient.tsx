"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Lightbulb,
  Keyboard,
  Mic,
  Share2,
  ArrowRight,
  BookOpen,
  X,
} from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import { useI18n } from "@/context/I18nContext";
import { interviewApi } from "@/services/interviewApi";
import type { QuestionDetailOut } from "@/types/catalog";
import { getDomainTheme } from "@/constants/domainThemes";
import styles from "./detail.module.css";
import parentStyles from "../questions.module.css";

interface Props {
  questionId: string;
}

export default function QuestionDetailClient({ questionId }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();

  const [question, setQuestion] = useState<QuestionDetailOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"star" | "rubric" | "followup">("star");

  // Copy sample answer toast
  const [copied, setCopied] = useState(false);

  // Practice Modal State
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState<"text" | "voice">("text");
  const [isStartingPractice, setIsStartingPractice] = useState(false);

  useEffect(() => {
    let isMounted = true;

    catalogApi
      .getQuestionDetail(questionId)
      .then((data) => {
        if (!isMounted) return;
        setQuestion(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [questionId]);

  const handleCopyAnswer = () => {
    if (!question?.sample_answer) return;
    navigator.clipboard.writeText(question.sample_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchPractice = async () => {
    if (!question) return;
    setIsStartingPractice(true);

    try {
      const session = await interviewApi.startSession({
        domain_id: question.domain_id,
        role_id: question.role_id || 1,
        role_name: question.role_name || "Software Engineer",
        level: question.experience_level || "junior",
        language: question.language || "vi",
        mode: practiceMode,
      });

      setIsPracticeModalOpen(false);
      router.push(`/practice/${session.session_id}`);
    } catch {
      setIsPracticeModalOpen(false);
      router.push(
        `/practice?domain=${question.domain_id}&role=${question.role_id || 1}&level=${question.experience_level || "junior"}&lang=${question.language || "vi"}`
      );
    } finally {
      setIsStartingPractice(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Sparkles size={32} className="animate-spin" style={{ color: "var(--accent-warm)", margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 700, color: "var(--ink-soft)" }}>{t.questions.detail.loadingText}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.shell}>
        <div className={styles.backNav}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>{t.questions.detail.backToList}</span>
          </Link>
        </div>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{t.questions.detail.notFoundTitle}</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>{t.questions.detail.notFoundDesc}</p>
        </div>
      </div>
    );
  }

  const star = question.star_template;
  const theme = getDomainTheme(question.domain_id, question.domain_name);

  return (
    <div className={styles.shell}>
      {/* Top Navigation & Breadcrumbs */}
      <div className={styles.backNav}>
        <Link href="/questions" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>{t.questions.detail.backToList}</span>
        </Link>

        <div className={styles.breadcrumbs}>
          <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>
            {t.questions.detail.breadcrumbRoot}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span>{question.role_name || "Chuyên ngành"}</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 800 }}>#{question.question_id}</span>
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
              {question.domain_name && (
                <span className={styles.badge}>{question.domain_name}</span>
              )}
              {question.role_name && (
                <span className={`${styles.badge} ${styles.badgeRole}`}>
                  {question.role_name}
                </span>
              )}
              <span className={styles.badge} style={{ background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8" }}>
                {locale === "vi" ? "Cấp độ:" : "Level:"} {question.experience_level ? question.experience_level.toUpperCase() : "GENERAL"}
              </span>
              <span className={styles.badge} style={{ background: "rgba(168, 85, 247, 0.12)", color: "#7e22ce" }}>
                {locale === "vi" ? "Dạng đề:" : "Type:"} {question.question_type ? question.question_type.toUpperCase() : "BEHAVIORAL"}
              </span>
              <span className={styles.badge}>
                {question.language === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-deep)" }}>
              ✦ {locale === "vi" ? "Chuyên ngành:" : "Domain:"} {theme.shortName}
            </div>
          </div>
        </div>

        <h1 className={styles.questionTitle}>
          &ldquo;{question.question_text}&rdquo;
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
      </div>

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

          {/* 4 Steps Grid */}
          <div className={styles.starGrid}>
            {/* Step S */}
            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterS}`}>S</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starS}</div>
              </div>
              <p className={styles.starStepDesc}>
                {star?.situation_guide || t.questions.detail.starSDesc}
              </p>
            </div>

            {/* Step T */}
            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterT}`}>T</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starT}</div>
              </div>
              <p className={styles.starStepDesc}>
                {star?.task_guide || t.questions.detail.starTDesc}
              </p>
            </div>

            {/* Step A */}
            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterA}`}>A</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starA}</div>
              </div>
              <p className={styles.starStepDesc}>
                {star?.action_guide || t.questions.detail.starADesc}
              </p>
            </div>

            {/* Step R */}
            <div className={styles.starStepCard}>
              <div className={styles.starStepHeader}>
                <div className={`${styles.starLetterBadge} ${styles.starLetterR}`}>R</div>
                <div className={styles.starStepTitle}>{t.questions.detail.starR}</div>
              </div>
              <p className={styles.starStepDesc}>
                {star?.result_guide || t.questions.detail.starRDesc}
              </p>
            </div>
          </div>

          {/* Model Answer Box */}
          {question.sample_answer && (
            <div className={styles.sampleAnswerBox}>
              <div className={styles.sampleAnswerHeader}>
                <div className={styles.sampleAnswerTitle}>
                  <BookOpen size={16} />
                  <span>{t.questions.detail.modelAnswerTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAnswer}
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
                &ldquo;{question.sample_answer}&rdquo;
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
            {(question.rubric_criteria || []).map((criterion) => (
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

      {/* TAB 3: CÂU HỎI ĐÀO SÂU & MẸO TRẢ LỜI */}
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
            {(question.follow_up_questions || [
              "Tại sao bạn lại lựa chọn giải pháp đó mà không phải là một phương án thay thế khác?",
              "Nếu được làm lại từ đầu với những gì đã biết, bạn sẽ thay đổi điều gì?",
            ]).map((qText, idx) => (
              <div key={idx} className={styles.followUpItem}>
                <span className={styles.followUpBullet}>0{idx + 1}.</span>
                <span>{qText}</span>
              </div>
            ))}
          </div>

          {question.tips && question.tips.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Lightbulb size={18} style={{ color: "var(--accent-warm)" }} />
                <span>{t.questions.detail.proTipsTitle}</span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {question.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "14px",
                      background: "rgba(217, 130, 54, 0.08)",
                      border: "1px solid rgba(217, 130, 54, 0.2)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--ink)",
                    }}
                  >
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className={styles.bottomActionBar}>
        <div className={styles.actionLeft}>
          <div className={styles.actionTitle}>{t.questions.detail.stickyTitle}</div>
          <div className={styles.actionSub}>{t.questions.detail.stickySub}</div>
        </div>

        <button
          type="button"
          onClick={() => setIsPracticeModalOpen(true)}
          className={styles.btnPracticePrimary}
        >
          <Sparkles size={16} />
          <span>{t.questions.detail.practiceNowBtn}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Direct Practice Modal */}
      {isPracticeModalOpen && (
        <div
          className={parentStyles.modalOverlay}
          onClick={() => setIsPracticeModalOpen(false)}
        >
          <div
            className={parentStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={parentStyles.modalHeader}>
              <h3 className={parentStyles.modalTitle}>
                <Sparkles size={20} style={{ color: "var(--accent-warm)" }} />
                <span>{t.questions.modal.title}</span>
              </h3>
              <button
                type="button"
                className={parentStyles.modalCloseBtn}
                onClick={() => setIsPracticeModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className={parentStyles.modalQuestionBox}>
              &ldquo;{question.question_text}&rdquo;
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`${parentStyles.badge} ${parentStyles.badgeRole}`}>
                {question.role_name || "Software Engineer"}
              </span>
              <span className={parentStyles.badge}>
                Cấp độ: {question.experience_level?.toUpperCase() || "JUNIOR"}
              </span>
              <span className={parentStyles.badge}>
                Ngôn ngữ: {question.language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </div>

            <div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                {t.questions.modal.selectModeTitle}
              </p>
              <div className={parentStyles.modeSelectGrid}>
                <button
                  type="button"
                  onClick={() => setPracticeMode("text")}
                  className={`${parentStyles.modeOptionBtn} ${practiceMode === "text" ? parentStyles.modeOptionBtnActive : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
                    <Keyboard size={16} />
                    <span>{t.common.textMode}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {t.questions.modal.textModeDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPracticeMode("voice")}
                  className={`${parentStyles.modeOptionBtn} ${practiceMode === "voice" ? parentStyles.modeOptionBtnActive : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
                    <Mic size={16} />
                    <span>{t.common.voiceMode}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {t.questions.modal.voiceModeDesc}
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className={parentStyles.btnDetail}
                onClick={() => setIsPracticeModalOpen(false)}
              >
                {t.questions.modal.laterBtn}
              </button>
              <button
                type="button"
                className={parentStyles.btnPractice}
                onClick={handleLaunchPractice}
                disabled={isStartingPractice}
              >
                {isStartingPractice ? (
                  <span>{t.questions.modal.startingBtn}</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{t.questions.modal.startBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
