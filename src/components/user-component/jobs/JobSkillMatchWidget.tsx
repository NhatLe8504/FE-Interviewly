"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Loader2, RefreshCw, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { jobsApi } from "@/services/jobsApi";
import { getBrandLabel } from "@/lib/brand-icons";
import type { JobReadinessAssessment, JobDetail } from "@/types/job";
import styles from "./jobs.module.css";

interface JobSkillMatchWidgetProps {
  job: JobDetail;
  onStartPractice?: () => void;
  isStarting?: boolean;
}

export function JobSkillMatchWidget({ job, onStartPractice, isStarting = false }: JobSkillMatchWidgetProps) {
  const [assessment, setAssessment] = useState<JobReadinessAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.checkJobReadiness(job.job_id, force);
      setAssessment(data);
      setHasChecked(true);
    } catch (err) {
      setError("Không thể kiểm tra mức độ phù hợp lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const verdictLabel: Record<string, string> = {
    ready: "Đạt chuẩn ứng tuyển",
    almost: "Gần đạt yêu cầu",
    not_ready: "Cần cải thiện thêm",
    insufficient_data: "Chưa đủ dữ liệu",
  };

  const verdictClass: Record<string, string> = {
    ready: styles.verdictReady,
    almost: styles.verdictAlmost,
    not_ready: styles.verdictNotReady,
    insufficient_data: styles.verdictInsufficient,
  };

  const statusLabel: Record<string, string> = {
    met: "Đạt chuẩn",
    partial: "Cần củng cố",
    gap: "Còn thiếu",
    unknown: "Chưa kiểm chứng",
  };

  const statusClass: Record<string, string> = {
    met: styles.statusMet,
    partial: styles.statusPartial,
    gap: styles.statusGap,
    unknown: styles.statusUnknown,
  };

  return (
    <section className={styles.readinessPanel} aria-label="Kiểm tra mức độ phù hợp với JD">
      <div className={styles.readinessHeader}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--accent-deep)]" aria-hidden="true" />
          <h2 className={styles.panelSubtitle} style={{ margin: 0 }}>Độ phù hợp với JD</h2>
        </div>
        {assessment && (
          <span className={`${styles.readinessVerdictBadge} ${verdictClass[assessment.verdict] || ""}`}>
            {assessment.verdict === "ready" && <CheckCircle2 className="size-3.5" />}
            {assessment.verdict === "almost" && <AlertCircle className="size-3.5" />}
            {assessment.verdict === "not_ready" && <AlertCircle className="size-3.5" />}
            {assessment.verdict === "insufficient_data" && <HelpCircle className="size-3.5" />}
            {verdictLabel[assessment.verdict] || "Đang đánh giá"}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex flex-col gap-3 py-3">
          <p className={styles.panelCopy}>{error}</p>
          <Button type="button" variant="home-outline" size="home-compact" onClick={() => fetchReadiness(true)}>
            <RefreshCw className="size-3.5" /> Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-[var(--accent-deep)]" aria-hidden="true" />
          <p className="text-xs text-[var(--text-secondary)]">AI đang phân tích JD và đối chiếu hồ sơ năng lực của bạn…</p>
        </div>
      ) : assessment ? (
        <>
          <div className={styles.readinessScoreRow}>
            {assessment.verdict === "insufficient_data" && assessment.match_percent === 0 ? (
              <span className={styles.readinessScoreBig} style={{ fontSize: "22px" }}>Chưa đủ dữ liệu</span>
            ) : (
              <>
                <strong className={styles.readinessScoreBig}>{assessment.match_percent}%</strong>
                <span className={styles.readinessScoreLabel}>độ tương thích yêu cầu</span>
              </>
            )}
          </div>

          <div
            className={styles.readinessProgressBar}
            role="progressbar"
            aria-valuenow={assessment.match_percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.readinessProgressFill}
              style={{ width: `${Math.max(5, assessment.match_percent)}%` }}
            />
          </div>

          <div className={styles.coverageRow}>
            <span>Dữ liệu đã luyện tập & kiểm chứng</span>
            <strong>{Math.round(assessment.data_coverage * 100)}%</strong>
          </div>

          <p className={styles.readinessExplanation}>{assessment.explanation}</p>

          {assessment.requirements.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Đối chiếu từng kỹ năng theo JD:</span>
              <ul className={styles.readinessReqList}>
                {assessment.requirements.map((req) => (
                  <li key={req.skill_id} className={styles.readinessReqItem}>
                    <span className={reqSkillNameClass(req.skill_id)}>
                      <BrandIcon name={req.skill_id} size={16} />
                      <span>{getBrandLabel(req.name)}</span>
                    </span>
                    <span className={`${styles.reqStatusBadge} ${statusClass[req.status] || ""}`}>
                      {statusLabel[req.status] || req.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.readinessActions}>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="home-primary"
                className="flex-1"
                disabled={isStarting}
                onClick={onStartPractice}
              >
                {isStarting ? (
                  <><Loader2 className="size-4 animate-spin" /> Đang chuẩn bị…</>
                ) : (
                  "Luyện tập cải thiện"
                )}
              </Button>
              <Button asChild variant="home-secondary" className="flex-1">
                <a href={job.original_apply_url} target="_blank" rel="noopener noreferrer">
                  Ứng tuyển <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
            <Button
              type="button"
              variant="home-quiet"
              size="home-compact"
              disabled={isLoading}
              onClick={() => fetchReadiness(true)}
              className="text-xs text-[var(--text-secondary)] self-center"
            >
              {isLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Đánh giá lại bằng AI
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3 py-3 text-center">
          <p className={styles.panelCopy}>
            Bấm nút bên dưới để AI (TypeSafe Jev System One) phân tích JD và đối chiếu hồ sơ năng lực thực tế của bạn.
          </p>
          <Button
            type="button"
            variant="home-primary"
            onClick={() => fetchReadiness(true)}
            className="w-full justify-center"
          >
            <Sparkles className="size-4 mr-1.5" /> Kiểm tra trình độ ứng tuyển
          </Button>
        </div>
      )}
    </section>
  );
}

function reqSkillNameClass(skillId: string) {
  return styles.reqSkillName;
}
