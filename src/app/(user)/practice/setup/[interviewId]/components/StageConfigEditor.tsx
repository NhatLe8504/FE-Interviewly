"use client";

import type { CSSProperties } from "react";
import { Check, type LucideIcon } from "lucide-react";
import type { QuestionSourceMode } from "@/types/interview";
import type {
  PracticeStageKey,
  StageQuestionSelections,
  StageSourceModes,
  StageTurnBudgets,
} from "../setupPlan";
import styles from "../setup.module.css";

export interface StageDefinition {
  id: PracticeStageKey;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface StageConfigEditorProps {
  stageDefinitions: readonly StageDefinition[];
  selectedStages: PracticeStageKey[];
  sourceModes: StageSourceModes;
  turnBudgets: StageTurnBudgets;
  selectedQuestionIds: StageQuestionSelections;
  onToggleStage: (stageKey: PracticeStageKey) => void;
  onSourceModesChange: (nextSourceModes: StageSourceModes) => void;
  onTurnBudgetsChange: (nextTurnBudgets: StageTurnBudgets) => void;
  onChooseQuestions: (stageKey: PracticeStageKey) => void;
}

const SOURCE_OPTIONS: Array<{ id: QuestionSourceMode; label: string }> = [
  { id: "auto_random", label: "Ngẫu nhiên" },
  { id: "manual", label: "Tự chọn" },
  { id: "mixed", label: "Kết hợp" },
];

export function StageConfigEditor({
  stageDefinitions,
  selectedStages,
  sourceModes,
  turnBudgets,
  selectedQuestionIds,
  onToggleStage,
  onSourceModesChange,
  onTurnBudgetsChange,
  onChooseQuestions,
}: StageConfigEditorProps) {
  return (
    <fieldset className={styles.stageFieldset}>
      <legend className={styles.stageLegend}>
        <span>Các chặng phỏng vấn</span>
        <strong>{selectedStages.length}/{stageDefinitions.length}</strong>
      </legend>

      <div className={styles.stageList}>
        {stageDefinitions.map((stage) => {
          const isActive = selectedStages.includes(stage.id);
          const sourceMode = sourceModes[stage.id];
          const selectedCount = selectedQuestionIds[stage.id].length;
          const Icon = stage.icon;

          return (
            <article
              key={stage.id}
              className={[styles.stageCard, isActive ? styles.stageCardActive : ""].filter(Boolean).join(" ")}
            >
              <label className={styles.stageToggle} htmlFor={"stage-" + stage.id}>
                <input
                  id={"stage-" + stage.id}
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleStage(stage.id)}
                />
                <span
                  className={styles.stageIcon}
                  style={{ "--stage-color": stage.color } as CSSProperties}
                  aria-hidden="true"
                >
                  {isActive ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}
                </span>
                <span className={styles.stageText}>
                  <strong>{stage.label}</strong>
                  <small>{stage.description}</small>
                </span>
                {isActive ? <em>~{turnBudgets[stage.id]} lượt</em> : null}
              </label>

              {isActive ? (
                <div className={styles.stageSettings}>
                  <div className={styles.compactControl}>
                    <span>Nguồn câu hỏi</span>
                    <div className={styles.segmentedControl}>
                      {SOURCE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          className={sourceMode === option.id ? styles.segmentedActive : ""}
                          type="button"
                          aria-pressed={sourceMode === option.id}
                          onClick={() =>
                            onSourceModesChange({
                              ...sourceModes,
                              [stage.id]: option.id,
                            })
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.compactControl}>
                    <span>Số lượt hỏi</span>
                    <div className={styles.segmentedControl}>
                      {[1, 2, 3].map((turns) => (
                        <button
                          key={turns}
                          className={turnBudgets[stage.id] === turns ? styles.segmentedActive : ""}
                          type="button"
                          aria-pressed={turnBudgets[stage.id] === turns}
                          onClick={() =>
                            onTurnBudgetsChange({
                              ...turnBudgets,
                              [stage.id]: turns,
                            })
                          }
                        >
                          {turns}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sourceMode !== "auto_random" ? (
                    <button
                      className={styles.questionBankButton}
                      type="button"
                      onClick={() => onChooseQuestions(stage.id)}
                    >
                      Chọn từ ngân hàng câu hỏi
                      <span>{selectedCount} đã chọn</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </fieldset>
  );
}
