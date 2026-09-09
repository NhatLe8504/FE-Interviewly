"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "./AuthPanel.module.css";

export type AuthMode = "login" | "register";

type AuthPanelProps = {
  initialMode: AuthMode;
  variant?: "page" | "modal";
  syncUrl?: boolean;
  onModeChange?: (mode: AuthMode) => void;
};

const MODE_PATH: Record<AuthMode, string> = {
  login: "/login",
  register: "/register",
};

export default function AuthPanel({
  initialMode,
  variant = "page",
  syncUrl = false,
  onModeChange,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!syncUrl) return;
    const onPopState = () => {
      setMode(window.location.pathname.endsWith("/register") ? "register" : "login");
      setDone(false);
      setError(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncUrl]);

  const switchMode = (next: AuthMode) => {
    if (next === mode || loading) return;
    setMode(next);
    setDone(false);
    setError(null);
    setShowPassword(false);
    if (onModeChange) {
      onModeChange(next);
    } else if (syncUrl) {
      window.history.replaceState(null, "", MODE_PATH[next]);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register") {
      const name = String(data.get("name") || "").trim();
      const confirm = String(data.get("confirm") || "");
      if (!name) {
        setError("Please tell us your name.");
        return;
      }
      if (confirm !== password) {
        setError("Passwords do not match.");
        return;
      }
    }

    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1200);
  };

  return (
    <div className={variant === "page" ? styles.pageShell : styles.modalShell}>
      {variant === "page" && (
        <header className={styles.topBar}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>{"\u2726"}</span>
            <span>interviewly</span>
          </Link>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            Back to home
          </Link>
        </header>
      )}

      <div className={styles.authCard} data-mode={mode}>
        <div className={styles.formSide}>
          <p className={styles.eyebrow}>
            <span />
            {mode === "login" ? "Welcome back" : "Join interviewly"}
          </p>
          <h1>{mode === "login" ? "Sign in to keep practicing." : "Create your account."}</h1>
          <p className={styles.sub}>
            {mode === "login"
              ? "Pick up right where you left off — your sessions and feedback are waiting."
              : "Start your first adaptive session in under a minute. Free to begin."}
          </p>

          <div className={styles.segmented} role="tablist" aria-label="Choose sign in or create account">
            <span className={styles.segmentThumb} aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? styles.segmentActive : undefined}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? styles.segmentActive : undefined}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <div className={styles.formStack}>
            <form
              key={"login-form-" + mode}
              className={styles.formPane + " " + styles.paneLogin}
              onSubmit={handleSubmit}
              noValidate
            >
              <label className={styles.field}>
                <span>Email</span>
                <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
              </label>
              <label className={styles.field}>
                <span>Password</span>
                <span className={styles.passwordWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              <div className={styles.formRow}>
                <label className={styles.remember}>
                  <input type="checkbox" name="remember" defaultChecked />
                  Remember me
                </label>
                <span className={styles.forgot}>Forgot password?</span>
              </div>
              {error && mode === "login" && <p className={styles.error} role="alert">{error}</p>}
              {done && mode === "login" && (
                <p className={styles.success} role="status">
                  <Check size={15} /> Signed in — redirecting to your practice…
                </p>
              )}
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading && mode === "login" ? (
                  <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                ) : (
                  <>Sign in <ArrowRight size={18} aria-hidden="true" /></>
                )}
              </button>
            </form>

            <form
              key={"register-form-" + mode}
              className={styles.formPane + " " + styles.paneRegister}
              onSubmit={handleSubmit}
              noValidate
            >
              <label className={styles.field}>
                <span>Full name</span>
                <input type="text" name="name" placeholder="Ada Lovelace" autoComplete="name" required />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
              </label>
              <div className={styles.twoCol}>
                <label className={styles.field}>
                  <span>Password</span>
                  <span className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
                <label className={styles.field}>
                  <span>Confirm</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm"
                    placeholder="Repeat it"
                    autoComplete="new-password"
                    required
                  />
                </label>
              </div>
              {error && mode === "register" && <p className={styles.error} role="alert">{error}</p>}
              {done && mode === "register" && (
                <p className={styles.success} role="status">
                  <Check size={15} /> Account created — welcome aboard!
                </p>
              )}
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading && mode === "register" ? (
                  <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                ) : (
                  <>Create account <ArrowRight size={18} aria-hidden="true" /></>
                )}
              </button>
            </form>
          </div>

          <div className={styles.divider}>
            <span /> or <span />
          </div>
          <button type="button" className={styles.googleButton}>
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z" />
              <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.6 0 10.2 0 12s.5 3.4 1.4 4.9l3.8-2.5z" />
              <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.4 6.8l3.8 2.9c.9-2.9 3.6-5 6.8-5z" />
            </svg>
            Continue with Google
          </button>

          <p className={styles.switchLine}>
            {mode === "login" ? (
              <>New to Interviewly? <button type="button" onClick={() => switchMode("register")}>Create an account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => switchMode("login")}>Sign in</button></>
            )}
          </p>
        </div>

        <aside className={styles.showcase} aria-hidden="true">
          <div className={styles.showcaseLogin}>
            <p className={styles.showEyebrow}>Pick up the momentum</p>
            <p className={styles.showQuote}>“Less second-guessing. More deliberate practice.”</p>
            <div className={styles.showStats}>
              <div><strong>12.8k+</strong><span>sessions</span></div>
              <div><strong>94%</strong><span>pass rate</span></div>
              <div><strong>4.9/5</strong><span>rubric score</span></div>
            </div>
          </div>
          <div className={styles.showcaseRegister}>
            <p className={styles.showEyebrow}>Your first session</p>
            <p className={styles.showQuote}>“Your next interview deserves more than a guess.”</p>
            <ol className={styles.showSteps}>
              <li><strong>01</strong> Set your interview</li>
              <li><strong>02</strong> Have the conversation</li>
              <li><strong>03</strong> Use the feedback</li>
            </ol>
          </div>
          <span className={styles.showGlow} />
          <span className={styles.showMark}>{"\u2726"}</span>
        </aside>
      </div>
    </div>
  );
}
