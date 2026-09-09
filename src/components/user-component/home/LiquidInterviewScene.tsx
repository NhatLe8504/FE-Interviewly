"use client";

import { Mic, Sparkles, Star, Waves } from "lucide-react";
import { useRef } from "react";
import styles from "./LiquidInterviewScene.module.css";

type SceneElement = HTMLElement & {
  style: CSSStyleDeclaration;
};

export default function LiquidInterviewScene() {
  const sceneRef = useRef<SceneElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const paintParallax = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    const current = currentRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;

    scene.style.setProperty("--parallax-x", `${current.x.toFixed(2)}px`);
    scene.style.setProperty("--parallax-y", `${current.y.toFixed(2)}px`);
    scene.style.setProperty("--parallax-x-deep", `${(current.x * 1.45).toFixed(2)}px`);
    scene.style.setProperty("--parallax-y-deep", `${(current.y * 1.45).toFixed(2)}px`);

    if (Math.abs(target.x - current.x) > 0.02 || Math.abs(target.y - current.y) > 0.02) {
      frameRef.current = window.requestAnimationFrame(paintParallax);
    } else {
      frameRef.current = null;
    }
  };

  const schedulePaint = () => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(paintParallax);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 18,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 14,
    };
    schedulePaint();
  };

  const handlePointerLeave = () => {
    targetRef.current = { x: 0, y: 0 };
    schedulePaint();
  };

  return (
    <section
      ref={sceneRef}
      className={styles.scene}
      aria-label="AI interview coaching experience"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={styles.glow} aria-hidden="true" />
      <svg className={styles.backdrop} viewBox="0 0 960 700" aria-hidden="true">
        <defs>
          <linearGradient id="mainGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffdfa" />
            <stop offset="0.5" stopColor="#ffe9d1" />
            <stop offset="1" stopColor="#fed2a4" />
          </linearGradient>
          <linearGradient id="secondaryGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffe4c4" />
          </linearGradient>
          <linearGradient id="dropGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff8ef" />
            <stop offset="1" stopColor="#fcd3a0" />
          </linearGradient>
          <filter id="liquidBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.025" numOctaves={2} seed={14} result="noise">
              <animate attributeName="baseFrequency" dur="10s" values="0.018 0.025;0.026 0.014;0.018 0.025" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="17" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#54321b" floodOpacity="0.08" />
          </filter>
        </defs>
        <g className={styles.svgPrimary} filter="url(#shadow)">
          <path
            d="M421 102c111-27 261 20 286 144 26 126-70 264-197 283-126 19-283-58-299-182-15-119 101-219 210-245Z"
            fill="url(#mainGradient)"
            filter="url(#liquidBlur)"
          />
        </g>
        <g className={styles.svgSecondary} filter="url(#shadow)">
          <path d="M171 360c69-38 161-2 181 72 21 76-45 166-125 158-80-9-125-98-94-163 10-24 22-43 38-57Z" fill="url(#secondaryGradient)" />
        </g>
        <g className={styles.svgDrop} filter="url(#shadow)">
          <path d="M740 430c55-7 115 34 118 90 3 58-54 106-109 91-53-14-78-81-48-124 11-16 22-33 39-57Z" fill="url(#dropGradient)" />
        </g>
      </svg>

      <div className={styles.primaryParallax}>
        <article className={styles.primaryBubble}>
          <div className={styles.bubbleTopline}>
            <span className={styles.iconCircle}><Sparkles size={14} strokeWidth={2} /></span>
            <span>AI interviewer</span>
            <span className={styles.live}><i /> Live</span>
          </div>
          <p className={styles.question}>Tell me about a time you resolved a difficult conflict in a cross-functional team.</p>
          <div className={styles.answerLine}><span /> You can start when you&apos;re ready</div>
        </article>
      </div>

      <div className={styles.secondaryParallax}>
        <article className={styles.starBubble}>
          <span className={styles.iconCircle}><Star size={13} strokeWidth={2} /></span>
          <strong>STAR guidance</strong>
          <span>Situation · Task · Action · Result</span>
        </article>
      </div>

      <div className={styles.dropParallax}>
        <article className={styles.voiceBubble}>
          <Mic size={16} strokeWidth={2} />
          <span>Voice practice</span>
          <Waves size={16} strokeWidth={2} />
        </article>
      </div>

      <div className={styles.sceneCaption}>
        <span className={styles.captionLine} />
        <p>One calm space for practice, feedback, and a stronger next answer.</p>
      </div>
    </section>
  );
}
