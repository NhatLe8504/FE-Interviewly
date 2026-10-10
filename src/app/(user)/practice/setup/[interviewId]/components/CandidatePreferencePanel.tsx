"use client";

import styles from "../setup.module.css";
import { SimpleUserSelect } from "@/components/user-component/common";
import { INTERVIEW_LANGUAGES, getInterviewLanguage, type InterviewLanguage } from "@/lib/interviewLanguages";

interface CandidatePreferencePanelProps {
  language: InterviewLanguage;
  onLanguageChange: (language: InterviewLanguage) => void;
  bargeInEnabled: boolean;
  onBargeInChange: (enabled: boolean) => void;
  totalDurationMinutes: number;
  onTotalDurationMinutesChange: (mins: number) => void;
  mockMode: "strict" | "guided";
  onMockModeChange: (mode: "strict" | "guided") => void;
}

const DURATION_PRESETS = [15, 30, 45, 60];

export function CandidatePreferencePanel({
  language,
  onLanguageChange,
  bargeInEnabled,
  onBargeInChange,
  totalDurationMinutes,
  onTotalDurationMinutesChange,
  mockMode,
  onMockModeChange,
}: CandidatePreferencePanelProps) {
  const warmupMins = Math.round(totalDurationMinutes * (1 / 6));
  const techMins = Math.round(totalDurationMinutes * (4 / 6));
  const closingMins = Math.round(totalDurationMinutes * (1 / 6));

  return (
    <section className={styles.preferencePanel} aria-labelledby="preference-heading">
      <h2 id="preference-heading" className={styles.sectionLabel}>
        Cấu hình buổi phỏng vấn
      </h2>

      {/* Thời lượng buổi phỏng vấn & Timeline phân bổ */}
      <div className="flex flex-col gap-2">
        <label className="portal-field-label">Thời lượng phỏng vấn</label>
        <div className={styles.durationGrid}>
          {DURATION_PRESETS.map((mins) => {
            const isSelected = totalDurationMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  isSelected
                    ? "bg-[#d98236]/15 border-[#d98236] text-[#d98236]"
                    : "bg-[var(--surface-subtle)] border-[var(--line)] text-[var(--ink)] hover:border-[#d98236]/50"
                }`}
                onClick={() => onTotalDurationMinutesChange(mins)}
              >
                {mins} phút
              </button>
            );
          })}
        </div>

        {/* Visual Timeline Bar */}
        <div className={styles.timelineBar}>
          <div className={styles.timelineSegmentWarmup} style={{ width: "16.7%" }} title={`Khởi động: ${warmupMins} phút`} />
          <div className={styles.timelineSegmentTech} style={{ width: "66.6%" }} title={`Chuyên môn: ${techMins} phút`} />
          <div className={styles.timelineSegmentClosing} style={{ width: "16.7%" }} title={`Chào kết: ${closingMins} phút`} />
        </div>
        <div className={styles.timelineLegend}>
          <span className="text-[#38bdf8]">Khởi động: ~{warmupMins}p</span>
          <span className="text-[#f59e0b]">Chuyên môn: ~{techMins}p</span>
          <span className="text-[#10b981]">Chào kết: ~{closingMins}p</span>
        </div>
      </div>

      {/* Chế độ phỏng vấn: Thực chiến vs Huấn luyện */}
      <div className="flex flex-col gap-2">
        <label className="portal-field-label">Chế độ phỏng vấn</label>
        <div className={styles.mockModeGrid}>
          <button
            type="button"
            className={`${styles.mockModeCard} ${mockMode === "guided" ? styles.mockModeCardActive : ""}`}
            onClick={() => onMockModeChange("guided")}
          >
            <strong>🎯 Hướng dẫn & Gợi ý</strong>
            <small>Có nút xin gợi ý STAR khi bí, AI động viên và khơi mở tư duy.</small>
          </button>
          <button
            type="button"
            className={`${styles.mockModeCard} ${mockMode === "strict" ? styles.mockModeCardActive : ""}`}
            onClick={() => onMockModeChange("strict")}
          >
            <strong>⚡ Thực chiến nghiêm ngặt</strong>
            <small>Áp lực thực tế, không có gợi ý, AI hỏi xoáy vào điểm yếu kỹ thuật.</small>
          </button>
        </div>
      </div>

      <div className={styles.preferenceGrid}>
        <div>
          <label htmlFor="setup-interview-language" className="portal-field-label">Ngôn ngữ phỏng vấn</label>
          <SimpleUserSelect
            id="setup-interview-language"
            value={language}
            onChange={(val) => onLanguageChange(getInterviewLanguage(val).code)}
            options={INTERVIEW_LANGUAGES.map((opt) => ({ value: opt.code, label: opt.label }))}
            aria-label="Ngôn ngữ phỏng vấn"
          />
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
