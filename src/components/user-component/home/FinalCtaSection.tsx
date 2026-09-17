"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import styles from "../../../app/(user)/page.module.css";

export default function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = Array.from(section.children);
    if (targets.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.classList.add(styles.revealArmed);
    if (reduced) {
      targets.forEach((t) => t.classList.add(styles.isVisible));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add(styles.isVisible);
          else entry.target.classList.remove(styles.isVisible);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.finalCta} ref={sectionRef}>
      <ShieldCheck size={28} strokeWidth={1.8} aria-hidden="true" />
      <p className={styles.eyebrow}>
        <span /> {t.home.finalCta.eyebrow}
      </p>
      <h2>{t.home.finalCta.title}</h2>
      <a className={styles.primaryButton} href="#practice">
        {t.home.finalCta.button} <ArrowRight size={18} aria-hidden="true" />
      </a>
    </section>
  );
}
