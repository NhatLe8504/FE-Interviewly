"use client";

import React, { useState } from "react";
import {
  CvColorTheme,
  CvDocument,
  CvFontFamily,
  CvTemplateId,
} from "@/types/cv";
import {
  CV_COLOR_THEMES,
  CV_FONT_FAMILIES,
  CV_TEMPLATES_INFO,
} from "./cvThemes";
import {
  Save,
  Printer,
  Sparkles,
  Layout,
  Palette,
  Type,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  Briefcase,
  Layers,
} from "lucide-react";

interface CvTopBarProps {
  cv: CvDocument;
  onUpdate: (updated: Partial<CvDocument>) => void;
  onSave: () => void;
  saving?: boolean;
  onGenerateAiDraft: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const CvTopBar: React.FC<CvTopBarProps> = ({
  cv,
  onUpdate,
  onSave,
  saving = false,
  onGenerateAiDraft,
  zoom,
  onZoomChange,
}) => {
  const [openTemplateMenu, setOpenTemplateMenu] = useState(false);
  const [openColorMenu, setOpenColorMenu] = useState(false);
  const [openFontMenu, setOpenFontMenu] = useState(false);

  const activeTemplate = CV_TEMPLATES_INFO.find((t) => t.id === cv.template_id) || CV_TEMPLATES_INFO[0];
  const activeColor = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.navy;
  const activeFont = CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.inter;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* LEFT: Title & Job Tag */}
        <div className="flex items-center gap-3">
          <div>
            <input
              type="text"
              value={cv.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded transition"
              placeholder="Tên bản CV..."
            />
            {cv.target_job_title && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium px-1">
                <Briefcase className="w-3 h-3" />
                <span>Mục tiêu: {cv.target_job_title}</span>
                {cv.target_company_name && <span>({cv.target_company_name})</span>}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Customization Controls (Template, Color, Font) */}
        <div className="flex items-center gap-2">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setOpenTemplateMenu(!openTemplateMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            >
              <Layout className="w-3.5 h-3.5 text-blue-500" />
              <span>{activeTemplate.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {openTemplateMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">
                  Chọn mẫu CV (5 Mẫu chuyên nghiệp)
                </div>
                <div className="space-y-1">
                  {CV_TEMPLATES_INFO.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        onUpdate({ template_id: tpl.id });
                        setOpenTemplateMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex items-start justify-between gap-2 ${
                        cv.template_id === tpl.id
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{tpl.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-normal">
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                      {cv.template_id === tpl.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color Palette Selector */}
          <div className="relative">
            <button
              onClick={() => setOpenColorMenu(!openColorMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
              title="Đổi tông màu chủ đạo"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: activeColor.primary }}
              />
              <span className="capitalize">{cv.color_theme}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {openColorMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 grid grid-cols-2 gap-1.5">
                {(Object.keys(CV_COLOR_THEMES) as CvColorTheme[]).map((themeKey) => {
                  const t = CV_COLOR_THEMES[themeKey];
                  const isSelected = cv.color_theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => {
                        onUpdate({ color_theme: themeKey });
                        setOpenColorMenu(false);
                      }}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs capitalize transition ${
                        isSelected
                          ? "bg-slate-100 dark:bg-slate-800 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span>{themeKey}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Typography Selector */}
          <div className="relative">
            <button
              onClick={() => setOpenFontMenu(!openFontMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
              title="Đổi bộ font chữ"
            >
              <Type className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeFont.name.split(" ")[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {openFontMenu && (
              <div className="absolute right-0 md:left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                {(Object.keys(CV_FONT_FAMILIES) as CvFontFamily[]).map((fontKey) => {
                  const f = CV_FONT_FAMILIES[fontKey];
                  const isSelected = cv.font_family === fontKey;
                  return (
                    <button
                      key={fontKey}
                      onClick={() => {
                        onUpdate({ font_family: fontKey });
                        setOpenFontMenu(false);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-medium px-1 text-slate-600 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: Action Buttons (AI Draft, Save, Print) */}
        <div className="flex items-center gap-2">
          {/* AI Generator Draft */}
          <button
            onClick={onGenerateAiDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg shadow-md transition"
            title="Sinh lại toàn bộ bản thảo CV thông minh bằng AI"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Tạo Bản Thảo</span>
          </button>

          {/* Print / Export PDF */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            title="Xuất bản in PDF (A4 tiêu chuẩn)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">In / Xuất PDF</span>
          </button>

          {/* Save CV */}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg shadow-md transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu CV"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
