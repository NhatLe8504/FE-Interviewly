"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Sparkles, Loader2, MapPin, Briefcase } from "lucide-react";
import { JobItem } from "@/types/job";
import { Button } from "@/components/ui/button";
import styles from "./jobs.module.css";

interface JobCardProps {
  job: JobItem;
  onStartPractice: (job: JobItem) => void;
  isStarting?: boolean;
}

export function JobCard({ job, onStartPractice, isStarting = false }: JobCardProps) {
  const companyInitial = job.company?.company_name?.charAt(0).toUpperCase() || "T";

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.cardHeader}>
          <div className={styles.companyLogo}>
            {companyInitial}
          </div>
          <div className={styles.cardMeta}>
            <Link href={`/jobs/${job.job_id}`}>
              <h3 className={styles.jobTitle}>{job.title}</h3>
            </Link>
            <div className={styles.companyName}>
              {job.company?.company_name || "Nhà tuyển dụng"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.salaryBadge}`}>
              {job.salary_display}
            </span>
            <span className={styles.badge}>
              <MapPin className="inline-block w-3 h-3 mr-1" />
              {job.location || "Việt Nam"}
            </span>
            <span className={styles.badge}>
              <Briefcase className="inline-block w-3 h-3 mr-1" />
              {job.seniority.toUpperCase()}
            </span>
            {job.via_source && (
              <span className={`${styles.badge} ${styles.viaBadge}`}>
                {job.via_source}
              </span>
            )}
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
          className="flex-1"
        >
          <Button
            variant="home-secondary"
            size="sm"
            className="w-full text-xs font-medium"
          >
            Tin gốc
            <ExternalLink className="ml-1 w-3 h-3" />
          </Button>
        </a>

        <Button
          variant="home-primary"
          size="sm"
          className="flex-1 text-xs font-semibold"
          disabled={isStarting}
          onClick={() => onStartPractice(job)}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Luyện AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
