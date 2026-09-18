"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Coffee, Handshake } from "lucide-react";
import { PRE_MADE_INTERVIEWS } from "@/data/mockInterviews";
import { ApiError } from "@/services/apiClient";
import { interviewApi } from "@/services/interviewApi";
import { CandidatePreferencePanel } from "./components/CandidatePreferencePanel";
import { InterviewProfile } from "./components/InterviewProfile";
import { PlanSummary } from "./components/PlanSummary";
import { StageConfigEditor, type StageDefinition } from "./components/StageConfigEditor";
import { QuestionBankDrawer } from "./components/QuestionBankDrawer";
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
  const interview = useMemo(
    () => PRE_MADE_INTERVIEWS.find((item) => item.id === interviewId) ?? null,
    [interviewId]
  );
  const [selectedStages, setSelectedStages] = useState<PracticeStageKey[]>([
    "warmup",
    "technical",
    "closing",
  ]);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [bargeInEnabled, setBargeInEnabled] = useState(false);
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

  const handleModeChange = (nextMode: "voice" | "text") => {
    setMode(nextMode);
    if (nextMode === "text") setBargeInEnabled(false);
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
      const createdSession = await interviewApi.startSession({
        role_name: interview.title,
        level: interview.level,
        language,
        mode,
        barge_in_enabled: bargeInEnabled,
        stage_configs: stageConfigs,
        selected_question_ids: selectedQuestionIds,
      });
      const sessionId = createdSession.session_id;
      if (sessionId === undefined || sessionId === null || String(sessionId).trim() === "") {
        throw new Error("Backend không trả về mã phiên phỏng vấn hợp lệ.");
      }

      try {
        sessionStorage.setItem(
          `session_metadata_${sessionId}`,
          JSON.stringify({
            roleLabel: interview.title,
            companyName: interview.company,
            domainLabel: interview.domain,
            levelLabel: interview.levelLabel,
            languageLabel: language === "vi" ? "Tiếng Việt" : "English",
            mode,
            bargeInEnabled,
            selected_stages: selectedStages,
            stage_configs: stageConfigs,
            selected_question_ids: selectedQuestionIds,
            totalQuestions: getTotalTurnBudget(stageConfigs),
          })
        );
      } catch {
        // Backend owns session persistence. This isolated cache only provides room labels.
      }

      window.location.assign(`/practice/${sessionId}`);
    } catch (cause) {
      setSetupError(getStartErrorMessage(cause));
      setIsLaunching(false);
    }
  };

  if (!interview) {
    return (
      <main className={styles.notFound}>
        <h1>Buổi phỏng vấn không tìm thấy</h1>
        <Link href="/practice">Quay lại danh sách luyện tập</Link>
      </main>
    );
  }

  return (
    <main className={styles.pageShell}>
      <Link className={styles.backLink} href="/practice">
        <ArrowLeft size={15} aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <div className={styles.layout}>
        <InterviewProfile interview={interview} />

        <aside className={styles.setupCard} aria-label="Thiết lập phỏng vấn">
          <header className={styles.setupHeader}>
            <h1>Thiết lập phỏng vấn</h1>
            <p>Tùy chỉnh phòng phỏng vấn AI trước khi bắt đầu.</p>
          </header>

          <CandidatePreferencePanel
            mode={mode}
            language={language}
            bargeInEnabled={bargeInEnabled}
            onModeChange={handleModeChange}
            onLanguageChange={setLanguage}
            onBargeInChange={setBargeInEnabled}
          />

          <StageConfigEditor
            stageDefinitions={STAGE_DEFINITIONS}
            selectedStages={selectedStages}
            sourceModes={stageSourceModes}
            turnBudgets={stageTurns}
            selectedQuestionIds={stageSelectedQuestions}
            onToggleStage={toggleStage}
            onSourceModesChange={setStageSourceModes}
            onTurnBudgetsChange={setStageTurns}
            onChooseQuestions={setSelectingStageKey}
          />

          <PlanSummary
            stageDefinitions={STAGE_DEFINITIONS}
            selectedStages={selectedStages}
            totalTurns={getTotalTurnBudget(stageConfigs)}
            mode={mode}
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
          language={language}
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
