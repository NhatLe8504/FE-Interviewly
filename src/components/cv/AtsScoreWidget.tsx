"use client";

import React from "react";
import { CvAtsScoreResponse } from "@/types/cv";
import { CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Plus } from "lucide-react";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

interface AtsScoreWidgetProps {
  scoreData?: CvAtsScoreResponse | null;
  score?: number | null;
  loading?: boolean;
  onRefresh: () => void;
  onAddSkill?: (skill: string) => void;
}

export const AtsScoreWidget: React.FC<AtsScoreWidgetProps> = ({
  scoreData,
  score,
  loading = false,
  onRefresh,
  onAddSkill,
}) => {
  const currentScore = scoreData?.ats_score ?? score ?? 85;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  const gaugeColor = currentScore >= 80 ? '#35604a' : currentScore >= 65 ? '#d98236' : '#963a2b';

  return (
    <div className={s.atsWidget}>
      {/* Header */}
      <div className={s.atsWidgetHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={s.atsIconBadge}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className={s.atsTitle}>
              Đánh giá ATS & Độ khớp JD
            </h3>
            <p className={s.atsSubtitle}>
              Mô phỏng hệ thống lọc tự động của nhà tuyển dụng
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className={s.atsRefreshBtn}
          title="Tính lại điểm ATS"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Score Circular Gauge & Verdict */}
      <div className={s.atsScoreBody}>
        <div className={s.atsGaugeWrap}>
          <svg style={{ width: '96px', height: '96px', transform: 'rotate(-90deg)' }}>
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#f0eee6"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{ stroke: gaugeColor, transition: 'stroke-dashoffset 0.7s ease, stroke 0.7s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className={s.atsScoreValue}>
              {Math.round(currentScore)}%
            </span>
            <span className={s.atsScoreLabel}>ATS SCORE</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            className={`${s.atsVerdictBadge} ${
              currentScore >= 85 ? s.verdictHigh : currentScore >= 70 ? s.verdictMedium : s.verdictLow
            }`}
          >
            {currentScore >= 85 ? "Rất cao (Top 5%)" : currentScore >= 70 ? "Khá tốt" : "Cần cải thiện"}
          </span>
          <p className={s.atsVerdictText}>
            {scoreData?.summary_verdict ||
              "Hồ sơ của bạn có cấu trúc chuẩn ATS và các từ khóa kỹ thuật khớp tốt với vị trí ứng tuyển."}
          </p>
        </div>
      </div>

      {/* Missing Keywords (Actionable) */}
      {scoreData?.missing_keywords && scoreData.missing_keywords.length > 0 && (
        <div className={s.atsSection}>
          <div className={`${s.atsSectionHeader} ${s.missingHeader}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              <span>Từ khóa JD còn thiếu ({scoreData.missing_keywords.length})</span>
            </div>
            <span className={s.atsHint}>Click để thêm vào CV</span>
          </div>
          <div className={s.keywordList}>
            {scoreData.missing_keywords.map((kw, idx) => (
              <button
                key={idx}
                onClick={() => onAddSkill && onAddSkill(kw)}
                className={s.missingKeyword}
                title={`Thêm ${kw} vào danh sách kỹ năng`}
              >
                <span>{kw}</span>
                <Plus size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Matched Keywords */}
      {scoreData?.match_keywords && scoreData.match_keywords.length > 0 && (
        <div className={s.atsSection}>
          <div className={`${s.atsSectionHeader} ${s.matchedHeader}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>Đã khớp {scoreData.match_keywords.length} từ khóa cốt lõi</span>
            </div>
          </div>
          <div className={s.keywordList}>
            {scoreData.match_keywords.slice(0, 10).map((kw, idx) => (
              <span
                key={idx}
                className={s.matchedKeyword}
              >
                {kw}
              </span>
            ))}
            {scoreData.match_keywords.length > 10 && (
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)', alignSelf: 'center' }}>
                +{scoreData.match_keywords.length - 10} từ khác
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {scoreData?.improvements && scoreData.improvements.length > 0 && (
        <div className={s.atsSection}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
            Gợi ý bứt phá điểm số:
          </h4>
          <ul className={s.improvementsList}>
            {scoreData.improvements.map((imp, idx) => (
              <li key={idx} className={s.improvementItem}>
                <span className={s.improvementBullet}>•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
