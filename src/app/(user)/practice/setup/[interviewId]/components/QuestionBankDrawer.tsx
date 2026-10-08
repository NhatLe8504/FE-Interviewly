"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Search, X } from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import type { QuestionOut, QuestionType } from "@/types/catalog";
import styles from "../setup.module.css";
import { Button } from "@/components/ui/button";

interface QuestionBankDrawerProps {
  stageKey: string;
  language: "vi" | "en";
  selectedQuestionIds: number[];
  onSelectedQuestionIdsChange: (questionIds: number[]) => void;
  onClose: () => void;
}

const PAGE_SIZE = 30;
const QUESTION_TYPE_OPTIONS: Array<{ value: "all" | QuestionType; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "technical", label: "Kỹ thuật" },
  { value: "behavioral", label: "Hành vi" },
  { value: "situational", label: "Tình huống" },
];

function getStageLabel(stageKey: string): string {
  if (stageKey === "warmup") return "Khởi động";
  if (stageKey === "technical") return "Chuyên môn";
  if (stageKey === "closing") return "Chào kết";
  return stageKey;
}

export function QuestionBankDrawer({
  stageKey,
  language,
  selectedQuestionIds,
  onSelectedQuestionIdsChange,
  onClose,
}: QuestionBankDrawerProps) {
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [questionType, setQuestionType] = useState<"all" | QuestionType>("all");
  const [draftQuestionIds, setDraftQuestionIds] = useState(() => [...selectedQuestionIds]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(
    async (nextOffset: number, append: boolean) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const page = await catalogApi.getQuestionsForSelection({
          language,
          type: questionType,
          search: submittedSearch,
          limit: PAGE_SIZE,
          offset: nextOffset,
        });
        setQuestions((current) => (append ? [...current, ...page.items] : page.items));
        setTotal(page.total);
        setOffset(nextOffset);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải Question Bank. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [language, questionType, submittedSearch]
  );

  useEffect(() => {
    void loadQuestions(0, false);
  }, [loadQuestions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleQuestion = (questionId: number) => {
    setDraftQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
  };

  const canLoadMore = questions.length < total;

  return (
    <div className={styles.drawerBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-bank-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="question-bank-title">Question Bank · {getStageLabel(stageKey)}</h2>
            <p>Chỉ các câu hỏi đang hoạt động, đã được duyệt mới có thể dùng trong phiên.</p>
          </div>
          <Button variant="home-quiet" size="home-compact" type="button" aria-label="Đóng Question Bank" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </Button>
        </header>

        <form className={styles.drawerFilters} onSubmit={submitSearch}>
          <label className={styles.searchField}>
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Tìm câu hỏi</span>
            <input
              className="portal-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm trong câu hỏi đã tải..."
            />
          </label>
          <Button variant="home-outline" size="home-compact" type="submit">Tìm</Button>
        </form>

        <div className={styles.filterPills} role="group" aria-label="Lọc loại câu hỏi">
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="home-choice"
              size="home-compact"
              type="button"
              aria-pressed={questionType === option.value}
              onClick={() => setQuestionType(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <p className={styles.selectionCount} aria-live="polite">
          Đang chọn {draftQuestionIds.length} câu hỏi cho chặng này.
        </p>

        {isLoading ? (
          <div className={`portal-panel ${styles.drawerStatus}`} aria-live="polite">
            <LoaderCircle className="animate-spin" size={24} aria-label="Đang tải câu hỏi" />
          </div>
        ) : error ? (
          <div className={["portal-panel", styles.drawerStatus, styles.drawerError].join(" ")} role="alert">
            <span>{error}</span>
            <Button variant="home-outline" size="home-compact" type="button" onClick={() => void loadQuestions(0, false)}>
              Thử lại
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <div className={`portal-panel ${styles.drawerStatus}`}>Không tìm thấy câu hỏi phù hợp trong catalog.</div>
        ) : (
          <div className={styles.questionList}>
            {questions.map((question) => {
              const isSelected = draftQuestionIds.includes(question.question_id);
              return (
                <label className={`portal-panel ${styles.questionOption}`} key={question.question_id}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleQuestion(question.question_id)}
                  />
                  <span>
                    <span className={styles.questionMeta}>
                      <strong>{question.question_type}</strong>
                      {question.difficulty ? <span>Độ khó: {question.difficulty}/5</span> : null}
                    </span>
                    <span className={styles.questionText}>{question.question_text}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {canLoadMore ? (
          <Button
            variant="home-outline"
            size="home-compact"
            className={styles.loadMore}
            type="button"
            disabled={isLoadingMore}
            onClick={() => void loadQuestions(offset + PAGE_SIZE, true)}
          >
            {isLoadingMore ? <LoaderCircle className="animate-spin" size={15} /> : <RefreshCw size={15} />}
            Tải thêm
          </Button>
        ) : null}

        <footer className={styles.drawerFooter}>
          <Button variant="home-outline" size="home-compact" type="button" onClick={onClose}>Hủy</Button>
          <Button
            variant="home-primary"
            size="home-compact"
            type="button"
            onClick={() => {
              onSelectedQuestionIdsChange(draftQuestionIds);
              onClose();
            }}
          >
            Xong ({draftQuestionIds.length})
          </Button>
        </footer>
      </section>
    </div>
  );
}
