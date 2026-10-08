"use client";

import styles from "../setup.module.css";
import { INTERVIEW_LANGUAGES, getInterviewLanguage, type InterviewLanguage } from "@/lib/interviewLanguages";

interface CandidatePreferencePanelProps {
  language: InterviewLanguage;
  onLanguageChange: (language: InterviewLanguage) => void;
  bargeInEnabled: boolean;
  onBargeInChange: (enabled: boolean) => void;
}

export function CandidatePreferencePanel({
  language,
  onLanguageChange,
  bargeInEnabled,
  onBargeInChange,
}: CandidatePreferencePanelProps) {
  return (
    <section className={styles.preferencePanel} aria-labelledby="preference-heading">
      <h2 id="preference-heading" className={styles.sectionLabel}>
        Tùy chọn khi trò chuyện
      </h2>

      <div className={styles.preferenceGrid}>
        <div>
          <label htmlFor="setup-interview-language" className="portal-field-label">Ngôn ngữ phỏng vấn</label>
          <select
            id="setup-interview-language"
            className="portal-input"
            value={language}
            onChange={(event) => onLanguageChange(getInterviewLanguage(event.target.value).code)}
            aria-describedby="setup-language-help"
          >
            {INTERVIEW_LANGUAGES.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
          </select>
          <p id="setup-language-help" className="portal-help-text">Không phụ thuộc ngôn ngữ JD. Bạn vẫn có thể đổi khi đang luyện tập.</p>
        </div>

        <label className={`portal-panel ${styles.bargeInControl}`}>
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
