"use client";

import { useEffect, useRef } from "react";
import styles from "../../../app/page.module.css";

const steps = [
  ["01", "Set your interview", "Select the role, field, experience level, and language you want to practice."],
  ["02", "Have the conversation", "Respond naturally while the interviewer adapts its next question to you."],
  ["03", "Use the feedback", "Review your rubric, practical suggestions, and a plan for the next session."],
];

export default function StepsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const intro = section.querySelector("." + styles.stepsIntro);
    const items = Array.from(section.querySelectorAll("." + styles.steps + " li"));
    const targets: Element[] = [];
    if (intro) targets.push(intro);
    items.forEach((li) => targets.push(li));
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
    <section ref={sectionRef} className={styles.stepsSection} id="steps">
      <div className={styles.stepsIntro}>
        <p className={styles.eyebrow}><span /> Your next practice</p>
        <h2>Ready when you are.</h2>
        <p>No performance pressure. Just a repeatable routine that makes the real conversation feel more familiar.</p>
      </div>
      <ol className={styles.steps}>
        {steps.map(([number, title, copy]) => (
          <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
        ))}
      </ol>
    </section>
  );
}
