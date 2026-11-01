"use client";

import Link from "next/link";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
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
      <JobSkillMatchWidget job={job} onStartPractice={onStartPractice} isStarting={isStarting} />

      <section className={styles.actionPanel} aria-labelledby="job-practice-title">
        <p className={styles.panelEyebrow}>Chuẩn bị cho cơ hội này</p>
        <h2 id="job-practice-title" className={styles.panelTitle}>Từ yêu cầu công việc đến buổi phỏng vấn & CV hoàn hảo.</h2>
        <p className={styles.panelCopy}>Luyện trả lời cùng AI hoặc tạo bản CV được cá nhân hóa sát 100% theo tiêu chí tuyển dụng của vị trí này.</p>
        <div className={styles.panelButtons}>
          <Button type="button" variant="home-primary" disabled={isStarting} onClick={onStartPractice}>
            {isStarting ? (
              <><Loader2 className="size-4 animate-spin" aria-hidden="true" />{job.has_practice_session ? "Đang mở…" : "Đang chuẩn bị…"}</>
            ) : job.has_practice_session ? (
              "Luyện ngay"
            ) : (
              "Luyện phỏng vấn AI"
            )}
          </Button>
          <Button asChild variant="home-secondary">
            <a href={job.original_apply_url} target="_blank" rel="noopener noreferrer">Tin gốc & ứng tuyển<ExternalLink className="size-4" aria-hidden="true" /></a>
          </Button>
        </div>

        {/* AI CV Generator Button */}
        <div className="mt-3">
          <Button asChild variant="home-secondary" className="w-full border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 font-bold">
            <Link href={`/cv-builder/setup?jobId=${encodeURIComponent(job.job_id)}`}>
              <Sparkles className="size-4 text-blue-500 mr-1.5 animate-pulse" />
              Tạo CV cho Job này với AI
            </Link>
          </Button>
        </div>

        <p className={styles.panelNote}>Ứng tuyển trực tiếp tại {getSourceLabel(job)}. Interviewly không tiếp nhận hồ sơ ứng tuyển cho vị trí này.</p>
      </section>
    </div>
  );
}
