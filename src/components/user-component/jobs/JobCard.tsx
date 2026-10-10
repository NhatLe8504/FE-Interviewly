"use client";

import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { formatJobTimestamp, getJobTechnologies, SENIORITY_LABELS, WORKPLACE_LABELS } from "@/lib/job-presentation";
import type { JobItem } from "@/types/job";
import { JobThumbnail } from "./JobThumbnail";
import { JobSourceMark } from "./JobSourceMark";
import styles from "./jobs.module.css";

interface JobCardProps {
  job: JobItem;
  onStartPractice: (job: JobItem) => void;
  isStarting?: boolean;
}

export function JobCard({ job, onStartPractice, isStarting = false }: JobCardProps) {
  const technologies = getJobTechnologies(job);
  const postedTime = formatJobTimestamp(job.posted_at, "posted");
  const syncedTime = formatJobTimestamp(job.last_synced_at, "synced");
  const seniority = SENIORITY_LABELS[job.seniority];
  const workplace = WORKPLACE_LABELS[job.workplace_type];
  const hasSalary = job.salary_min != null || job.salary_max != null;
  const detailUrl = "/jobs/" + job.job_id;

  return (
    <article className={styles.card}>
      <Link href={detailUrl} aria-label={"Xem " + job.title} className={styles.bannerLink}>
        <JobThumbnail job={job} />
      </Link>
      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <JobSourceMark job={job} />
          {postedTime && <time dateTime={postedTime.dateTime} title={postedTime.title}>{postedTime.label}</time>}
        </div>
        <Link href={detailUrl} className={styles.jobTitleLink}>
          <h2 className={styles.jobTitle} title={job.title}>{job.title}</h2>
        </Link>
        <div className={styles.jobLocation} title={job.location || undefined}>{job.location || "Địa điểm chưa được công bố"}</div>
        {(seniority || workplace) && (
          <div className={styles.jobFacts}>
            {seniority && <span>{seniority}</span>}
            {workplace && <span>{workplace}</span>}
          </div>
        )}
        <div className={styles.salaryLine} data-disclosed={hasSalary}>
          <span>Mức lương</span>
          <strong>{hasSalary ? job.salary_display : "Chưa công bố"}</strong>
        </div>
        {technologies.length > 0 && (
          <div className={styles.skillsRow} aria-label="Công nghệ yêu cầu">
            {technologies.slice(0, 4).map((technology) => (
              <span key={technology} className={styles.skillTag}>
                <BrandIcon name={technology} size={17} />
                {technology}
              </span>
            ))}
            {technologies.length > 4 && (
              <Link href={detailUrl + "#technologies"} className={styles.moreTechnologies} aria-label={"Xem thêm " + (technologies.length - 4) + " công nghệ"}>
                +{technologies.length - 4}
              </Link>
            )}
          </div>
        )}
        {syncedTime && <time className={styles.syncTime} dateTime={syncedTime.dateTime} title={syncedTime.title}>{syncedTime.label}</time>}
      </div>
      <div className={styles.cardFooter}>
        <Button asChild variant="home-secondary" size="home-compact" className={styles.originalAction}>
          <a href={job.original_apply_url} target="_blank" rel="noopener noreferrer">
            Tin gốc <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </Button>
        <Button type="button" variant="home-primary" size="home-compact" className={styles.practiceAction} disabled={isStarting} onClick={() => onStartPractice(job)}>
          {isStarting ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden="true" />{job.has_practice_session ? "Đang mở…" : "Đang chuẩn bị…"}</>
          ) : job.has_practice_session ? (
            "Luyện ngay"
          ) : (
            "Luyện phỏng vấn AI"
          )}
        </Button>
      </div>
    </article>
  );
}
