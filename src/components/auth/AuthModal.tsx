"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import AuthPanel, { type AuthMode } from "./AuthPanel";
import styles from "./AuthPanel.module.css";

export default function AuthModal({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <div
      className={styles.modalBackdrop}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
    >
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={close} aria-label="Close dialog">
          <X size={17} aria-hidden="true" />
        </button>
        <AuthPanel
          initialMode={mode}
          variant="modal"
          onModeChange={(next) => router.push(next === "login" ? "/login" : "/register")}
        />
      </div>
    </div>
  );
}
