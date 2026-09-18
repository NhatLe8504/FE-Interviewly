"use client";

import { Keyboard, Mic } from "lucide-react";
import styles from "../setup.module.css";

interface CandidatePreferencePanelProps {
  mode: "voice" | "text";
  language: "vi" | "en";
  bargeInEnabled: boolean;
  onModeChange: (mode: "voice" | "text") => void;
  onLanguageChange: (language: "vi" | "en") => void;
  onBargeInChange: (enabled: boolean) => void;
}

export function CandidatePreferencePanel({
  mode,
  language,
  bargeInEnabled,
  onModeChange,
  onLanguageChange,
  onBargeInChange,
}: CandidatePreferencePanelProps) {
  return (
    <section className={styles.preferencePanel} aria-labelledby="preference-heading">
      <h2 id="preference-heading" className={styles.sectionLabel}>
        Hình thức phỏng vấn
      </h2>
      <div className={styles.modeGrid} role="group" aria-label="Chọn hình thức phỏng vấn">
        {[
          { id: "voice" as const, label: "Giọng nói", detail: "Khuyên dùng", Icon: Mic },
          { id: "text" as const, label: "Nhập phím", detail: "Gõ câu trả lời", Icon: Keyboard },
        ].map(({ id, label, detail, Icon }) => (
          <button
            key={id}
            className={[styles.modeButton, mode === id ? styles.modeButtonActive : ""].filter(Boolean).join(" ")}
            type="button"
            aria-pressed={mode === id}
            onClick={() => onModeChange(id)}
          >
            <Icon size={17} aria-hidden="true" />
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
          </button>
        ))}
      </div>

      <div className={styles.preferenceGrid}>
        <label className={styles.languageControl}>
          <span>Ngôn ngữ</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as "vi" | "en")}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </label>

        <label
          className={[styles.bargeInControl, mode !== "voice" ? styles.bargeInControlDisabled : ""].filter(Boolean).join(" ")}
        >
          <input
            type="checkbox"
            checked={bargeInEnabled}
            disabled={mode !== "voice"}
            onChange={(event) => onBargeInChange(event.target.checked)}
          />
          <span>
            <strong>Cho phép ngắt lời AI</strong>
            <small>
              {mode === "voice"
                ? "Bạn có thể bắt đầu nói để dừng phản hồi hiện tại."
                : "Chỉ dùng trong chế độ giọng nói."}
            </small>
          </span>
        </label>
      </div>
    </section>
  );
}
