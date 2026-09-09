import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.headerWrapper} aria-label="Site header">
      <div className={styles.headerInner}>
        <a href="#top" className={styles.logo}>
          <span className={styles.logoSymbol}>✦</span>
          <span>INTERVIEWLY</span>
        </a>

        <nav className={styles.nav}>
          <a href="#how-it-works">HOW IT WORKS</a>
          <a href="#practice">PRACTICE</a>
          <a href="#tools">TOOLS</a>
          <a href="#steps">STEPS</a>
        </nav>

        <a href="#practice" className={styles.menu}>
          <span className={styles.menuDot} />
          START COACH
        </a>
      </div>
    </header>
  );
}

