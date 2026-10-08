"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Sparkles, Loader2, MapPin, Briefcase } from "lucide-react";
import { JobItem } from "@/types/job";
import { JobThumbnail } from "./JobThumbnail";
import styles from "./jobs.module.css";

interface JobCardProps {
  job: JobItem;
  onStartPractice: (job: JobItem) => void;
  isStarting?: boolean;
}

export function JobCard({ job, onStartPractice, isStarting = false }: JobCardProps) {
  return (
    <div className={styles.card}>
      <div>
        <Link href={`/jobs/${job.job_id}`}>
          <JobThumbnail job={job} />
        </Link>

        <div className={styles.cardBody}>
          <Link href={`/jobs/${job.job_id}`}>
            <h3 className={styles.jobTitle}>{job.title}</h3>
          </Link>

          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.salaryBadge}`}>
              {job.salary_display}
            </span>
            <span className={styles.badge}>
              <MapPin className="inline-block w-3 h-3 mr-1 text-stone-500" />
              {job.location || "Việt Nam"}
            </span>
            <span className={styles.badge}>
              <Briefcase className="inline-block w-3 h-3 mr-1 text-stone-500" />
              {job.seniority.toUpperCase()}
            </span>
          </div>

          {job.skills_required && job.skills_required.length > 0 && (
            <div className={styles.skillsRow}>
              {job.skills_required.slice(0, 4).map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
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
