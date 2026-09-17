"use client";

import { useEffect, useRef, useMemo } from "react";
import { FileText, Languages, Mic2, Sparkles } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import styles from "../../../app/(user)/page.module.css";

export default function ToolsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t, locale } = useI18n();

  const coachTools = useMemo(
    () => [
      {
        icon: Mic2,
        title: t.home.tools.voiceTitle,
        copy: t.home.tools.voiceDesc,
      },
      {
        icon: Sparkles,
        title: t.home.tools.starTitle,
        copy: t.home.tools.starDesc,
      },
      {
        icon: FileText,
        title: t.home.tools.reportsTitle,
        copy: t.home.tools.reportsDesc,
      },
      {
        icon: Languages,
        title: t.home.tools.bilingualTitle,
        copy: t.home.tools.bilingualDesc,
      },
    ],
    [t]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const header = section.querySelector("." + styles.toolsHeader);
    const cards = Array.from(section.querySelectorAll("." + styles.toolCard));
    const targets: Element[] = [];
    if (header) targets.push(header);
    cards.forEach((c) => targets.push(c));
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
    <section ref={sectionRef} className={styles.toolsSection} id="tools">
      <div className={styles.toolsHeader}>
        <div>
          <p className={styles.eyebrow}><span /> {t.home.tools.badge}</p>
          <h2>{t.home.tools.title}</h2>
        </div>
        <p>
          {locale === "vi"
            ? "Mọi công cụ đều hướng đến một mục tiêu: giúp bạn đưa ra câu trả lời mạnh mẽ, thuyết phục và lưu loát nhất."
            : "Every tool supports one goal: helping you deliver stronger, clearer answers when it is time to interview."}
        </p>
      </div>
      <div className={styles.toolGrid}>
        {coachTools.map(({ icon: Icon, title, copy }) => (
          <article className={styles.toolCard} key={title}>
            <span><Icon size={21} strokeWidth={1.8} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
