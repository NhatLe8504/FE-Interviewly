"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Coffee, Handshake } from "lucide-react";
import { PRE_MADE_INTERVIEWS, type PreMadeInterview } from "@/data/mockInterviews";
import { ApiError } from "@/services/apiClient";
import { interviewApi } from "@/services/interviewApi";
import { jdInterviewApi } from "@/services/jdInterviewApi";
import { useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { CandidatePreferencePanel } from "./components/CandidatePreferencePanel";
import { InterviewProfile } from "./components/InterviewProfile";
import { PlanSummary } from "./components/PlanSummary";
import { StageConfigEditor, type StageDefinition } from "./components/StageConfigEditor";
import { QuestionBankDrawer } from "./components/QuestionBankDrawer";
import { Button } from "@/components/ui/button";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { useI18n } from "@/context/I18nContext";
import { getInterviewLanguage, type InterviewLanguage } from "@/lib/interviewLanguages";
import {
  buildStageConfigs,
  DEFAULT_STAGE_QUESTION_SELECTIONS,
  DEFAULT_STAGE_SOURCE_MODES,
  DEFAULT_STAGE_TURN_BUDGETS,
  getPlanQuestionIds,
  getPlanValidationError,
  getTotalTurnBudget,
  PRACTICE_STAGE_ORDER,
  type PracticeStageKey,
} from "./setupPlan";
import styles from "./setup.module.css";

const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  {
    id: "warmup",
    label: "Khởi động & Chào hỏi",
    description: "Chào hỏi, tạo không khí cởi mở và giới thiệu bản thân.",
    icon: Coffee,
    color: "#f59e0b",
  },
  {
    id: "technical",
    label: "Phỏng vấn chuyên môn",
    description: "Kinh nghiệm dự án, kiến trúc hệ thống và phương pháp STAR.",
    icon: Briefcase,
    color: "#d98236",
  },
  {
    id: "closing",
    label: "Thỏa thuận & Chào kết",
    description: "Định hướng sự nghiệp, câu hỏi cho nhà tuyển dụng và chào kết.",
    icon: Handshake,
    color: "#10b981",
  },
];

interface PracticeSetupClientProps {
  interviewId: string;
}

function getStartErrorMessage(cause: unknown): string {
  const status = cause instanceof ApiError
    ? cause.status
    : typeof cause === "object" && cause !== null && "status" in cause
      ? Number(cause.status)
      : undefined;
  const detail = typeof cause === "object" && cause !== null && "data" in cause
    ? (cause.data as { detail?: unknown } | undefined)?.detail
    : undefined;

  if (status !== undefined) {
    if (status === 401) return "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại trước khi bắt đầu.";
    if (status === 403) return "Tài khoản của bạn chưa có quyền tạo phiên phỏng vấn này.";
    if (status === 409 || status === 429) {
      return "Bạn đã chạm giới hạn phiên hiện tại. Hãy kiểm tra gói dịch vụ và thử lại.";
    }
    if (status === 422) {
      const message = typeof detail === "string"
        ? detail
        : cause instanceof Error
          ? cause.message
          : "Dữ liệu gửi lên không hợp lệ.";
      return `Kế hoạch phỏng vấn chưa hợp lệ: ${message}`;
    }
  }

  return cause instanceof Error
    ? cause.message
    : "Không thể tạo phiên phỏng vấn. Vui lòng thử lại.";
}

export function PracticeSetupClient({ interviewId }: PracticeSetupClientProps) {
  const { locale } = useI18n();
  const preMadeInterview = useMemo(
    () => PRE_MADE_INTERVIEWS.find((item) => item.id === interviewId) ?? null,
    [interviewId]
  );

  const [jdInterview, setJdInterview] = useState<PreMadeInterview | null>(null);
  const [isLoadingJd, setIsLoadingJd] = useState<boolean>(!preMadeInterview);
  const [jdError, setJdError] = useState<string | null>(null);

  useEffect(() => {
    if (preMadeInterview) return;

    let mounted = true;
    setIsLoadingJd(true);
    setJdError(null);

    jdInterviewApi
      .getJobStatus(interviewId)
      .then((data) => {
        if (!mounted) return;
        if (data.status === "COMPLETED" && data.result) {
          const res = data.result;
          const seniorityClean = (
            ["intern", "fresher", "junior", "mid", "senior", "lead"].includes(
              res.seniority?.toLowerCase()
            )
              ? res.seniority.toLowerCase()
              : "junior"
          ) as "junior" | "mid" | "senior" | "lead";

          const adapted: PreMadeInterview = {
            id: interviewId,
            title: res.role || "Software Engineer",
            company: res.company_name || "Theo Job Description của bạn",
            companyBadge: "JD Custom",
            domain: "Phỏng vấn theo JD ứng tuyển",
            level: seniorityClean,
            levelLabel: res.seniority ? res.seniority.toUpperCase() : "JUNIOR",
            durationMinutes: res.estimated_minutes || 45,
            questionsCount: res.total_questions || (res.questions?.length || 5),
            candidatesPracticed: "1 bạn",
            reviewsCount: 1,
            rating: 5.0,
            imageUrl:
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
            testimonial: {
              quote:
                "Bộ câu hỏi và thang điểm năng lực được AI bóc tách chính xác từ bản mô tả công việc (JD), kèm khung đánh giá STAR và tiêu chí chấm điểm chuyên sâu.",
              author: "AI Interview Coach",
              role: "JD Intelligence Engine",
            },
            topics:
              res.focus_areas && res.focus_areas.length > 0
                ? res.focus_areas
                : ["Kỹ năng chuyên môn", "Hành vi STAR", "Xử lý tình huống thực tế"],
            category: "software",
            sampleQuestions: (res.questions || []).map((q: any, idx: number) => ({
              question_id: 10000 + idx,
              question_text: q.question_text || "",
              star_hint: q.rationale || "Áp dụng phương pháp STAR để trả lời chi tiết.",
            })),
          };
          setJdInterview(adapted);
        } else if (data.status === "FAILED") {
          setJdError(data.error || "Quá trình phân tích JD bị thất bại.");
        } else {
          setJdError("Kịch bản phỏng vấn từ JD đang được xử lý. Vui lòng chờ trong giây lát...");
        }
      })
      .catch((err) => {
        if (mounted) {
          setJdError(err.message || "Không thể tải thông tin buổi phỏng vấn JD này.");
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingJd(false);
      });

    return () => {
      mounted = false;
    };
  }, [interviewId, preMadeInterview]);

  const interview = preMadeInterview || jdInterview;

  const [selectedStages, setSelectedStages] = useState<PracticeStageKey[]>([
    "warmup",
    "technical",
    "closing",
  ]);
  const mode = "text";
  const questionBankLanguage = "vi";
  const [language, setLanguage] = useState<InterviewLanguage>(locale);
  const [bargeInEnabled, setBargeInEnabled] = useState(false);
  const [totalDurationMinutes, setTotalDurationMinutes] = useState<number>(interview?.durationMinutes || 45);
  const [mockMode, setMockMode] = useState<"strict" | "guided">("guided");
  const [stageSourceModes, setStageSourceModes] = useState(DEFAULT_STAGE_SOURCE_MODES);
  const [stageTurns, setStageTurns] = useState(DEFAULT_STAGE_TURN_BUDGETS);
  const [stageSelectedQuestions, setStageSelectedQuestions] = useState(DEFAULT_STAGE_QUESTION_SELECTIONS);
  const [selectingStageKey, setSelectingStageKey] = useState<PracticeStageKey | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const stageConfigs = useMemo(
    () => buildStageConfigs(selectedStages, stageSourceModes, stageTurns, stageSelectedQuestions),
    [selectedStages, stageSelectedQuestions, stageSourceModes, stageTurns]
  );
  const planValidationError = useMemo(
    () => getPlanValidationError(stageConfigs),
    [stageConfigs]
  );

  const toggleStage = (stageId: PracticeStageKey) => {
    setSelectedStages((current) => {
      if (current.includes(stageId)) {
        return current.length === 1 ? current : current.filter((item) => item !== stageId);
      }
      return PRACTICE_STAGE_ORDER.filter((item) => current.includes(item) || item === stageId);
    });
  };

  const handleStartInterview = async () => {
    if (!interview) return;

    setSetupError(null);
    if (planValidationError) {
      setSetupError(planValidationError);
      return;
    }

    setIsLaunching(true);
    try {
      const selectedQuestionIds = getPlanQuestionIds(stageConfigs);
      let sessionId: number | string | undefined;

      if (interviewId.startsWith("jd_") || !preMadeInterview) {
        const jdSession = await jdInterviewApi.startSession(
          interviewId,
          mode,
          bargeInEnabled,
          selectedStages,
          stageConfigs
        );
        sessionId = jdSession.session_id;
      } else {
        const createdSession = await interviewApi.startSession({
          role_name: interview.title,
          level: interview.level,
          language: questionBankLanguage,
          mode,
          barge_in_enabled: bargeInEnabled,
          stage_configs: stageConfigs,
          selected_question_ids: selectedQuestionIds,
        });
        sessionId = createdSession.session_id;
      }
      if (sessionId === undefined || sessionId === null || String(sessionId).trim() === "") {
        throw new Error("Backend không trả về mã phiên phỏng vấn hợp lệ.");
      }

      let cachedVoice: string | undefined = undefined;
      try {
        cachedVoice =
          localStorage.getItem(`interviewly_preferred_voice_${language}`) ||
          localStorage.getItem("interviewly_preferred_voice") ||
          undefined;
      } catch {}

      try {
        sessionStorage.setItem(
          `session_metadata_${sessionId}`,
          JSON.stringify({
            roleLabel: interview.title,
            companyName: interview.company,
            domainLabel: interview.domain,
            levelLabel: interview.levelLabel,
            language,
            languageLabel: getInterviewLanguage(language).label,
            mode,
            voice: cachedVoice,
            bargeInEnabled,
            totalDurationMinutes,
            mockMode,
            selected_stages: selectedStages,
            stage_configs: stageConfigs,
            selected_question_ids: selectedQuestionIds,
            totalQuestions: getTotalTurnBudget(stageConfigs),
          })
        );
      } catch {
        // Backend owns session persistence. This isolated cache only provides room labels.
      }

      window.location.assign(`/practice/${sessionId}?language=${language}`);
    } catch (cause) {
      setSetupError(getStartErrorMessage(cause));
      setIsLaunching(false);
    }
  };

  if (isLoadingJd) {
    return (
      <main className={styles.pageShell} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16 }}>
        <Loader2 className="size-8 animate-spin text-[#d98236]" />
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Đang chuẩn bị phòng phỏng vấn theo JD của bạn...</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>Đang tải kịch bản câu hỏi và tiêu chí đánh giá STAR</p>
      </main>
    );
  }

  if (!interview) {
    return (
      <main className={styles.notFound}>
        <h1>{jdError || "Buổi phỏng vấn không tìm thấy"}</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
          {jdError ? "Vui lòng kiểm tra lại tiến trình tạo kịch bản từ JD hoặc quay lại danh sách." : "Không tìm thấy dữ liệu kịch bản cho buổi phỏng vấn này."}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/practice">Quay lại danh sách luyện tập</Link>
          {interviewId.startsWith("jd_") && (
            <Link href={`/practice/new?job_id=${interviewId}`} style={{ fontWeight: 600 }}>Xem tiến trình phân tích</Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pageShell}>
      <div className={styles.topbar}>
        <Button asChild variant="home-quiet" size="home-compact">
          <Link href="/practice">
            <ArrowLeft size={15} aria-hidden="true" />
            Quay lại danh sách
          </Link>
        </Button>
        <PageMascot className={styles.mascot} />
      </div>

      <div className={styles.layout}>
        <InterviewProfile interview={interview} />

        <aside className={`portal-panel ${styles.setupCard}`} aria-label="Thiết lập phỏng vấn">
          <header className={styles.setupHeader}>
            <h1>Thiết lập phỏng vấn</h1>
            <p>Tùy chỉnh phòng phỏng vấn AI trước khi bắt đầu.</p>
          </header>

          <CandidatePreferencePanel
            language={language}
            onLanguageChange={setLanguage}
            bargeInEnabled={bargeInEnabled}
            onBargeInChange={setBargeInEnabled}
            totalDurationMinutes={totalDurationMinutes}
            onTotalDurationMinutesChange={setTotalDurationMinutes}
            mockMode={mockMode}
            onMockModeChange={setMockMode}
          />

          <StageConfigEditor
            stageDefinitions={STAGE_DEFINITIONS}
            selectedStages={selectedStages}
            sourceModes={stageSourceModes}
            turnBudgets={stageTurns}
            selectedQuestionIds={stageSelectedQuestions}
            totalDurationMinutes={totalDurationMinutes}
            onToggleStage={toggleStage}
            onSourceModesChange={setStageSourceModes}
            onChooseQuestions={setSelectingStageKey}
          />

          <PlanSummary
            stageDefinitions={STAGE_DEFINITIONS}
            selectedStages={selectedStages}
            totalTurns={getTotalTurnBudget(stageConfigs)}
            totalDurationMinutes={totalDurationMinutes}
            isLaunching={isLaunching}
            isPlanValid={!planValidationError}
            validationMessage={planValidationError}
            error={setupError}
            onStart={() => void handleStartInterview()}
          />
        </aside>
      </div>

      {selectingStageKey ? (
        <QuestionBankDrawer
          stageKey={selectingStageKey}
          language={questionBankLanguage}
          selectedQuestionIds={stageSelectedQuestions[selectingStageKey] ?? []}
          onSelectedQuestionIdsChange={(questionIds) =>
            setStageSelectedQuestions((current) => ({
              ...current,
              [selectingStageKey]: questionIds,
            }))
          }
          onClose={() => setSelectingStageKey(null)}
        />
      ) : null}
    </main>
  );
}
