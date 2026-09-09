import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark}>✦</span>
        <span>interviewly</span>
      </Link>
      <p>AI-powered interview practice for thoughtful preparation.</p>
      <span>© 2026 Interviewly</span>
    </footer>
  );
}
