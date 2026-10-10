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

import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

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
    <header className={s.topBar}>
      <div className={s.topBarInner}>
        {/* LEFT: Title & Job Tag */}
        <div className="flex items-center gap-3">
          <div>
            <input
              type="text"
              value={cv.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className={s.titleInput}
              placeholder="Tên bản CV..."
            />
            {cv.target_job_title && (
              <div className={s.jobTag}>
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
              className={s.controlBtn}
            >
              <Layout className={s.controlBtnIcon} />
              <span>{activeTemplate.name}</span>
              <ChevronDown className={s.controlBtnChevron} />
            </button>

            {openTemplateMenu && (
              <div className={`${s.dropdown} ${s.templateDropdown}`}>
                <div className={s.dropdownLabel}>
                  Chọn mẫu CV (5 Mẫu chuyên nghiệp)
                </div>
                <div className="space-y-1">
                  {CV_TEMPLATES_INFO.map((tpl) => {
                    const isActive = cv.template_id === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => {
                          onUpdate({ template_id: tpl.id });
                          setOpenTemplateMenu(false);
                        }}
                        className={`${s.dropdownItem} ${isActive ? s.dropdownItemActive : ''}`}
                      >
                        <div>
                          <div className={s.dropdownItemTitle}>
                            <span>{tpl.name}</span>
                            <span className={s.dropdownItemBadge}>
                              {tpl.badge}
                            </span>
                          </div>
                          <p className={s.dropdownItemDesc}>
                            {tpl.description}
                          </p>
                        </div>
                        {isActive && (
                          <Check className={s.dropdownItemCheck} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Color Palette Selector */}
          <div className="relative">
            <button
              onClick={() => setOpenColorMenu(!openColorMenu)}
              className={s.controlBtn}
              title="Đổi tông màu chủ đạo"
            >
              <span
                className={s.colorSwatch}
                style={{ backgroundColor: activeColor.primary }}
              />
              <span className="capitalize">{cv.color_theme}</span>
              <ChevronDown className={s.controlBtnChevron} />
            </button>

            {openColorMenu && (
              <div className={`${s.dropdown} ${s.colorDropdown}`}>
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
                      className={`${s.colorItem} ${isSelected ? s.colorItemActive : ''}`}
                    >
                      <span
                        className={s.colorSwatch}
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
              className={s.controlBtn}
              title="Đổi bộ font chữ"
            >
              <Type className={s.controlBtnIcon} />
              <span>{activeFont.name.split(" ")[0]}</span>
              <ChevronDown className={s.controlBtnChevron} />
            </button>

            {openFontMenu && (
              <div className={`${s.dropdown} ${s.fontDropdown}`}>
                <div className="space-y-1">
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
                        className={`${s.dropdownItem} ${isSelected ? s.dropdownItemActive : ''}`}
                      >
                        <span>{f.name}</span>
                        {isSelected && <Check className={s.dropdownItemCheck} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className={s.zoomControls}>
            <button
              onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))}
              className={s.zoomBtn}
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={s.zoomLabel}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
              className={s.zoomBtn}
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
            className={s.aiDraftBtn}
            title="Sinh lại toàn bộ bản thảo CV thông minh bằng AI"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Tạo Bản Thảo</span>
          </button>

          {/* Print / Export PDF */}
          <button
            onClick={() => window.print()}
            className={s.controlBtn}
            title="Xuất bản in PDF (A4 tiêu chuẩn)"
          >
            <Printer className={s.controlBtnIcon} />
            <span className="hidden sm:inline">In / Xuất PDF</span>
          </button>

          {/* Save CV */}
          <button
            onClick={onSave}
            disabled={saving}
            className={s.saveBtn}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu CV"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
