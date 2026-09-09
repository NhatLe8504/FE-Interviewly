"use client";

import { useEffect, useRef } from "react";
import { FileText, Languages, Mic2, Sparkles } from "lucide-react";
import styles from "../../../app/(user)/page.module.css";

const coachTools = [
  { icon: Mic2, title: "Voice practice", copy: "Turn a spoken answer into useful coaching on pace and hesitation." },
  { icon: Sparkles, title: "STAR support", copy: "Shape behavioral answers with a clear situation, task, action, and result." },
  { icon: FileText, title: "Session reports", copy: "Leave each practice with a focused PDF report you can return to." },
  { icon: Languages, title: "Vietnamese & English", copy: "Practice in the language that helps you prepare with confidence." },
];

export default function ToolsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

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
          <p className={styles.eyebrow}><span /> Designed around your growth</p>
          <h2>Practice in the way that works for you.</h2>
        </div>
        <p>Every tool supports one goal: helping you deliver stronger, clearer answers when it is time to interview.</p>
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

