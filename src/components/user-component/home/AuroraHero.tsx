"use client";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import styles from "./AuroraHero.module.css";

const HERO_IMAGE =
  "https://images.openai.com/static-rsc-4/5DUTD8WqNzpiVRqaN5pE1Byk4T6UMrJ0CL_sDdIlNkcC5vEGwyCxPo0-7CKoo5vrX4dWE9fb38sl1z0zZchYerFsaIC604rIhXDS1BXnQrgA36MEPJZOKgBlop1o-OZYE1bhFdg_m4k2VNpIfnEOyeGWdEgdcSdjrRqgM6mfo6w?purpose=inline";

export default function AuroraHero() {
  // Preload hero image immediately – injects <link rel="preload" as="image"> in <head>
  preload(HERO_IMAGE, { as: "image", fetchPriority: "high" });

  const heroRef = useRef<HTMLDivElement | null>(null);
  const mainBubbleRef = useRef<SVGGElement | null>(null);
  const secondaryBubbleRef = useRef<SVGGElement | null>(null);
  const dropBubbleRef = useRef<SVGGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const heroVisible = useRef(true);

  useEffect(() => {
    // Respect reduced motion preference
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const PARALLAX_INTENSITY = 0.5;
    const PARALLAX_SMOOTHNESS = 0.04;

    const updateParallax = () => {
      const target = targetPos.current;
      const current = currentPos.current;

      current.x += (target.x - current.x) * PARALLAX_SMOOTHNESS;
      current.y += (target.y - current.y) * PARALLAX_SMOOTHNESS;

      const x = Number(current.x.toFixed(2));
      const y = Number(current.y.toFixed(2));

      if (mainBubbleRef.current) {
        mainBubbleRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (secondaryBubbleRef.current) {
        secondaryBubbleRef.current.style.transform = `translate3d(${(x * 1.55).toFixed(2)}px, ${(y * 1.55).toFixed(2)}px, 0)`;
      }
      if (dropBubbleRef.current) {
        dropBubbleRef.current.style.transform = `translate3d(${(x * 2.15).toFixed(2)}px, ${(y * 2.15).toFixed(2)}px, 0)`;
      }

      const diffX = Math.abs(target.x - current.x);
      const diffY = Math.abs(target.y - current.y);

      if (diffX > 0.05 || diffY > 0.05) {
        animFrameRef.current = requestAnimationFrame(updateParallax);
      } else {
        animFrameRef.current = null;
      }
    };

    const startParallaxLoop = () => {
      // Only run when hero is in viewport
      if (!heroVisible.current) return;
      if (animFrameRef.current === null) {
        animFrameRef.current = requestAnimationFrame(updateParallax);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!heroVisible.current) return;
      const normalizedX = event.clientX / window.innerWidth - 0.5;
      const normalizedY = event.clientY / window.innerHeight - 0.5;
      targetPos.current.x = normalizedX * 180 * PARALLAX_INTENSITY;
      targetPos.current.y = normalizedY * 130 * PARALLAX_INTENSITY;
      startParallaxLoop();
    };

    const handleMouseLeave = () => {
      targetPos.current.x = 0;
      targetPos.current.y = 0;
      startParallaxLoop();
    };

    // Stop parallax entirely when hero scrolls out of view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroVisible.current = entry.isIntersecting;
          if (!entry.isIntersecting && animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
        });
      },
      { threshold: 0 }
    );
    if (heroRef.current) io.observe(heroRef.current);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      io.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={heroRef} className={styles.hero} id="top">
      {/* =====================================================
          HERO BODY
      ====================================================== */}
      <div className={styles.heroBody}>
        {/* ===================================================
            CONTENT
        ==================================================== */}
        <section className={styles.content}>
          <div className={styles.eyebrow}>
            <span />
            A CALMER WAY TO PREPARE
          </div>

          <h1>
            PRACTICE THE
            <br />
            INTERVIEW.
            <br />
            <em>OWN THE ROOM.</em>
          </h1>

          <p className={styles.intro}>
            Build real interview confidence with an AI coach that listens,
            asks sharper follow-ups, and helps you make every answer count.
            Where engineering meets human nuance.
          </p>

          <div className={styles.actions}>
            <a href="#practice" className={`${styles.btn} ${styles.btnPrimary}`}>
              START PRACTICING
              <span>↗</span>
            </a>

            <a href="#how-it-works" className={`${styles.btn} ${styles.btnSecondary}`}>
              EXPLORE THE COACH
              <span>→</span>
            </a>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <small>PRACTICE FORMAT</small>
              <strong>VOICE & STAR METHOD</strong>
            </div>

            <div className={styles.metaItem}>
              <small>ADAPTIVE COACH</small>
              <strong>REAL-TIME RUBRICS</strong>
            </div>

            <div className={styles.metaItem}>
              <small>SCROLL TO EXPLORE</small>
              <span className={styles.scrollDot}>
                <i />
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            VISUAL
        ==================================================== */}
        <section className={styles.visual} id="visual" aria-hidden="true">
          {/* =================================================
              BACKLIGHT SYSTEM
          ================================================== */}
          <div className={styles.visualLighting}>
            <span className={`${styles.visualGlow} ${styles.visualGlowAmbient}`} />
            <span className={`${styles.visualGlow} ${styles.visualGlowCore}`} />
            <span className={`${styles.visualGlow} ${styles.visualGlowSun}`} />
            <span className={`${styles.visualGlow} ${styles.visualGlowBottom}`} />
            <span className={`${styles.visualGlow} ${styles.visualGlowSecondary}`} />
            <span className={`${styles.visualGlow} ${styles.visualGlowDrop}`} />
          </div>

          {/* =================================================
              SVG
          ================================================== */}
          <svg className={styles.liquidScene} viewBox="0 0 1100 850" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* STATIC GUIDE PATH FOR MARQUEE */}
              <path
                id="marqueeOrbitPath"
                d="
                  M 305 154
                  C 430 88 638 77 781 126
                  C 906 169 978 281 961 405
                  C 945 524 858 620 735 651
                  C 631 678 558 647 494 620
                  C 434 595 380 592 322 552
                  C 247 501 204 426 218 345
                  C 231 267 258 196 305 154
                  Z
                "
              />

              {/* MAIN BUBBLE PATH */}
              <path
                id="mainBubblePath"
                d="
                  M 305 154
                  C 430 88 638 77 781 126
                  C 906 169 978 281 961 405
                  C 945 524 858 620 735 651
                  C 631 678 558 647 494 620
                  C 434 595 380 592 322 552
                  C 247 501 204 426 218 345
                  C 231 267 258 196 305 154
                  Z
                "
              >
                <animate
                  attributeName="d"
                  dur="14s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .34; .68; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1; .42 0 .58 1"
                  values="
                    M 305 154
                    C 430 88 638 77 781 126
                    C 906 169 978 281 961 405
                    C 945 524 858 620 735 651
                    C 631 678 558 647 494 620
                    C 434 595 380 592 322 552
                    C 247 501 204 426 218 345
                    C 231 267 258 196 305 154
                    Z;
                    M 286 171
                    C 411 91 626 68 792 135
                    C 922 187 966 296 949 420
                    C 929 552 829 622 722 649
                    C 614 677 541 627 478 617
                    C 405 605 345 612 297 553
                    C 242 486 192 415 218 324
                    C 241 244 244 207 286 171
                    Z;
                    M 321 142
                    C 468 78 651 91 801 145
                    C 916 186 988 301 955 430
                    C 923 551 844 634 712 656
                    C 600 674 540 650 468 611
                    C 403 575 345 592 293 533
                    C 230 462 216 380 234 309
                    C 251 240 279 170 321 142
                    Z;
                    M 305 154
                    C 430 88 638 77 781 126
                    C 906 169 978 281 961 405
                    C 945 524 858 620 735 651
                    C 631 678 558 647 494 620
                    C 434 595 380 592 322 552
                    C 247 501 204 426 218 345
                    C 231 267 258 196 305 154
                    Z
                  "
                />
              </path>

              {/* SECONDARY PATH */}
              <path
                id="secondaryBubblePath"
                d="
                  M 224 530
                  C 291 486 386 489 449 543
                  C 508 594 500 683 441 731
                  C 383 779 279 771 223 714
                  C 168 657 168 568 224 530
                  Z
                "
              >
                <animate
                  attributeName="d"
                  dur="11s"
                  begin="-3s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .5; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1"
                  values="
                    M 224 530
                    C 291 486 386 489 449 543
                    C 508 594 500 683 441 731
                    C 383 779 279 771 223 714
                    C 168 657 168 568 224 530
                    Z;
                    M 207 545
                    C 272 483 390 493 458 557
                    C 507 605 483 695 425 737
                    C 361 783 262 757 211 699
                    C 165 646 160 588 207 545
                    Z;
                    M 224 530
                    C 291 486 386 489 449 543
                    C 508 594 500 683 441 731
                    C 383 779 279 771 223 714
                    C 168 657 168 568 224 530
                    Z
                  "
                />
              </path>

              {/* SMALL DROP PATH */}
              <path
                id="dropBubblePath"
                d="
                  M 645 679
                  C 686 658 741 675 758 713
                  C 776 753 747 791 704 793
                  C 665 794 627 765 629 728
                  C 630 707 632 687 645 679
                  Z
                "
              >
                <animate
                  attributeName="d"
                  dur="8s"
                  begin="-5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .5; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1"
                  values="
                    M 645 679
                    C 686 658 741 675 758 713
                    C 776 753 747 791 704 793
                    C 665 794 627 765 629 728
                    C 630 707 632 687 645 679
                    Z;
                    M 638 687
                    C 679 650 746 676 766 718
                    C 783 754 748 786 711 801
                    C 667 805 620 767 628 725
                    C 632 705 626 696 638 687
                    Z;
                    M 645 679
                    C 686 658 741 675 758 713
                    C 776 753 747 791 704 793
                    C 665 794 627 765 629 728
                    C 630 707 632 687 645 679
                    Z
                  "
                />
              </path>

              {/* CLIPS */}
              <clipPath id="mainBubbleClip">
                <use href="#mainBubblePath" />
              </clipPath>

              <clipPath id="secondaryBubbleClip">
                <use href="#secondaryBubblePath" />
              </clipPath>

              <clipPath id="dropBubbleClip">
                <use href="#dropBubblePath" />
              </clipPath>

              {/* MAIN LIQUID FILTER (Optimized) */}
              <filter
                id="mainLiquidFilter"
                x="-15%"
                y="-15%"
                width="130%"
                height="130%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency=".008 .010"
                  numOctaves={1}
                  seed={92}
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="10s"
                    repeatCount="indefinite"
                    values=".008 .010; .010 .008; .007 .012; .008 .010"
                  />
                </feTurbulence>

                <feGaussianBlur in="noise" stdDeviation="1.2" result="blurredNoise" />

                <feDisplacementMap
                  in="SourceGraphic"
                  in2="blurredNoise"
                  scale={80}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />

                <feColorMatrix
                  type="matrix"
                  values="
                    1.02  0     0     0  0.010
                    0     1.01  0     0  0.008
                    0     0     .96   0 -0.002
                    0     0     0     1  0
                  "
                />
              </filter>

              {/* EDGE-DISTORTION MASK */}
              <radialGradient id="mainDistortionFade" gradientUnits="userSpaceOnUse" cx="590" cy="385" r="330">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="55%" stopColor="white" stopOpacity="1" />
                <stop offset="78%" stopColor="white" stopOpacity=".52" />
                <stop offset="100%" stopColor="black" stopOpacity="0" />
              </radialGradient>

              <mask id="mainDistortionMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1100" height="850" fill="black" />
                <ellipse cx="590" cy="385" rx="335" ry="265" fill="url(#mainDistortionFade)" />
              </mask>

              {/* SECONDARY FILTER */}
              <filter
                id="secondaryLiquidFilter"
                x="-15%"
                y="-15%"
                width="130%"
                height="130%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency=".010 .009"
                  numOctaves={1}
                  seed={31}
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="9s"
                    repeatCount="indefinite"
                    values=".010 .009; .009 .012; .012 .010; .010 .009"
                  />
                </feTurbulence>

                <feGaussianBlur in="noise" stdDeviation="1" result="blur" />

                <feDisplacementMap
                  in="SourceGraphic"
                  in2="blur"
                  scale={58}
                  xChannelSelector="R"
                  yChannelSelector="B"
                />

                <feColorMatrix
                  type="matrix"
                  values="
                    1.02  0     0     0  0.010
                    0     1.01  0     0  0.008
                    0     0     .95   0 -0.002
                    0     0     0     1  0
                  "
                />
              </filter>

              {/* DROP FILTER */}
              <filter
                id="dropLiquidFilter"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency=".014 .012"
                  numOctaves={1}
                  seed={62}
                  result="noise"
                />
                <feGaussianBlur in="noise" stdDeviation="0.9" result="blur" />
                <feDisplacementMap in="SourceGraphic" in2="blur" scale={42} xChannelSelector="B" yChannelSelector="G" />
                <feColorMatrix
                  type="matrix"
                  values="
                    1.02  0     0     0  0.010
                    0     1.01  0     0  0.008
                    0     0     .95   0 -0.002
                    0     0     0     1  0
                  "
                />
              </filter>

              {/* GLASS EDGE */}
              <linearGradient id="glassStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="16%" stopColor="#fffdf7" stopOpacity=".96" />
                <stop offset="28%" stopColor="#dff6ff" stopOpacity=".55" />
                <stop offset="44%" stopColor="#fff8fe" stopOpacity=".36" />
                <stop offset="60%" stopColor="#ffdff2" stopOpacity=".34" />
                <stop offset="76%" stopColor="#d8f6ff" stopOpacity=".36" />
                <stop offset="90%" stopColor="#fff7ef" stopOpacity=".70" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity=".96" />
              </linearGradient>

              {/* INNER LIGHT */}
              <radialGradient id="mainInnerLight" cx="65%" cy="20%" r="64%">
                <stop offset="0%" stopColor="#fff8df" stopOpacity=".40" />
                <stop offset="20%" stopColor="#ffe5b9" stopOpacity=".20" />
                <stop offset="48%" stopColor="#ffd5a4" stopOpacity=".06" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="glassSheen" x1="0" y1="0" x2="0.75" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".30" />
                <stop offset="22%" stopColor="#fff4de" stopOpacity=".15" />
                <stop offset="52%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#d9a675" stopOpacity=".05" />
              </linearGradient>

              <radialGradient id="mainInnerMilk" cx="48%" cy="16%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".34" />
                <stop offset="18%" stopColor="#fffdf8" stopOpacity=".22" />
                <stop offset="40%" stopColor="#fff7ef" stopOpacity=".08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="mainBottomPearl" cx="40%" cy="92%" r="48%">
                <stop offset="0%" stopColor="#ffdff1" stopOpacity=".14" />
                <stop offset="34%" stopColor="#e9dfff" stopOpacity=".08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="mainIridescentSheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".20" />
                <stop offset="16%" stopColor="#dff6ff" stopOpacity=".16" />
                <stop offset="33%" stopColor="#ffffff" stopOpacity=".08" />
                <stop offset="58%" stopColor="#ffe1f4" stopOpacity=".07" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              <radialGradient id="specHot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity=".52" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="specSoft" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".55" />
                <stop offset="42%" stopColor="#ffffff" stopOpacity=".16" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* MAIN PARALLAX GROUP */}
            <g id="mainParallax" ref={mainBubbleRef}>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  dur="8.5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .3; .65; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1; .42 0 .58 1"
                  values="0 0; 7 -24; -5 -10; 0 0"
                />

                {/* Base image */}
                <g clipPath="url(#mainBubbleClip)">
                  <image
                    href={HERO_IMAGE}
                    x="125"
                    y="40"
                    width="930"
                    height="720"
                    preserveAspectRatio="xMidYMid slice"
                  />

                  {/* Soft top milky veil */}
                  <rect x="0" y="0" width="1100" height="850" fill="url(#mainInnerMilk)" />

                  {/* Iridescent sheen */}
                  <rect x="0" y="0" width="1100" height="850" fill="url(#mainIridescentSheen)" />

                  {/* Subtle bottom pearl tint */}
                  <rect x="0" y="0" width="1100" height="850" fill="url(#mainBottomPearl)" />

                  {/* Specular highlights */}
                  <ellipse cx="406" cy="218" rx="48" ry="38" fill="url(#specHot)" transform="rotate(-18 406 218)" />
                  <ellipse cx="438" cy="164" rx="18" ry="14" fill="url(#specSoft)" transform="rotate(-18 438 164)" />
                  <ellipse cx="836" cy="286" rx="16" ry="13" fill="url(#specSoft)" />
                  <ellipse cx="365" cy="678" rx="13" ry="11" fill="url(#specSoft)" />
                </g>

                {/* Distorted center */}
                <g
                  clipPath="url(#mainBubbleClip)"
                  mask="url(#mainDistortionMask)"
                  filter="url(#mainLiquidFilter)"
                  opacity=".90"
                >
                  <image
                    href={HERO_IMAGE}
                    x="125"
                    y="40"
                    width="930"
                    height="720"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>

                {/* Marquee with static guide path */}
                <g className={styles.marquee}>
                  <text className={styles.marqueeText} dy="-14">
                    <textPath href="#marqueeOrbitPath" startOffset="0%">
                      ✦ AI INTERVIEW COACH ✦ ADAPTIVE CONVERSATIONS ✦ STAR METHOD ✦ REAL-TIME RUBRIC ✦ VOICE COACHING ✦ INTERVIEWLY ✦
                      <animate attributeName="startOffset" from="0%" to="100%" dur="22s" repeatCount="indefinite" />
                    </textPath>
                  </text>

                  <text className={styles.marqueeText} dy="-14">
                    <textPath href="#marqueeOrbitPath" startOffset="-100%">
                      ✦ AI INTERVIEW COACH ✦ ADAPTIVE CONVERSATIONS ✦ STAR METHOD ✦ REAL-TIME RUBRIC ✦ VOICE COACHING ✦ INTERVIEWLY ✦
                      <animate attributeName="startOffset" from="-100%" to="0%" dur="22s" repeatCount="indefinite" />
                    </textPath>
                  </text>
                </g>

                <use href="#mainBubblePath" className={`${styles.bubbleEdge} ${styles.bubbleEdgeMain}`} />
              </g>
            </g>

            {/* SECONDARY PARALLAX GROUP */}
            <g id="secondaryParallax" ref={secondaryBubbleRef}>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  dur="7s"
                  begin="-2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .5; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1"
                  values="0 0; -14 -30; 0 0"
                />

                <g filter="url(#secondaryLiquidFilter)" clipPath="url(#secondaryBubbleClip)">
                  <image
                    href={HERO_IMAGE}
                    x="60"
                    y="230"
                    width="720"
                    height="650"
                    preserveAspectRatio="xMidYMid slice"
                  />

                  <rect x="0" y="0" width="1100" height="850" fill="#efad69" opacity=".06" className={styles.bubbleWarmOverlay} />
                  <rect x="0" y="0" width="1100" height="850" fill="url(#glassSheen)" opacity=".72" />
                </g>

                <use href="#secondaryBubblePath" className={styles.bubbleEdge} />
              </g>
            </g>

            {/* DROP PARALLAX GROUP */}
            <g id="dropParallax" ref={dropBubbleRef}>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  dur="6s"
                  begin="-4s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; .5; 1"
                  keySplines=".42 0 .58 1; .42 0 .58 1"
                  values="0 0; 15 -34; 0 0"
                />

                <g filter="url(#dropLiquidFilter)" clipPath="url(#dropBubbleClip)">
                  <image
                    href={HERO_IMAGE}
                    x="450"
                    y="470"
                    width="520"
                    height="440"
                    preserveAspectRatio="xMidYMid slice"
                  />

                  <rect x="0" y="0" width="1100" height="850" fill="#ed9e57" opacity=".065" className={styles.bubbleWarmOverlay} />
                </g>

                <use href="#dropBubblePath" className={styles.bubbleEdge} />
              </g>
            </g>
          </svg>
        </section>
      </div>
    </div>
  );
}
