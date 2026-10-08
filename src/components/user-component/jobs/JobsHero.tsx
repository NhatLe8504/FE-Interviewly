"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import styles from "./jobs.module.css";

export function JobsHero() {
  return (
    <div className={styles.heroSection}>
      <div className={styles.auroraGlow} />

      <div className={styles.eyebrow}>
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>AI Job Aggregator & Practice</span>
      </div>

      <h1 className={styles.title}>
        Khám phá Việc làm & <span className={styles.titleAccent}>Luyện phỏng vấn AI</span>
      </h1>

      <p className={styles.subtitle}>
        Tổng hợp hàng nghìn vị trí tuyển dụng công nghệ chất lượng từ ITviec, TopCV, LinkedIn.
        Tự động phân tích JD và tạo phòng phỏng vấn giả lập tức thì để bạn luôn tự tin trước nhà tuyển dụng.
      </p>

      <div className={styles.mascotDivider}>
        <div className={styles.mascotWrapper}>
          <PageMascot size={64} />
        </div>
      </div>
    </div>
  );
}
