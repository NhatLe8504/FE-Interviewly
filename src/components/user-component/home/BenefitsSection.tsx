"use client";

import { useEffect, useRef, useMemo } from "react";
import { BarChart3, MessageSquareText, Target } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import styles from "../../../app/(user)/page.module.css";

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t, locale } = useI18n();

  const practiceBenefits = useMemo(
    () => [
      {
        icon: MessageSquareText,
        eyebrow: t.home.benefits.badge1,
        title: t.home.benefits.title1,
        copy: t.home.benefits.desc1,
      },
      {
        icon: Target,
        eyebrow: t.home.benefits.badge2,
        title: t.home.benefits.title2,
        copy: t.home.benefits.desc2,
      },
      {
        icon: BarChart3,
        eyebrow: t.home.benefits.badge3,
        title: t.home.benefits.title3,
        copy: t.home.benefits.desc3,
      },
    ],
    [t]
  );

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
        <p className={styles.eyebrow}><span /> {locale === "vi" ? "Luyện tập có mục đích" : "Practice with intention"}</p>
        <h2>{locale === "vi" ? "Hơn cả một danh sách câu hỏi thông thường." : "More than a list of questions."}</h2>
        <p>
          {locale === "vi"
            ? "Interviewly mang đến cho bạn một vòng lặp rèn luyện phỏng vấn cá nhân hóa, thiết thực và dễ dàng duy trì."
            : "Interviewly gives you a structured practice loop that feels personal, useful, and easy to return to."}
        </p>
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
