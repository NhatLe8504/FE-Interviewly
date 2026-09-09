"use client";

import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./LiquidMenu.module.css";

const menuItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Tools", href: "#tools" },
  { label: "Practice areas", href: "#practice" },
];

type Pill = { left: number; width: number };

export default function LiquidMenu() {
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pill, setPill] = useState<Pill>({ left: 0, width: 0 });

  const updatePill = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (!activeItem) return;

    setPill({ left: activeItem.offsetLeft, width: activeItem.offsetWidth });
  }, [activeIndex]);

  useLayoutEffect(() => {
    updatePill();

    const navigation = navRef.current;
    if (!navigation) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(navigation);
    return () => observer.disconnect();
  }, [updatePill]);

  const moveGlare = (event: MouseEvent<HTMLElement>) => {
    const navigation = event.currentTarget;
    const bounds = navigation.getBoundingClientRect();
    navigation.style.setProperty("--glare-x", `${event.clientX - bounds.left}px`);
    navigation.style.setProperty("--glare-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <nav ref={navRef} className={styles.liquidNav} aria-label="Primary navigation" onMouseMove={moveGlare}>
      <span className={styles.reflection} aria-hidden="true" />
      <span className={styles.glare} aria-hidden="true" />
      <div className={styles.navItems}>
        <span
          className={styles.activePill}
          aria-hidden="true"
          style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
        />
        {menuItems.map(({ label, href }, index) => (
          <a
            className={`${styles.navButton} ${activeIndex === index ? styles.active : ""}`}
            href={href}
            key={label}
            onClick={() => setActiveIndex(index)}
            ref={(element) => { itemRefs.current[index] = element; }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
