"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CvColorTheme,
  CvDocument,
  CvFontFamily,
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
  Type,
  ZoomIn,
  ZoomOut,
  Check,
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

  const barRef = useRef<HTMLElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenTemplateMenu(false);
        setOpenColorMenu(false);
        setOpenFontMenu(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeColor = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.navy;

  return (
    <aside ref={barRef} className={s.topBar}>
      <div className={s.topBarInner}>
        {/* AI Draft */}
        <button
          onClick={onGenerateAiDraft}
          className={s.aiDraftBtn}
          title="AI Tạo Bản Thảo"
        >
          <Sparkles style={{ width: 16, height: 16 }} />
        </button>

        <div className={s.topBarDivider} />

        {/* Template Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setOpenTemplateMenu(!openTemplateMenu);
              setOpenColorMenu(false);
              setOpenFontMenu(false);
            }}
            className={s.controlBtn}
            title={`Mẫu: ${CV_TEMPLATES_INFO.find((t) => t.id === cv.template_id)?.name || "Modern Tech"}`}
          >
            <Layout className={s.controlBtnIcon} />
          </button>
          {openTemplateMenu && (
            <div className={`${s.dropdown} ${s.templateDropdown}`}>
              <div className={s.dropdownLabel}>Chọn mẫu CV (5 Mẫu)</div>
              {CV_TEMPLATES_INFO.map((tpl) => {
                const isActive = cv.template_id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onUpdate({ template_id: tpl.id });
                      setOpenTemplateMenu(false);
                    }}
                    className={`${s.dropdownItem} ${isActive ? s.dropdownItemActive : ""}`}
                  >
                    <div>
                      <div className={s.dropdownItemTitle}>
                        <span>{tpl.name}</span>
                        <span className={s.dropdownItemBadge}>{tpl.badge}</span>
                      </div>
                      <p className={s.dropdownItemDesc}>{tpl.description}</p>
                    </div>
                    {isActive && <Check className={s.dropdownItemCheck} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Color Palette */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setOpenColorMenu(!openColorMenu);
              setOpenTemplateMenu(false);
              setOpenFontMenu(false);
            }}
            className={s.controlBtn}
            title={`Màu: ${cv.color_theme}`}
          >
            <span
              className={s.colorSwatch}
              style={{ backgroundColor: activeColor.primary, width: 16, height: 16 }}
            />
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
                    className={`${s.colorItem} ${isSelected ? s.colorItemActive : ""}`}
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

        {/* Typography */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setOpenFontMenu(!openFontMenu);
              setOpenTemplateMenu(false);
              setOpenColorMenu(false);
            }}
            className={s.controlBtn}
            title={`Font: ${(CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.inter).name}`}
          >
            <Type className={s.controlBtnIcon} />
          </button>
          {openFontMenu && (
            <div className={`${s.dropdown} ${s.fontDropdown}`}>
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
                    className={`${s.dropdownItem} ${isSelected ? s.dropdownItemActive : ""}`}
                  >
                    <span>{f.name}</span>
                    {isSelected && <Check className={s.dropdownItemCheck} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={s.topBarDivider} />

        {/* Zoom */}
        <div className={s.zoomControls} style={{ flexDirection: "column", padding: "4px 2px" }}>
          <button
            onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
            className={s.zoomBtn}
            title="Phóng to"
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
          <span className={s.zoomLabel}>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))}
            className={s.zoomBtn}
            title="Thu nhỏ"
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div className={s.topBarDivider} />

        {/* Print */}
        <button
          onClick={() => window.print()}
          className={s.controlBtn}
          title="In / Xuất PDF"
        >
          <Printer className={s.controlBtnIcon} />
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={saving}
          className={s.saveBtn}
          title={saving ? "Đang lưu..." : "Lưu CV"}
        >
          <Save style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </aside>
  );
};
