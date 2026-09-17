"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/context/I18nContext";
import styles from "./CoachShowcaseSection.module.css";

const coaches = [
  {
    id: 1,
    name: "Alex Vance",
    role: "Senior System Architect",
    specialty: "Distributed Systems & Scalability",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    rot: -9,
    depth: 14,
    cardClass: styles.card1,
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "HR Director & Behavioral Coach",
    specialty: "STAR Method & Conflict Management",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    rot: -5,
    depth: 10,
    cardClass: styles.card2,
  },
  {
    id: 3,
    name: "Marcus Sterling",
    role: "Principal Product Manager",
    specialty: "Product Sense, Strategy & Metrics",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    rot: -2,
    depth: 8,
    cardClass: styles.card3,
  },
  {
    id: 4,
    name: "Sophia Chen",
    role: "AI / ML Research Lead",
    specialty: "LLM Systems & Data Architecture",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    rot: 3,
    depth: 12,
    cardClass: styles.card4,
  },
  {
    id: 5,
    name: "David Kelling",
    role: "VP of Engineering",
    specialty: "Executive Leadership & Org Impact",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    rot: 0,
    depth: 6,
    cardClass: styles.card5,
  },
  {
    id: 6,
    name: "Clara Dubois",
    role: "Design Director",
    specialty: "Design Systems & Product Design",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
    rot: 4,
    depth: 11,
    cardClass: styles.card6,
  },
  {
    id: 7,
    name: "Tariq Mansour",
    role: "Strategy & Finance Lead",
    specialty: "Business Cases & Quantitative Analysis",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    rot: 7,
    depth: 9,
    cardClass: styles.card7,
  },
  {
    id: 8,
    name: "Hana Kim",
    role: "Staff Frontend Engineer",
    specialty: "Web Performance & UI Architecture",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    rot: -4,
    depth: 13,
    cardClass: styles.card8,
  },
];

export default function CoachShowcaseSection() {
  const { t, locale } = useI18n();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const bigResultsWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // ── Global GSAP perf settings ──────────────────────────────────────────
      gsap.ticker.lagSmoothing(0);       // no lag compensation jumps

      // 1. Initial states (always set regardless of visibility)
      gsap.set(`.${styles.topHeader}`, { opacity: 0, y: -15 });
      gsap.set(`.${styles.smallTeam} .${styles.wordSpan}`, { y: "105%" });
      gsap.set(`.${styles.bigResults} .${styles.letter}`, { y: 80, opacity: 0 });
      gsap.set(`.${styles.tCard}`, { opacity: 0 });
      gsap.set(`.${styles.statsInner}`, { opacity: 0 });

      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
      cards.forEach((card) => {
        const rot = parseFloat(card.dataset.rot || "0");
        card.dataset.restRot = String(rot);
        gsap.set(card, { y: -800, rotation: rot + 25, opacity: 0, scale: 0.7 });
      });

      // 2. Intro timeline – fires once on scroll into view
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      intro
        .to(`.${styles.topHeader}`, { opacity: 1, y: 0, duration: 0.75 }, 0.1)
        .to(
          `.${styles.smallTeam} .${styles.wordSpan}`,
          { y: "0%", duration: 0.9, stagger: 0.08, ease: "power3.out" },
          0.2
        )
        .to(
          `.${styles.bigResults} .${styles.letter}`,
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "back.out(1.6)" },
          0.4
        )
        .to(
          cards,
          {
            y: 0, opacity: 1, scale: 1,
            rotation: (i, el) => parseFloat(el.dataset.restRot || "0"),
            duration: 1.1,
            stagger: { each: 0.08, from: "center" },
            ease: "back.out(1.4)",
            onComplete: () => {
              // After intro, promote cards to their own GPU layer
              cards.forEach(c => { c.style.willChange = "transform"; });
            },
          },
          0.65
        );

      // 3. Floating animations – START PAUSED, play/pause with viewport
      const floatTimelines: gsap.core.Tween[] = [];
      if (!reducedMotion) {
        cards.forEach((card, i) => {
          const rot = parseFloat(card.dataset.restRot || "0");
          const tween = gsap.to(card, {
            y: `+=${8 + (i % 3) * 5}`,
            rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
            duration: 3 + (i % 4) * 0.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true, // start paused!
          });
          floatTimelines.push(tween);
        });

        // Play/pause float when section enters/leaves viewport
        ScrollTrigger.create({
          trigger: stageRef.current,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            const delay = intro.duration();
            floatTimelines.forEach((t, i) => {
              setTimeout(() => t.play(), delay * 1000 + i * 100);
            });
          },
          onLeave: () => floatTimelines.forEach(t => t.pause()),
          onEnterBack: () => floatTimelines.forEach(t => t.play()),
          onLeaveBack: () => floatTimelines.forEach(t => t.pause()),
        });
      }

      // 4. Mouse parallax – throttled to ~30 fps, only when stage is visible
      const stage = stageRef.current;
      let mx = 0, my = 0, tx = 0, ty = 0;
      let parallaxRunning = false;
      let rafId = 0;
      let lastParallaxTs = 0;
      const PARALLAX_INTERVAL = 1000 / 30; // 30 fps cap

      const onMouseMove = (e: MouseEvent) => {
        if (!stage) return;
        const r = stage.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };

      const onMouseLeave = () => { mx = 0; my = 0; };

      if (stage) {
        stage.addEventListener("mousemove", onMouseMove, { passive: true });
        stage.addEventListener("mouseleave", onMouseLeave);
      }

      function parallaxLoop(ts: number) {
        if (!parallaxRunning) return;
        if (ts - lastParallaxTs < PARALLAX_INTERVAL) {
          rafId = requestAnimationFrame(parallaxLoop);
          return;
        }
        lastParallaxTs = ts;
        tx += (mx - tx) * 0.06;
        ty += (my - ty) * 0.06;
        // Only update if there's meaningful movement
        if (Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001) {
          cards.forEach((card) => {
            const d = parseFloat(card.dataset.depth || "8");
            card.style.translate = `${(tx * d).toFixed(1)}px ${(ty * d * 0.5).toFixed(1)}px`;
          });
        }
        rafId = requestAnimationFrame(parallaxLoop);
      }

      // Parallax only active when stage is visible
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          if (!parallaxRunning) {
            parallaxRunning = true;
            rafId = requestAnimationFrame(parallaxLoop);
          }
        },
        onLeave: () => {
          parallaxRunning = false;
          cancelAnimationFrame(rafId);
        },
        onEnterBack: () => {
          if (!parallaxRunning) {
            parallaxRunning = true;
            rafId = requestAnimationFrame(parallaxLoop);
          }
        },
        onLeaveBack: () => {
          parallaxRunning = false;
          cancelAnimationFrame(rafId);
        },
      });

      // 5. Card 3D hover lift (unchanged – only fires on user interaction)
      cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, {
            rotateX: -py * 16, rotateY: px * 16,
            scale: 1.12, zIndex: 20,
            duration: 0.4, ease: "power2.out",
            transformPerspective: 700, overwrite: "auto",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotateX: 0, rotateY: 0, scale: 1,
            zIndex: card.style.zIndex || "",
            duration: 0.8, ease: "elastic.out(1, 0.6)",
            overwrite: "auto",
          });
        });
      });

      // 6. Scroll scrub: fan-out
      const moves = [
        { x: -260, y: -40, rot: -25 },
        { x: -200, y: 20,  rot: -18 },
        { x: -120, y: 80,  rot: -10 },
        { x: -40,  y: 120, rot: -4  },
        { x: 40,   y: 120, rot:  4  },
        { x: 120,  y: 80,  rot:  12 },
        { x: 200,  y: 20,  rot:  22 },
        { x: 260,  y: -40, rot:  28 },
      ];

      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top center",
        end: "bottom top",
        scrub: 1,            // slightly smoother scrub
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(`.${styles.bigResults}`, { scale: 1 + 0.15 * p, opacity: 1 - 0.4 * p });
          gsap.set(`.${styles.smallTeam}`, { y: -60 * p, opacity: 1 - p * 1.5 });
          cards.forEach((card, i) => {
            const m = moves[i] || { x: 0, y: 0, rot: 0 };
            const rest = parseFloat(card.dataset.restRot || "0");
            gsap.set(card, { x: m.x * p, y: m.y * p, rotation: rest + m.rot * p });
          });
        },
      });

      // 7. Team grid – reveal on scroll (once, no repeat)
      gsap.fromTo(`.${styles.tCard}`,
        { opacity: 0, y: 80, scale: 0.9, rotation: (i) => (i % 2 === 0 ? -3 : 3) },
        {
          opacity: 1, y: 0, scale: 1, rotation: (i) => (i % 2 === 0 ? -3 : 3),
          duration: 0.9, stagger: 0.07, ease: "back.out(1.3)",
          scrollTrigger: {
            trigger: `.${styles.teamGrid}`,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // 8. Stats block – reveal on scroll (once)
      gsap.fromTo(`.${styles.statsInner}`,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.1, ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.statsSection}`,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // 8b. Animated counters – fire once when stats section enters
      ScrollTrigger.create({
        trigger: `.${styles.statsSection}`,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const numEls = gsap.utils.toArray<HTMLElement>(`.${styles.statBlock} .${styles.numVal}`);
          numEls.forEach((el) => {
            const target = parseFloat(el.dataset.count || "0");
            const isFloat = el.dataset.count?.includes(".");
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target, duration: 2, ease: "power2.out",
              onUpdate: () => {
                el.textContent = isFloat
                  ? obj.v.toFixed(1)
                  : Math.floor(obj.v).toLocaleString();
              },
            });
          });
        },
      });

      // 9. Big results hover (unchanged)
      const wrap = bigResultsWrapRef.current;
      if (wrap) {
        wrap.addEventListener("mouseenter", () => {
          gsap.to(`.${styles.bigResults} .${styles.letter}`, {
            y: -8, duration: 0.5, stagger: 0.03, ease: "back.out(1.6)",
          });
        });
        wrap.addEventListener("mouseleave", () => {
          gsap.to(`.${styles.bigResults} .${styles.letter}`, {
            y: 0, duration: 0.6, stagger: 0.03, ease: "elastic.out(1, 0.6)",
          });
        });
      }

      return () => {
        parallaxRunning = false;
        cancelAnimationFrame(rafId);
        floatTimelines.forEach(t => t.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className={styles.sectionContainer} id="how-it-works">
      {/* =====================================================
          PART 1: HERO STAGE WITH FANNING PERSONA CARDS
      ====================================================== */}
      <section ref={stageRef} className={styles.heroStage} aria-label="AI Coach Panel">
        <div className={styles.topHeader}>
          <div className={styles.stageEyebrow}>
            <span className={styles.eyebrowDot} />
            {t.home.showcase.eyebrow}
          </div>
          <a href="#teamGrid" className={styles.arrowPill}>
            <span>{t.home.showcase.meetCrew}</span>
            <span className={styles.ar}>
              <ArrowDown size={13} strokeWidth={2.5} />
            </span>
          </a>
        </div>

        <h2 className={styles.smallTeam} id="smallTeam">
          <span className={styles.word}><span className={styles.wordSpan}>Specialized</span></span>&nbsp;
          <span className={styles.word}><span className={styles.wordSpan}>coaches,</span></span>
        </h2>

        <div ref={bigResultsWrapRef} className={styles.bigResultsWrap}>
          <div className={styles.bigResults} id="bigResults">
            {t.home.showcase.bigResults.split("").map((char: string, index: number) => (
              <span key={index} className={styles.letter}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        </div>

        {/* 8 Fanned Persona Cards */}
        <div className={styles.cardsRow} id="cardsRow">
          {coaches.map((c) => (
            <div
              key={c.id}
              className={`${styles.card} ${c.cardClass}`}
              data-rot={c.rot}
              data-depth={c.depth}
            >
              <img src={c.img} alt={c.name} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          PART 2: INTERVIEWER ROSTER & DOMAIN MATRIX
      ====================================================== */}
      <section className={styles.teamSection}>
        <div className={styles.teamHead}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              {locale === "vi" ? "CHUYÊN MÔN PHỎNG VẤN THEO NGÀNH NGHỀ" : "DOMAIN-SPECIFIC INTERVIEW EXPERTISE"}
            </div>
            <h2>
              Adaptive interviews for<br />
              <em>your exact role</em> and <em>seniority</em>.
            </h2>
          </div>
          <p>
            Choose the interviewer persona aligned with your target position. Each AI coach delivers realistic follow-ups, targeted rubrics, and industry-calibrated feedback.
          </p>
        </div>

        <div className={styles.teamGrid} id="teamGrid">
          {coaches.map((c) => (
            <div key={c.id} className={styles.tCard}>
              <img src={c.img} alt={c.name} loading="lazy" />
              <div className={styles.tMeta}>
                <div className={styles.nm}>{c.name}</div>
                <div className={styles.rl}>{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          PART 3: COACHING INTELLIGENCE STATS
      ====================================================== */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          <div className={styles.statsIntro}>
            <div className={styles.statsTag}>
              <Sparkles size={14} />
              <span>{locale === "vi" ? "KẾT QUẢ ĐO LƯỜNG ĐƯỢC" : "MEASURABLE INTELLIGENCE"}</span>
            </div>
            <h3>
              Calibrated for<br />
              <em>real-world offers</em>.
            </h3>
          </div>

          <div className={styles.statBlock}>
            <div className={styles.num} data-count="94">
              <span className={styles.numVal} data-count="94">0</span>
              <small>%</small>
            </div>
            <div className={styles.lbl}>{t.home.showcase.passRate}</div>
          </div>

          <div className={styles.statBlock}>
            <div className={styles.num} data-count="12800">
              <span className={styles.numVal} data-count="12800">0</span>
              <small>+</small>
            </div>
            <div className={styles.lbl}>{t.home.showcase.sessionsCount}</div>
          </div>

          <div className={styles.statBlock}>
            <div className={styles.num} data-count="4.9">
              <span className={styles.numVal} data-count="4.9">0</span>
              <small>/5</small>
            </div>
            <div className={styles.lbl}>{t.home.showcase.rubricPrecision}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

