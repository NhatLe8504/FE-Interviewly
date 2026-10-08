"use client";

import styles from "../setup.module.css";

interface CandidatePreferencePanelProps {
  bargeInEnabled: boolean;
  onBargeInChange: (enabled: boolean) => void;
}

export function CandidatePreferencePanel({
  bargeInEnabled,
  onBargeInChange,
}: CandidatePreferencePanelProps) {
  return (
    <section className={styles.preferencePanel} aria-labelledby="preference-heading">
      <h2 id="preference-heading" className={styles.sectionLabel}>
        Tùy chọn khi trò chuyện
      </h2>

      <div className={styles.preferenceGrid}>
        <p className="portal-help-text">Chọn ngôn ngữ phỏng vấn ngay trong phòng. Ngôn ngữ của JD không giới hạn cách bạn trả lời.</p>

        <label className={styles.bargeInControl}>
          <input
            type="checkbox"
            checked={bargeInEnabled}
            onChange={(event) => onBargeInChange(event.target.checked)}
          />
          <span>
            <strong>Cho phép ngắt lời AI</strong>
            <small>
              Khi dùng giọng nói, bạn có thể bắt đầu nói để dừng phản hồi hiện tại.
            </small>
          </span>
        </label>
      </div>
    </section>
  );
}
