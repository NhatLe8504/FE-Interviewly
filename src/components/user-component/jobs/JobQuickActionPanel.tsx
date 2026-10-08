"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSourceLabel } from "@/lib/job-presentation";
import type { JobDetail } from "@/types/job";
import { JobSkillMatchWidget } from "./JobSkillMatchWidget";
import styles from "./jobs.module.css";

interface JobQuickActionPanelProps {
  job: JobDetail;
  onStartPractice: () => void;
  isStarting?: boolean;
}

export function JobQuickActionPanel({ job, onStartPractice, isStarting = false }: JobQuickActionPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className={styles.actionPanel} aria-labelledby="job-practice-title">
        <p className={styles.panelEyebrow}>Chuẩn bị cho cơ hội này</p>
        <h2 id="job-practice-title" className={styles.panelTitle}>Từ yêu cầu công việc đến buổi phỏng vấn.</h2>
        <p className={styles.panelCopy}>Luyện trả lời cùng AI với kịch bản được tạo từ mô tả tuyển dụng, trước khi bước vào buổi phỏng vấn thật.</p>
        <div className={styles.panelButtons}>
          <Button type="button" variant="home-primary" disabled={isStarting} onClick={onStartPractice}>
            {isStarting ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Đang chuẩn bị…</> : "Luyện phỏng vấn AI"}
          </Button>
          <Button asChild variant="home-secondary">
            <a href={job.original_apply_url} target="_blank" rel="noopener noreferrer">Tin gốc & ứng tuyển<ExternalLink className="size-4" aria-hidden="true" /></a>
          </Button>
        </div>
        <p className={styles.panelNote}>Ứng tuyển trực tiếp tại {getSourceLabel(job)}. Interviewly không tiếp nhận hồ sơ ứng tuyển cho vị trí này.</p>
      </section>
      <JobSkillMatchWidget jobId={job.job_id} />
    </div>
  );
}
