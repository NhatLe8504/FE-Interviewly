import type { QuestionSourceMode, StageConfigIn } from "@/types/interview";

export const PRACTICE_STAGE_ORDER = ["warmup", "technical", "closing"] as const;
export const MAX_STAGE_TURNS = 3;
export const MAX_SESSION_TURNS = 5;

export type PracticeStageKey = (typeof PRACTICE_STAGE_ORDER)[number];

export type StageSourceModes = Record<PracticeStageKey, QuestionSourceMode>;
export type StageTurnBudgets = Record<PracticeStageKey, number>;
export type StageQuestionSelections = Record<PracticeStageKey, number[]>;

export const DEFAULT_STAGE_SOURCE_MODES: StageSourceModes = {
  warmup: "auto_random",
  technical: "auto_random",
  closing: "auto_random",
};

export const DEFAULT_STAGE_TURN_BUDGETS: StageTurnBudgets = {
  warmup: 1,
  technical: 2,
  closing: 1,
};

export const DEFAULT_STAGE_QUESTION_SELECTIONS: StageQuestionSelections = {
  warmup: [],
  technical: [],
  closing: [],
};

export function buildStageConfigs(
  selectedStages: readonly string[],
  sourceModes: Record<string, QuestionSourceMode>,
  turnBudgets: Record<string, number>,
  selectedQuestionIds: Record<string, number[]>
): StageConfigIn[] {
  return PRACTICE_STAGE_ORDER.filter((stageKey) => selectedStages.includes(stageKey)).map(
    (stageKey) => {
      const sourceMode = sourceModes[stageKey] ?? "auto_random";
      const questionIds = sourceMode === "auto_random"
        ? []
        : [...new Set(selectedQuestionIds[stageKey] ?? [])];

      return {
        stage_key: stageKey,
        source_mode: sourceMode,
        min_turns: 1,
        max_turns: turnBudgets[stageKey] ?? DEFAULT_STAGE_TURN_BUDGETS[stageKey],
        selected_question_ids: questionIds,
      };
    }
  );
}

export function getPlanValidationError(stageConfigs: StageConfigIn[]): string | null {
  if (stageConfigs.length === 0) {
    return "Hãy chọn ít nhất một chặng phỏng vấn.";
  }

  const selectedQuestionOwners = new Map<number, string>();
  const configuredStages = new Set<string>();
  let totalTurns = 0;

  for (const stageConfig of stageConfigs) {
    if (!PRACTICE_STAGE_ORDER.includes(stageConfig.stage_key as PracticeStageKey)) {
      return `Chặng ${stageConfig.stage_key} không được hỗ trợ.`;
    }
    if (configuredStages.has(stageConfig.stage_key)) {
      return `Chặng ${stageConfig.stage_key} đang được cấu hình nhiều hơn một lần.`;
    }
    configuredStages.add(stageConfig.stage_key);

    if (
      stageConfig.min_turns < 1 ||
      stageConfig.max_turns < stageConfig.min_turns ||
      stageConfig.max_turns > MAX_STAGE_TURNS
    ) {
      return `Số lượt hỏi của chặng ${stageConfig.stage_key} chưa hợp lệ.`;
    }
    totalTurns += stageConfig.max_turns;

    const questionIds = stageConfig.selected_question_ids ?? [];
    if (
      stageConfig.source_mode === "manual" &&
      questionIds.length < stageConfig.max_turns
    ) {
      return `Chặng ${stageConfig.stage_key} cần chọn tối thiểu ${stageConfig.max_turns} câu hỏi thủ công.`;
    }
    if (stageConfig.source_mode === "mixed" && questionIds.length === 0) {
      return `Chặng ${stageConfig.stage_key} ở chế độ kết hợp cần ít nhất một câu hỏi tự chọn.`;
    }

    for (const questionId of questionIds) {
      if (!Number.isInteger(questionId) || questionId < 1) {
        return "Mã câu hỏi trong kế hoạch chưa hợp lệ.";
      }
      const owner = selectedQuestionOwners.get(questionId);
      if (owner && owner !== stageConfig.stage_key) {
        return "Một câu hỏi chỉ được gán cho một chặng trong cùng kế hoạch.";
      }
      selectedQuestionOwners.set(questionId, stageConfig.stage_key);
    }
  }

  if (totalTurns > MAX_SESSION_TURNS) {
    return `Tổng lượt hỏi tối đa cho một phiên là ${MAX_SESSION_TURNS}.`;
  }

  return null;
}

export function getPlanQuestionIds(stageConfigs: StageConfigIn[]): number[] {
  return [...new Set(stageConfigs.flatMap((config) => config.selected_question_ids ?? []))];
}

export function getTotalTurnBudget(stageConfigs: StageConfigIn[]): number {
  return stageConfigs.reduce((total, config) => total + config.max_turns, 0);
}
