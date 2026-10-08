"use client";

import React from "react";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import styles from "./jobs.module.css";

export function JobsHero() {
  return (
    <div className={styles.heroSection}>
      <h1 className={styles.title}>Khám phá Việc làm & Sẵn sàng Phỏng vấn cùng AI</h1>
      <p className={styles.subtitle}>
        Tổng hợp cơ hội việc làm công nghệ từ các nguồn tuyển dụng hàng đầu. Luyện phỏng vấn thử
        theo đúng kịch bản JD trước khi nộp hồ sơ thực tế.
      </p>
      <div className={styles.mascotDivider}>
        <div className={styles.mascotWrapper}>
          <PageMascot size={56} />
        </div>
      </div>
    </div>
  );
}
