"use client";

import { useEffect, useRef, useMemo } from "react";
import { useI18n } from "@/context/I18nContext";
import styles from "../../../app/(user)/page.module.css";

export default function StepsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t, locale } = useI18n();

  const steps = useMemo(
    () => [
      ["01", t.home.steps.step1Title, t.home.steps.step1Desc],
      ["02", t.home.steps.step2Title, t.home.steps.step2Desc],
      ["03", t.home.steps.step3Title, t.home.steps.step3Desc],
    ],
    [t]
  );

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
        <p className={styles.eyebrow}><span /> {t.home.steps.badge}</p>
        <h2>{locale === "vi" ? "Sẵn sàng bất cứ khi nào bạn muốn." : "Ready when you are."}</h2>
        <p>
          {locale === "vi"
            ? "Không áp lực phán xét. Một thói quen luyện tập lặp lại giúp bạn làm quen hoàn toàn với không khí phỏng vấn thật."
            : "No performance pressure. Just a repeatable routine that makes the real conversation feel more familiar."}
        </p>
      </div>
      <ol className={styles.steps}>
        {steps.map(([number, title, copy]) => (
          <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
        ))}
      </ol>
    </section>
  );
}
