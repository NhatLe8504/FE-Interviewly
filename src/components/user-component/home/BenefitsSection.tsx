"use client";

import { useEffect, useRef } from "react";
import { BarChart3, MessageSquareText, Target } from "lucide-react";
import styles from "../../../app/(user)/page.module.css";

const practiceBenefits = [
  {
    icon: MessageSquareText,
    eyebrow: "Adaptive conversations",
    title: "Questions that follow your answer, not a script.",
    copy: "Choose a role, field, level, and language. Your AI interviewer asks relevant follow-ups so each practice session feels closer to the real thing.",
  },
  {
    icon: Target,
    eyebrow: "Clear feedback",
    title: "Know exactly what to improve next.",
    copy: "Receive a practical rubric for clarity, structure, and evidence - with guidance to make your next response sharper.",
  },
  {
    icon: BarChart3,
    eyebrow: "Visible progress",
    title: "Build confidence session by session.",
    copy: "Keep your history, revisit feedback, and watch your interview skills improve over time instead of starting from scratch.",
  },
];

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const heading = section.querySelector("." + styles.sectionHeading);
    const cards = Array.from(section.querySelectorAll("." + styles.benefitCard));
    const targets: Element[] = [];
    if (heading) targets.push(heading);
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
    <section className={styles.benefits} id="practice" ref={sectionRef}>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}><span /> Practice with intention</p>
        <h2>More than a list of questions.</h2>
        <p>Interviewly gives you a structured practice loop that feels personal, useful, and easy to return to.</p>
      </div>
      <div className={styles.benefitGrid}>
        {practiceBenefits.map(({ icon: Icon, eyebrow, title, copy }, index) => (
          <article className={styles.benefitCard} key={title}>
            <span className={styles.cardNumber}>0{index + 1}</span>
            <span className={styles.featureIcon}><Icon size={22} strokeWidth={1.8} /></span>
            <p>{eyebrow}</p>
            <h3>{title}</h3>
            <span className={styles.cardRule} />
            <span className={styles.cardCopy}>{copy}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

