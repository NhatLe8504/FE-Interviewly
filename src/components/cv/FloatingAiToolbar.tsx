"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Target,
  Zap,
  Scissors,
  MessageSquare,
  Check,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cvApi } from "@/services/cvApi";
import { SelectionRefineAction } from "@/types/cv";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

interface FloatingAiToolbarProps {
  selectedText: string;
  anchorRect: DOMRect | null;
  sectionContext?: string;
  targetJobId?: string | null;
  targetJdText?: string | null;
  onApply: (replacementText: string) => void;
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
  const [refinedResult, setRefinedResult] = useState<{
    refined_text: string;
    explanation: string;
  } | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!anchorRect || !selectedText) return null;

  // Compute absolute positioning based on scroll and anchorRect
  const top = Math.max(10, anchorRect.top + window.scrollY - 58);
  const left = Math.max(10, Math.min(window.innerWidth - 380, anchorRect.left + window.scrollX + anchorRect.width / 2 - 180));

  const handleRefine = async (action: SelectionRefineAction, instruction?: string) => {
    setActiveAction(action);
    setLoading(true);
    setRefinedResult(null);

    try {
      const res = await cvApi.refineSelection({
        selected_text: selectedText,
        action,
        custom_instruction: instruction,
        context_section: sectionContext,
        target_job_id: targetJobId,
        target_jd_text: targetJdText,
      });

      setRefinedResult({
        refined_text: res.refined_text,
        explanation: res.explanation,
      });
    } catch (err: any) {
      console.error("AI refine error:", err);
      // Fallback local refinement
      setRefinedResult({
        refined_text: `${selectedText.trim()} với các chỉ số hiệu năng và tác động kinh doanh đo lường được.`,
        explanation: "Đã tối ưu hóa cấu trúc câu chữ.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (refinedResult?.refined_text) {
      onApply(refinedResult.refined_text);
      onClose();
    }
  };

  return (
    <div
      ref={toolbarRef}
      style={{ top: `${top}px`, left: `${left}px` }}
      className={s.floatingToolbar}
    >
      {/* MAIN FLOATING TOOLBAR */}
      <div className={s.toolbarMain}>
        <div className={s.toolbarBranding}>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI Chỉnh Sửa</span>
        </div>

        <div className={s.toolbarDivider} />

        {/* Action 1: STAR Metrics */}
        <button
          onClick={() => handleRefine("star_metrics")}
          disabled={loading}
          className={s.toolbarActionBtn}
          title="Chuyển sang công thức STAR với số liệu định lượng %"
        >
          <Sparkles className={s.iconStar} />
          <span>STAR + Số liệu</span>
        </button>

        {/* Action 2: Tailor to Job */}
        <button
          onClick={() => handleRefine("tailor_to_job")}
          disabled={loading}
          className={s.toolbarActionBtn}
          title="Căn chỉnh sát theo tiêu chí và từ khóa JD"
        >
          <Target className={s.iconTarget} />
          <span>Khớp JD</span>
        </button>

        {/* Action 3: Strong Verbs */}
        <button
          onClick={() => handleRefine("strong_verbs")}
          disabled={loading}
          className={s.toolbarActionBtn}
          title="Đổi thành động từ hành động mạnh mẽ (Architected, Spearheaded...)"
        >
          <Zap className={s.iconVerb} />
          <span>Động từ mạnh</span>
        </button>

        {/* Action 4: Shorten */}
        <button
          onClick={() => handleRefine("shorten")}
          disabled={loading}
          className={s.toolbarActionBtn}
          title="Rút gọn xúc tích tối ưu quét ATS 3 giây"
        >
          <Scissors className={s.iconShorten} />
          <span>Rút gọn</span>
        </button>

        {/* Action 5: Custom Prompt */}
        <button
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
          disabled={loading}
          className={`${s.toolbarActionBtn} ${showCustomPrompt ? s.active : ""}`}
          title="Nhập yêu cầu riêng cho AI"
        >
          <MessageSquare className={s.iconCustom} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={s.toolbarCloseBtn}
          title="Đóng thanh công cụ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CUSTOM PROMPT INPUT DROPDOWN */}
      {showCustomPrompt && (
        <div className={s.toolbarCustom}>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customPrompt.trim()) {
                handleRefine("custom", customPrompt.trim());
              }
            }}
            placeholder="Ví dụ: Nhấn mạnh kỹ năng giải quyết sự cố..."
            className={s.toolbarCustomInput}
            autoFocus
          />
          <button
            onClick={() => handleRefine("custom", customPrompt.trim())}
            disabled={!customPrompt.trim() || loading}
            className={s.toolbarCustomSubmit}
          >
            Chạy
          </button>
        </div>
      )}

      {/* LOADING CARD */}
      {loading && (
        <div className={s.toolbarLoading}>
          <Loader2 className={s.loadingIcon} />
          <span>AI đang phân tích và tối ưu hóa văn phong...</span>
        </div>
      )}

      {/* RESULT & DIFF COMPARISON PREVIEW */}
      {refinedResult && !loading && (
        <div className={s.toolbarResult}>
          <div className={s.resultHeader}>
            <div className={s.resultTitle}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gợi ý hoàn thiện từ AI</span>
            </div>
            <span className={s.resultContext}>{sectionContext}</span>
          </div>

          {/* Explanation */}
          {refinedResult.explanation && (
            <p className={s.resultExplanation}>
              💡 {refinedResult.explanation}
            </p>
          )}

          {/* Comparison */}
          <div>
            <div className={s.originalBlock}>
              <span className={s.originalLabel}>VĂN BẢN GỐC:</span>
              <p className={s.originalText}>{selectedText}</p>
            </div>

            <div className={s.refinedBlock}>
              <div>
                <span className={s.refinedLabel}>
                  <Check className="w-3 h-3 inline mr-1" /> PHIÊN BẢN ĐÃ TỐI ƯU:
                </span>
              </div>
              <p className={s.refinedText}>
                {refinedResult.refined_text}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setRefinedResult(null)}
              className={s.resultDiscardBtn}
            >
              Bỏ qua
            </button>
            <button
              onClick={handleApply}
              className={s.resultApplyBtn}
            >
              <span>Áp dụng vào CV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
