"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Sparkles, Loader2, MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import { JobItem } from "@/types/job";
import { JobThumbnail } from "./JobThumbnail";
import styles from "./jobs.module.css";

interface JobCardProps {
  job: JobItem;
  onStartPractice: (job: JobItem) => void;
  isStarting?: boolean;
}

function formatRelativeTime(
  updatedAt?: string | null,
  postedAt?: string | null,
  createdAt?: string | null
): string {
  const targetDateStr = updatedAt || postedAt || createdAt;
  if (!targetDateStr) return "Vừa cập nhật";

  try {
    const date = new Date(targetDateStr);
    if (isNaN(date.getTime())) return "Vừa cập nhật";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Vừa cập nhật";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 5) return "Vừa cập nhật";
    if (diffMinutes < 60) return `Cập nhật ${diffMinutes} phút trước`;
    if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`;
    if (diffDays === 1) return "Cập nhật hôm qua";
    if (diffDays < 7) return `Cập nhật ${diffDays} ngày trước`;
    if (diffDays < 30) return `Cập nhật ${Math.floor(diffDays / 7)} tuần trước`;

    return `Cập nhật ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  } catch {
    return "Vừa cập nhật";
  }
}

function getSourceBadgeClass(sourceId?: string | null, viaSource?: string | null): string {
  const s = (sourceId || viaSource || "").toLowerCase();
  if (s.includes("topcv")) return styles.sourceTopcv;
  if (s.includes("itviec")) return styles.sourceItviec;
  if (s.includes("vietnamworks")) return styles.sourceVnw;
  if (s.includes("linkedin")) return styles.sourceLinkedin;
  if (s.includes("greenhouse") || s.includes("lever")) return styles.sourceAts;
  return styles.sourceDefault;
}

export function JobCard({ job, onStartPractice, isStarting = false }: JobCardProps) {
  const relativeTime = formatRelativeTime(job.updated_at, job.posted_at, job.created_at);
  const sourceClass = getSourceBadgeClass(job.source_id, job.via_source);
  const sourceLabel = job.via_source || (job.source_id ? `via ${job.source_id.toUpperCase()}` : "Tin tuyển dụng");

  return (
    <div className={styles.card}>
      <div>
        <Link href={`/jobs/${job.job_id}`}>
          <JobThumbnail job={job} />
        </Link>

        <div className={styles.cardBody}>
          {/* Metadata Row: Time & Source Badge */}
          <div className={styles.metaRow}>
            <span className={styles.timeBadge} title={job.updated_at || job.posted_at || "Thời gian cập nhật"}>
              <Clock className="w-3 h-3 mr-1 text-[#d98236]" />
              {relativeTime}
            </span>

            <span className={`${styles.sourceBadge} ${sourceClass}`}>
              {sourceLabel}
            </span>
          </div>

          {/* Job Title */}
          <Link href={`/jobs/${job.job_id}`} className="block">
            <h3 className={styles.jobTitle} title={job.title}>{job.title}</h3>
          </Link>

          {/* Company info */}
          {job.company?.company_name && (
            <div className={styles.companyRow}>
              <Building2 className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className={styles.companyName} title={job.company.company_name}>
                {job.company.company_name}
              </span>
            </div>
          )}

          {/* Badges: Salary, Location, Seniority */}
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.salaryBadge}`}>
              {job.salary_display}
            </span>
            <span className={styles.badge} title={job.location || "Việt Nam"}>
              <MapPin className="inline-block w-3 h-3 mr-1 text-stone-500" />
              <span className="truncate max-w-[120px]">{job.location || "Việt Nam"}</span>
            </span>
            <span className={styles.badge}>
              <Briefcase className="inline-block w-3 h-3 mr-1 text-stone-500" />
              {job.seniority.toUpperCase()}
            </span>
          </div>

          {/* Skills Required Tags */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className={styles.skillsRow}>
              {job.skills_required.slice(0, 4).map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
              {job.skills_required.length > 4 && (
                <span className={styles.skillTagMore}>
                  +{job.skills_required.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <a
          href={job.original_apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnSecondary}
        >
          Tin gốc
          <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          className={styles.btnPrimary}
          disabled={isStarting}
          onClick={() => onStartPractice(job)}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Luyện AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
