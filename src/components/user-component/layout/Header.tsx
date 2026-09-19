"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { CrownAvatar } from "@/components/user-component/common";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import {
  MoreVertical,
  User,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/components/user-component/toast";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/practice", label: "PRACTICE" },
  { href: "/questions", label: "QUESTIONS" },
  { href: "/pricing", label: "PRICING" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale: lang, toggleLocale: toggleLang } = useI18n();
  const { isSubscribed } = useUserSubscription();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const navRef = useRef<HTMLElement>(null);
  const dropletRef = useRef<HTMLSpanElement>(null);
  const firstRender = useRef(true);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [droplet, setDroplet] = useState({ left: 0, width: 0, ready: false });

  const navItems = useMemo(
    () => [
      { href: "/", label: lang === "vi" ? "TRANG CHỦ" : "HOME" },
      { href: "/practice", label: lang === "vi" ? "LUYỆN TẬP" : "PRACTICE" },
      { href: "/questions", label: lang === "vi" ? "CÂU HỎI" : "QUESTIONS" },
      { href: "/pricing", label: lang === "vi" ? "BẢNG GIÁ" : "PRICING" },
    ],
    [lang]
  );

  // Dropdown states
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // Language state

  useEffect(() => {
    // Load stored theme & language
    const storedTheme = (localStorage.getItem("interviewly_theme") as "light" | "dark") || "light";
    setTheme(storedTheme);

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("interviewly_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };


  // Close dropdown on outside click or escape
  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, handleCloseMenu]);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const activeHref = navItems.find((item: { href: string; label: string }) => isActive(pathname, item.href))?.href;
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

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

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
          {navItems.map((item: { href: string; label: string }) => {
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

        {/* Right side action slot */}
        {isAuthenticated && user ? (
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              type="button"
              className={styles.userMenuTrigger}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="User navigation menu"
            >
              <CrownAvatar size="sm" initials={initials} isSubscribed={isSubscribed} />
              <span className={styles.userName}>{user.full_name}</span>
              <span className={styles.menuIconBtn}>
                <MoreVertical size={14} />
              </span>
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                {/* User Info Header */}
                <div className={styles.dropdownHeader}>
                  <CrownAvatar size="md" initials={initials} isSubscribed={isSubscribed} />
                  <div className={styles.dropdownHeaderInfo}>
                    <span className={styles.dropdownHeaderName}>{user.full_name}</span>
                    <span className={styles.dropdownHeaderEmail}>{user.email}</span>
                    <span className={styles.dropdownRoleBadge}>
                      {isAdmin
                        ? (lang === "vi" ? "🛡️ Quản trị viên" : "🛡️ Administrator")
                        : isSubscribed
                        ? (lang === "vi" ? "👑 Hội viên Pro" : "👑 Pro Member")
                        : (lang === "vi" ? "Ứng viên Free" : "Free Candidate")}
                    </span>
                  </div>
                </div>

                {/* Onboarding Alert Link if not completed */}
                {!user.is_onboarded && (
                  <Link
                    href="/onboarding"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={handleCloseMenu}
                    style={{ backgroundColor: "rgba(217, 130, 54, 0.08)" }}
                  >
                    <span className={styles.dropdownItemLeft}>
                      <Sparkles size={14} className="text-[#d98236]" />
                      <span className="font-bold text-[#b35919]">
                        {lang === "vi" ? "Khảo sát Onboarding" : "Complete Onboarding"}
                      </span>
                    </span>
                    <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse ml-auto" />
                  </Link>
                )}
                {/* Primary Navigation */}
                <Link
                  href="/profile"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={handleCloseMenu}
                >
                  <span className={styles.dropdownItemLeft}>
                    <User size={14} className={styles.dropdownItemIcon} />
                    {lang === "vi" ? "Hồ sơ cá nhân" : "My Profile"}
                  </span>
                </Link>

                <Link
                  href="/settings"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={handleCloseMenu}
                >
                  <span className={styles.dropdownItemLeft}>
                    <Settings size={14} className={styles.dropdownItemIcon} />
                    {lang === "vi" ? "Cài đặt tài khoản" : "Account Settings"}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={handleCloseMenu}
                  >
                    <span className={styles.dropdownItemLeft}>
                      <Shield size={14} className="text-amber-500 fill-amber-500/20" />
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {lang === "vi" ? "Vào trang quản trị" : "Admin Portal"}
                      </span>
                    </span>
                    <span className={styles.dropdownItemTag}>/admin</span>
                  </Link>
                )}

                <Link
                  href="/practice"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={handleCloseMenu}
                >
                  <span className={styles.dropdownItemLeft}>
                    <Sparkles size={14} className="text-[#d98236]" />
                    {lang === "vi" ? "Luyện phỏng vấn ngay" : "Start Coaching"}
                  </span>
                </Link>

                <div className={styles.dropdownDivider} />

                {/* Theme Switch */}
                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={toggleTheme}
                >
                  <span className={styles.dropdownItemLeft}>
                    {theme === "light" ? (
                      <Sun size={14} className={styles.dropdownItemIcon} />
                    ) : (
                      <Moon size={14} className={styles.dropdownItemIcon} />
                    )}
                    {lang === "vi" ? "Giao diện" : "Appearance"}
                  </span>
                  <span className={styles.dropdownItemTag}>
                    {theme === "light" ? (lang === "vi" ? "Sáng" : "Light") : (lang === "vi" ? "Tối" : "Dark")}
                  </span>
                </button>

                {/* Language Switch */}
                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={toggleLang}
                >
                  <span className={styles.dropdownItemLeft}>
                    <Globe size={14} className={styles.dropdownItemIcon} />
                    {lang === "vi" ? "Ngôn ngữ" : "Language"}
                  </span>
                  <span className={styles.dropdownItemTag}>
                    {lang === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
                  </span>
                </button>

                <div className={styles.dropdownDivider} />

                {/* Logout Button */}
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                  role="menuitem"
                  onClick={() => {
                    handleCloseMenu();
                    logout();
                    toast.info("Đã đăng xuất", "Hẹn gặp lại bạn trong các phiên luyện tập tiếp theo!");
                  }}
                >
                  <span className={styles.dropdownItemLeft}>
                    <LogOut size={14} className={styles.dropdownItemIcon} />
                    {lang === "vi" ? "Đăng xuất" : "Sign out"}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={styles.menu}>
            <span className={styles.menuDot} />
            SIGN IN
          </Link>
        )}
      </div>
    </header>
  );
}
