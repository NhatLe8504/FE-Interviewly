"use client";

import React, { useRef, useEffect } from "react";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

interface EditableTextProps {
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  isEditable?: boolean;
  sectionContext?: string;
  onTextSelect?: (selection: { text: string; rect: DOMRect; sectionContext: string }) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = "",
  style,
  placeholder = "Nhập nội dung...",
  tag: Tag = "span",
  isEditable = true,
  sectionContext = "general",
  onTextSelect,
}) => {
  const ref = useRef<HTMLElement>(null);

  // Sync value when external state changes, preserving cursor if not currently focused
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      if (document.activeElement !== ref.current) {
        ref.current.innerText = value || "";
      }
    }
  }, [value]);

  const handleBlur = () => {
    if (ref.current && onChange) {
      const text = ref.current.innerText;
      if (text !== value) {
        onChange(text);
      }
    }
  };

  const handleMouseUp = () => {
    if (!onTextSelect) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const text = sel.toString().trim();
    if (text.length > 2 && ref.current && ref.current.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onTextSelect({
        text,
        rect,
        sectionContext,
      });
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Shift" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      handleMouseUp();
    }
  };

  const editableClasses = isEditable
    ? `${s.editableField} ${className}`
    : className;

  return (
    <Tag
      ref={ref as any}
      contentEditable={isEditable}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onMouseUp={handleMouseUp}
      onKeyUp={handleKeyUp}
      style={style}
      className={editableClasses}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  );
};
