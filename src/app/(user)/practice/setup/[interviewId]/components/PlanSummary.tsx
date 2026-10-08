"use client";

import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StageDefinition } from "./StageConfigEditor";
import type { PracticeStageKey } from "../setupPlan";
import styles from "../setup.module.css";

interface PlanSummaryProps {
  stageDefinitions: readonly StageDefinition[];
  selectedStages: PracticeStageKey[];
  totalTurns: number;
  isLaunching: boolean;
  isPlanValid: boolean;
  validationMessage: string | null;
  error: string | null;
  onStart: () => void;
}

export function PlanSummary({
  stageDefinitions,
  selectedStages,
  totalTurns,
  isLaunching,
  isPlanValid,
  validationMessage,
  error,
  onStart,
}: PlanSummaryProps) {
  const selectedStageLabels = selectedStages.map(
    (stageKey) => stageDefinitions.find((stage) => stage.id === stageKey)?.label ?? stageKey
  );
  const isStartDisabled = isLaunching || !isPlanValid;

  return (
    <section className={styles.summaryPanel} aria-labelledby="plan-summary-heading">
      <div className={styles.summaryHeader}>
        <Sparkles size={16} aria-hidden="true" />
        <div>
          <h2 id="plan-summary-heading">Kế hoạch phiên</h2>
          <p>{totalTurns} lượt hỏi dự kiến</p>
        </div>
      </div>

      <ol className={styles.stagePreview} aria-label="Thứ tự các chặng được chọn">
        {selectedStageLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>

      <Button
        variant="home-primary"
        className="w-full"
        type="button"
        disabled={isStartDisabled}
        onClick={onStart}
      >
        <Play size={18} aria-hidden="true" />
        {isLaunching ? "Đang chuẩn bị phòng..." : "Bắt đầu phỏng vấn"}
      </Button>

      {error || validationMessage ? (
        <p className={styles.errorMessage} role="alert">{error ?? validationMessage}</p>
      ) : null}

      <p className={styles.summaryHint}>
        Trong phòng, bạn chọn ngôn ngữ và trả lời bằng giọng nói hoặc văn bản.
      </p>
    </section>
  );
}
