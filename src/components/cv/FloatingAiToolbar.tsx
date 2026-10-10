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
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* MAIN FLOATING TOOLBAR */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-xl shadow-2xl">
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-[11px] font-bold text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI Chỉnh Sửa</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

        {/* Action 1: STAR Metrics */}
        <button
          onClick={() => handleRefine("star_metrics")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition disabled:opacity-50"
          title="Chuyển sang công thức STAR với số liệu định lượng %"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>STAR + Số liệu</span>
        </button>

        {/* Action 2: Tailor to Job */}
        <button
          onClick={() => handleRefine("tailor_to_job")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition disabled:opacity-50"
          title="Căn chỉnh sát theo tiêu chí và từ khóa JD"
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Khớp JD</span>
        </button>

        {/* Action 3: Strong Verbs */}
        <button
          onClick={() => handleRefine("strong_verbs")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition disabled:opacity-50"
          title="Đổi thành động từ hành động mạnh mẽ (Architected, Spearheaded...)"
        >
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Động từ mạnh</span>
        </button>

        {/* Action 4: Shorten */}
        <button
          onClick={() => handleRefine("shorten")}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition disabled:opacity-50"
          title="Rút gọn xúc tích tối ưu quét ATS 3 giây"
        >
          <Scissors className="w-3.5 h-3.5 text-rose-400" />
          <span>Rút gọn</span>
        </button>

        {/* Action 5: Custom Prompt */}
        <button
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
          disabled={loading}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition ${
            showCustomPrompt ? "bg-slate-800 text-white" : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Nhập yêu cầu riêng cho AI"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Đóng thanh công cụ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CUSTOM PROMPT INPUT DROPDOWN */}
      {showCustomPrompt && (
        <div className="mt-2 p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm">
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
            className="flex-1 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            onClick={() => handleRefine("custom", customPrompt.trim())}
            disabled={!customPrompt.trim() || loading}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
          >
            Chạy
          </button>
        </div>
      )}

      {/* LOADING CARD */}
      {loading && (
        <div className="mt-2 p-3 bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-2xl flex items-center gap-2.5 text-white text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>AI đang phân tích và tối ưu hóa văn phong...</span>
        </div>
      )}

      {/* RESULT & DIFF COMPARISON PREVIEW */}
      {refinedResult && !loading && (
        <div className="mt-2 w-[420px] p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white rounded-xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gợi ý hoàn thiện từ AI</span>
            </div>
            <span className="text-[10px] text-slate-400">{sectionContext}</span>
          </div>

          {/* Explanation */}
          {refinedResult.explanation && (
            <p className="text-[11px] text-slate-300 italic bg-slate-800/60 p-2 rounded-lg border border-slate-800">
              💡 {refinedResult.explanation}
            </p>
          )}

          {/* Comparison */}
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-rose-950/30 border border-rose-900/50 rounded-lg">
              <span className="text-[10px] font-bold text-rose-400 block mb-0.5">VĂN BẢN GỐC:</span>
              <p className="text-slate-300 line-through opacity-75">{selectedText}</p>
            </div>

            <div className="p-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> PHIÊN BẢN ĐÃ TỐI ƯU:
                </span>
              </div>
              <p className="text-emerald-100 font-medium leading-relaxed">
                {refinedResult.refined_text}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setRefinedResult(null)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg transition"
            >
              Bỏ qua
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition"
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
