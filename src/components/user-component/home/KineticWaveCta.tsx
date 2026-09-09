"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./KineticWaveCta.module.css";

export default function KineticWaveCta() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Clear any previously generated columns to prevent duplicates
      const existingCols = stage.querySelectorAll(".generated-col");
      existingCols.forEach((el) => el.remove());

      const baseCol = stage.querySelector<SVGGElement>(`.${styles.baseCol}`);
      const baseBox = stage.querySelector<SVGGElement>(`.${styles.baseBox}`);
      if (!baseCol || !baseBox) return;

      // Clone 9 boxes inside baseCol
      for (let i = 0; i < 9; i++) {
        const b = baseBox.cloneNode(true) as SVGElement;
        baseCol.append(b);
      }

      gsap.set(`.${styles.baseBox}`, { y: (i: number) => i * 10 });

      // Clone 10 columns (0 to 9)
      for (let i = 0; i <= 9; i++) {
        const c = baseCol.cloneNode(true) as SVGElement;
        c.classList.remove(styles.baseCol);
        c.classList.add("generated-col", `col-${i}`);
        gsap.set(c, { x: 10 * i });
        c.querySelectorAll(`.${styles.baseBox}`).forEach((boxEl) => {
          boxEl.classList.remove(styles.baseBox);
          boxEl.classList.add(`box-${i}`);
        });
        stage.append(c);
      }

      // Hide original column
      baseCol.style.display = "none";

      const tl = gsap.timeline();

      tl.to(
        ".generated-col",
        {
          duration: 1.5,
          y: 11,
          ease: "sine.inOut",
          stagger: {
            amount: 3,
            repeat: -1,
            yoyo: true,
          },
        },
        0
      );

      for (let i = 0; i <= 9; i++) {
        tl.add(
          gsap.fromTo(
            `.box-${i} *`,
            {
              y: (j: number) => gsap.utils.interpolate(77, -77, j / 10),
              transformOrigin: "50%",
              scale: 0.133,
            },
            {
              y: (j: number) => gsap.utils.interpolate(i, -i, j / 10),
              scale: 0.8,
              duration: 1,
              ease: "sine",
              repeat: -1,
              yoyo: true,
              yoyoEase: "sine.in",
            }
          ),
          i / 10
        );
      }

      tl.play(50);

      // Pause/resume based on visibility – saves GPU when off-screen
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tl.play();
            } else {
              tl.pause();
            }
          });
        },
        { threshold: 0 }
      );
      if (containerRef.current) io.observe(containerRef.current);

      return () => io.disconnect();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.wrapper} aria-hidden="true">
      <svg ref={stageRef} className={styles.stage} viewBox="0 0 98 108">
        <mask id="kinetic-cta-mask">
          <rect width="10" height="10" fill="#fff" />
        </mask>
        <g className={`${styles.col} ${styles.baseCol}`}>
          <g className={`${styles.box} ${styles.baseBox}`} mask="url(#kinetic-cta-mask)">
            <circle cx="5" cy="5" r="5" className={styles.circle} />
          </g>
        </g>
      </svg>
    </div>
  );
}
