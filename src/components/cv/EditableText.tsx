"use client";

import React, { useRef, useEffect } from "react";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

export interface CvTextSelection {
  text: string;
  rect: DOMRect;
  sectionContext: string;
  replaceSelectedText: (replacementText: string) => boolean;
}

interface EditableTextProps {
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  isEditable?: boolean;
  sectionContext?: string;
  onTextSelect?: (selection: CvTextSelection) => void;
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
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

    const rawText = sel.toString();
    const text = rawText.trim();
    if (text.length > 2 && ref.current && ref.current.contains(sel.anchorNode) && ref.current.contains(sel.focusNode)) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const prefixRange = range.cloneRange();
      prefixRange.selectNodeContents(ref.current);
      prefixRange.setEnd(range.startContainer, range.startOffset);
      const start = prefixRange.toString().length + (rawText.length - rawText.trimStart().length);
      const replaceSelectedText = (replacement: string) => {
        const currentText = ref.current?.innerText;
        if (!currentText || !onChangeRef.current || currentText.slice(start, start + text.length) !== text) return false;
        const nextText = currentText.slice(0, start) + replacement + currentText.slice(start + text.length);
        ref.current!.innerText = nextText;
        onChangeRef.current(nextText);
        return true;
      };
      const selection = { text, rect, sectionContext, replaceSelectedText };
      onTextSelect(selection);
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
