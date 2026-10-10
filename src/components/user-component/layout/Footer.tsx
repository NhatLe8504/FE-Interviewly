"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/context/I18nContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const isPracticeRoom =
    Boolean(pathname?.startsWith("/practice/")) &&
    pathname !== "/practice" &&
    pathname !== "/practice/new" &&
    !pathname?.endsWith("/result") &&
    !pathname?.endsWith("/report");

  if (isPracticeRoom) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark}>✦</span>
        <span>interviewly</span>
      </Link>
      <p>
        {locale === "vi"
          ? "Nền tảng luyện phỏng vấn thông minh cùng AI chuẩn hóa quốc tế."
          : "AI-powered interview practice for thoughtful preparation."}
      </p>
      <span>© 2026 Interviewly</span>
    </footer>
  );
}
