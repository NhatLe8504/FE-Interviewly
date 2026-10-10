"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X } from "lucide-react";
import styles from "./UserToast.module.css";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  title: string;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastInstance extends ToastOptions {
  id: string;
  variant: ToastVariant;
  duration: number;
  isExiting?: boolean;
}

// Global subscribers for imperative calls (outside React)
type Subscriber = (toasts: ToastInstance[]) => void;
let activeToasts: ToastInstance[] = [];
let subscribers: Subscriber[] = [];

const notify = () => {
  subscribers.forEach((fn) => fn([...activeToasts]));
};

export const toast = (
  titleOrOptions: string | ToastOptions,
  options?: Omit<ToastOptions, "title">
) => {
  const opts: ToastOptions =
    typeof titleOrOptions === "string"
      ? { title: titleOrOptions, ...options }
      : titleOrOptions;

  const id = opts.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const instance: ToastInstance = {
    ...opts,
    id,
    variant: opts.variant || "info",
    duration: opts.duration || 4000,
  };

  // Keep at most 4 toasts visible at once
  activeToasts = [instance, ...activeToasts.filter((t) => t.id !== id)].slice(0, 4);
  notify();

  return id;
};

toast.success = (title: string, description?: React.ReactNode, duration?: number) =>
  toast({ title, description, variant: "success", duration });

toast.error = (title: string, description?: React.ReactNode, duration?: number) =>
  toast({ title, description, variant: "error", duration });

toast.warning = (title: string, description?: React.ReactNode, duration?: number) =>
  toast({ title, description, variant: "warning", duration });

toast.info = (title: string, description?: React.ReactNode, duration?: number) =>
  toast({ title, description, variant: "info", duration });

toast.dismiss = (id?: string) => {
  if (!id) {
    activeToasts = [];
  } else {
    activeToasts = activeToasts.filter((t) => t.id !== id);
  }
  notify();
};

/**
 * Stores a flash toast in sessionStorage to be displayed AFTER redirecting
 */
export const setFlashToast = (options: ToastOptions) => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("flash_toast", JSON.stringify(options));
    } catch {
      // ignore
    }
  }
};

/* -------------------------------------------------------------------------- */
/* Dedicated Smooth SVG Animation Components (No Static Icons, Non-AI)       */
/* -------------------------------------------------------------------------- */

function AnimatedSuccess() {
  return (
    <div className={`${styles.animWrapper} ${styles.badgeSuccess}`}>
      <span className={`${styles.animRipple} ${styles.rippleSuccess}`} />
      <svg className={styles.animSvg} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle className={styles.strokeSuccessCircle} cx="16" cy="16" r="13" />
        <path className={styles.strokeSuccessCheck} d="M10 16.5 L14.2 20.7 L22 12" />
      </svg>
    </div>
  );
}

function AnimatedError() {
  return (
    <div className={`${styles.animWrapper} ${styles.badgeError}`}>
      <span className={`${styles.animRipple} ${styles.rippleError}`} />
      <svg className={styles.animSvg} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle className={styles.strokeErrorCircle} cx="16" cy="16" r="13" />
        <line className={styles.strokeErrorLine1} x1="11.5" y1="11.5" x2="20.5" y2="20.5" />
        <line className={styles.strokeErrorLine2} x1="20.5" y1="11.5" x2="11.5" y2="20.5" />
      </svg>
    </div>
  );
}

function AnimatedWarning() {
  return (
    <div className={`${styles.animWrapper} ${styles.badgeWarning}`}>
      <span className={`${styles.animRipple} ${styles.rippleWarning}`} />
      <svg className={styles.animSvg} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          className={styles.strokeWarningTriangle}
          d="M16 6 L27.5 24.5 C28 25.3 27.4 26 26.5 26 H5.5 C4.6 26 4 25.3 4.5 24.5 L16 6 Z"
        />
        <line className={styles.strokeWarningStem} x1="16" y1="13" x2="16" y2="19" />
        <circle className={styles.warningDot} cx="16" cy="23" r="1.4" />
      </svg>
    </div>
  );
}

function AnimatedInfo() {
  return (
    <div className={`${styles.animWrapper} ${styles.badgeInfo}`}>
      <span className={`${styles.animRipple} ${styles.rippleInfo}`} />
      <svg className={styles.animSvg} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle className={styles.strokeInfoCircle} cx="16" cy="16" r="13" />
        <line className={styles.strokeInfoStem} x1="16" y1="15.5" x2="16" y2="21.5" />
        <circle className={styles.infoDot} cx="16" cy="11.5" r="1.4" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Individual Toast Card with Modern SaaS Design & Animated Graphic           */
/* -------------------------------------------------------------------------- */

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastInstance;
  onDismiss: (id: string) => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(item.id);
    }, 240);
  }, [item.id, onDismiss]);

  useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(handleClose, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, handleClose]);

  const renderAnimation = () => {
    switch (item.variant) {
      case "success":
        return <AnimatedSuccess />;
      case "error":
        return <AnimatedError />;
      case "warning":
        return <AnimatedWarning />;
      case "info":
      default:
        return <AnimatedInfo />;
    }
  };

  const getVariantClass = () => {
    switch (item.variant) {
      case "success":
        return styles.toastSuccess;
      case "error":
        return styles.toastError;
      case "warning":
        return styles.toastWarning;
      case "info":
      default:
        return styles.toastInfo;
    }
  };

  const getProgressClass = () => {
    switch (item.variant) {
      case "success":
        return `${styles.progressBar} ${styles.progressSuccess}`;
      case "error":
        return `${styles.progressBar} ${styles.progressError}`;
      case "warning":
        return `${styles.progressBar} ${styles.progressWarning}`;
      case "info":
      default:
        return `${styles.progressBar} ${styles.progressInfo}`;
    }
  };

  return (
    <div
      className={`${styles.toastItem} ${getVariantClass()} ${isClosing ? styles.toastExiting : ""}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Animated Graphic Effect */}
      {renderAnimation()}

      <div className={styles.toastContent}>
        <h4 className={styles.toastTitle}>{item.title}</h4>
        {item.description && (
          <p className={styles.toastDescription}>{item.description}</p>
        )}
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>

      {item.duration > 0 && (
        <div
          className={getProgressClass()}
          style={{ animationDuration: `${item.duration}ms` }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Global Toaster Container (Provider Attached in (user)/layout.tsx)          */
/* -------------------------------------------------------------------------- */

export function UserToaster() {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  // Check for post-redirect flash toast
  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("flash_toast");
      if (flash) {
        sessionStorage.removeItem("flash_toast");
        const parsed = JSON.parse(flash);
        // Trigger toast after home page paint
        setTimeout(() => {
          toast(parsed);
        }, 220);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleUpdate = (updated: ToastInstance[]) => {
      setToasts(updated);
    };
    subscribers.push(handleUpdate);
    return () => {
      subscribers = subscribers.filter((fn) => fn !== handleUpdate);
    };
  }, []);

  const handleDismiss = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toasterContainer} aria-label="Thông báo hệ thống">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Context & Hook for ergonomic usage in React components                     */
/* -------------------------------------------------------------------------- */

interface ToastContextType {
  toast: typeof toast;
}

const ToastContext = createContext<ToastContextType>({ toast });

export function UserToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <UserToaster />
    </ToastContext.Provider>
  );
}

export function useUserToast() {
  return useContext(ToastContext).toast;
}

export default UserToaster;