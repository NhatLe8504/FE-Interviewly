"use client";

import styles from "./jobs.module.css";

export function JobsHero() {
  return (
    <header className={styles.heroSection}>
      <p className={styles.eyebrow}>Bước tiếp theo trong sự nghiệp</p>
      <h1 className={styles.title}>Tìm công việc phù hợp.<br /><span className={styles.titleAccent}>Tự tin phỏng vấn.</span></h1>
      <p className={styles.subtitle}>Tìm việc và luyện phỏng vấn theo chính yêu cầu của công ty.</p>
    </header>
  );
}
