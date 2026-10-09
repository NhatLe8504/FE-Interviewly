"use client";

import Image from "next/image";
import { useState } from "react";
import { getCompanyImageUrl } from "@/lib/company-images";
import type { JobItem } from "@/types/job";
import { CompanyLogo } from "./CompanyLogo";
import styles from "./jobs.module.css";

interface JobThumbnailProps {
  job: JobItem;
  aspectRatio?: "video" | "wide";
  className?: string;
}

export function JobThumbnail({ job, aspectRatio = "video", className = "" }: JobThumbnailProps) {
  const company = job.company;
  const companyName = company?.company_name || "Chưa rõ doanh nghiệp tuyển dụng";
  const source = getCompanyImageUrl(company?.company_banner_url || job.thumbnail_url);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const hasBanner = Boolean(source && failedSource !== source);

  return (
    <div
      className={[styles.thumbnail, aspectRatio === "wide" ? styles.thumbnailWide : "", className].join(" ")}
      data-company-media={hasBanner ? "banner" : "fallback"}
    >
      {hasBanner && source && (
        <>
          <Image
            src={source}
            alt={"Banner của " + companyName}
            fill
            unoptimized
            sizes={aspectRatio === "wide"
              ? "(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 48px), (max-width: 1240px) calc(100vw - 402px), 838px"
              : "(max-width: 700px) calc(100vw - 40px), (max-width: 1080px) calc((100vw - 72px) / 2), (max-width: 1240px) calc((100vw - 96px) / 3), 382px"}
            loading={aspectRatio === "wide" ? "eager" : "lazy"}
            className={styles.bannerImage}
            onError={() => setFailedSource(source)}
          />
          <div className={styles.bannerOverlay} aria-hidden="true" />
        </>
      )}
      <div className={styles.bannerIdentity}>
        <CompanyLogo company={company} size={aspectRatio === "wide" ? 52 : 44} />
        <div className={styles.bannerCompanyText}>
          <span className={styles.bannerLabel}>Doanh nghiệp tuyển dụng</span>
          <span className={styles.bannerCompanyName}>{companyName}</span>
        </div>
      </div>
    </div>
  );
}
