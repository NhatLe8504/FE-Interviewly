"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, MessageSquare, Scissors, Sparkles, Target, X } from "lucide-react";
import { cvApi } from "@/services/cvApi";
import { SelectionRefineAction } from "@/types/cv";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

interface FloatingAiToolbarProps {
  selectedText: string;
  anchorRect: DOMRect | null;
  sectionContext?: string;
  targetJobId?: string | null;
  targetJdText?: string | null;
  onApply: (replacementText: string) => boolean;
  onClose: () => void;
}

export const FloatingAiToolbar: React.FC<FloatingAiToolbarProps> = ({
  selectedText,
  anchorRect,
  sectionContext = "general",
  targetJobId,
  targetJdText,
  onApply,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<SelectionRefineAction | null>(null);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!anchorRect || !toolbarRef.current) return;

    const updatePosition = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      const width = toolbar.offsetWidth;
      const height = toolbar.offsetHeight;
      const topSafe = 72;
      const gap = 10;
      const above = anchorRect.top - topSafe;
      const below = window.innerHeight - anchorRect.bottom - 12;
      const placeAbove = above >= height + gap || above > below;
      const desiredTop = placeAbove ? anchorRect.top - height - gap : anchorRect.bottom + gap;

      setPosition({
        top: Math.max(topSafe, Math.min(window.innerHeight - height - 12, desiredTop)),
        left: Math.max(12, Math.min(window.innerWidth - width - 12, anchorRect.left + anchorRect.width / 2 - width / 2)),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [anchorRect, loading, refinedText, error, showCustomPrompt]);

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) onClose();
    };
    const handleScroll = (event: Event) => {
      if (toolbarRef.current && event.target instanceof Node && toolbarRef.current.contains(event.target)) return;
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  if (!anchorRect || !selectedText) return null;

  const handleRefine = async (action: SelectionRefineAction, instruction?: string) => {
    setActiveAction(action);
    setShowCustomPrompt(false);
    setLoading(true);
    setError("");
    setRefinedText("");
    setHasResult(false);

    try {
      const result = await cvApi.refineSelection({
        selected_text: selectedText,
        action,
        custom_instruction: instruction,
        context_section: sectionContext,
        target_job_id: targetJobId,
        target_jd_text: targetJdText,
      });
      if (!result.refined_text?.trim()) throw new Error("AI chưa tạo được gợi ý. Vui lòng thử lại.");
      setRefinedText(result.refined_text);
      setHasResult(true);
      setExplanation(result.explanation);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Không thể kết nối AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (refinedText.trim() && onApply(refinedText.trim())) onClose();
  };

  return (
    <div
      ref={toolbarRef}
      style={position ? { top: position.top, left: position.left } : { visibility: "hidden" }}
      className={s.floatingToolbar}
      role="group"
      aria-label="Chỉnh sửa đoạn CV bằng AI"
    >
      <div className={s.toolbarMain}>
        <button type="button" onClick={() => handleRefine("strong_verbs")} disabled={loading} className={`${s.toolbarActionBtn} ${s.toolbarPrimaryBtn}`} title="Viết lại rõ ràng, chủ động hơn">
          <Sparkles size={16} aria-hidden="true" /> Cải thiện
        </button>
        <button type="button" onClick={() => handleRefine("shorten")} disabled={loading} className={s.toolbarActionBtn} title="Rút gọn nhưng giữ nguyên ý chính">
          <Scissors size={16} aria-hidden="true" /> Rút gọn
        </button>
        {(targetJobId || targetJdText) && (
          <button type="button" onClick={() => handleRefine("tailor_to_job")} disabled={loading} className={s.toolbarActionBtn} title="Điều chỉnh theo JD, không thêm kinh nghiệm chưa có">
            <Target size={16} aria-hidden="true" /> Khớp JD
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowCustomPrompt((open) => !open)}
          disabled={loading}
          aria-label="Nhập yêu cầu riêng cho AI"
          aria-expanded={showCustomPrompt}
          className={`${s.toolbarActionBtn} ${s.toolbarIconBtn} ${showCustomPrompt ? s.toolbarActionActive : ""}`}
          title="Yêu cầu riêng"
        >
          <MessageSquare size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={onClose} aria-label="Đóng chỉnh sửa AI" className={`${s.toolbarActionBtn} ${s.toolbarIconBtn}`} title="Đóng">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {showCustomPrompt && (
        <form
          className={s.toolbarCustom}
          onSubmit={(event) => {
            event.preventDefault();
            if (customPrompt.trim()) void handleRefine("custom", customPrompt.trim());
          }}
        >
          <label htmlFor="cv-ai-instruction" className={s.toolbarLabel}>Bạn muốn sửa đoạn này thế nào?</label>
          <div className={s.toolbarInputRow}>
            <input
              id="cv-ai-instruction"
              type="text"
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              placeholder="Ví dụ: viết chuyên nghiệp hơn..."
              className={s.toolbarCustomInput}
              autoFocus
            />
            <button type="submit" disabled={!customPrompt.trim()} className={s.toolbarCustomSubmit} aria-label="Gửi yêu cầu cho AI" title="Gửi yêu cầu">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className={s.toolbarNotice} role="status">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" /> AI đang viết lại đoạn đã chọn...
        </div>
      )}

      {error && !loading && (
        <div className={`${s.toolbarNotice} ${s.toolbarError}`} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void handleRefine(activeAction ?? "strong_verbs", activeAction === "custom" ? customPrompt.trim() : undefined)}>Thử lại</button>
        </div>
      )}

      {hasResult && !loading && (
        <div className={s.toolbarResult}>
          <div className={s.resultHeader}>
            <span className={s.resultTitle}><Sparkles size={15} aria-hidden="true" /> Gợi ý từ AI</span>
            <span className={s.resultHint}>Sửa trực tiếp trước khi dùng</span>
          </div>
          <label htmlFor="cv-ai-result" className={s.toolbarLabel}>Nội dung thay thế</label>
          <textarea
            id="cv-ai-result"
            className={s.refinedInput}
            value={refinedText}
            onChange={(event) => setRefinedText(event.target.value)}
            rows={Math.min(7, Math.max(3, Math.ceil(refinedText.length / 52)))}
          />
          {explanation && <p className={s.resultExplanation}>{explanation}</p>}
          <details className={s.originalDetails}>
            <summary>Xem đoạn gốc</summary>
            <p>{selectedText}</p>
          </details>
          <div className={s.resultActions}>
            <button type="button" onClick={onClose} className={s.resultDiscardBtn}>Bỏ qua</button>
            <button type="button" onClick={handleApply} disabled={!refinedText.trim()} className={s.resultApplyBtn}>Áp dụng <ArrowRight size={15} aria-hidden="true" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
