"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/interview/setup", label: "PRACTICE" },
  { href: "/questions", label: "QUESTIONS" },
  { href: "/pricing", label: "PRICING" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const dropletRef = useRef<HTMLSpanElement>(null);
  const firstRender = useRef(true);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [droplet, setDroplet] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const activeHref = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.href;
      const link = activeHref ? linkRefs.current.get(activeHref) : undefined;
      if (!nav || !link) return;
      const navBox = nav.getBoundingClientRect();
      const linkBox = link.getBoundingClientRect();
      setDroplet({
        left: linkBox.left - navBox.left,
        width: linkBox.width,
        ready: true,
      });
      if (!firstRender.current) {
        dropletRef.current?.animate(
          [
            { transform: "scaleX(1) scaleY(1)" },
            { transform: "scaleX(1.18) scaleY(0.88)", offset: 0.3 },
            { transform: "scaleX(0.92) scaleY(1.06)", offset: 0.55 },
            { transform: "scaleX(1.06) scaleY(0.97)", offset: 0.75 },
            { transform: "scaleX(1) scaleY(1)" },
          ],
          { duration: 550, easing: "ease" },
        );
      }
      firstRender.current = false;
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  return (
    <header className={styles.headerWrapper} aria-label="Site header">
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoSymbol}>✦</span>
          <span>INTERVIEWLY</span>
        </Link>

        <nav ref={navRef} className={styles.nav}>
          <span
            ref={dropletRef}
            aria-hidden="true"
            className={styles.droplet}
            style={
              droplet.ready
                ? { left: droplet.left, width: droplet.width, opacity: 1 }
                : { opacity: 0 }
            }
          />
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? styles.active : undefined}
                ref={(node) => {
                  if (node) linkRefs.current.set(item.href, node);
                  else linkRefs.current.delete(item.href);
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/interview/setup" className={styles.menu}>
          <span className={styles.menuDot} />
          START COACH
        </Link>
      </div>
    </header>
  );
}

