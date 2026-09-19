"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/authApi";
import { toast, setFlashToast } from "@/components/user-component/toast";
import styles from "./AuthPanel.module.css";
import { SetPasswordModal } from "./SetPasswordModal";

export type AuthMode = "login" | "register" | "set_password";

const DEFAULT_GOOGLE_CLIENT_ID =
  "931631230905-0v425ou7p4h26232bl16u4hbq0oufgle.apps.googleusercontent.com";

type AuthPanelProps = {
  initialMode: AuthMode;
  variant?: "page" | "modal";
  syncUrl?: boolean;
  onModeChange?: (mode: AuthMode) => void;
};

const MODE_PATH: Record<AuthMode, string> = {
  login: "/login",
  register: "/register",
  set_password: "/login?mode=set_password",
};

export default function AuthPanel({
  initialMode,
  variant = "page",
  syncUrl = false,
  onModeChange,
}: AuthPanelProps) {
  const router = useRouter();
  const { login, register, googleLogin, setInitialPassword, user } = useAuth();
  const [showSetPasswordPopup, setShowSetPasswordPopup] = useState(false);
  const [pendingAuthResponse, setPendingAuthResponse] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // OTP states for registration
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Google GSI loaded flag
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!syncUrl) return;
    const onPopState = () => {
      setMode(window.location.pathname.endsWith("/register") ? "register" : "login");
      setDone(false);
      setError(null);
      setSuccessMsg(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncUrl]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGsi = () => {
      if (typeof window === "undefined" || !window.google?.accounts?.id) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              try {
                setLoading(true);
                setError(null);
                const tokenRes = await googleLogin(response.credential);
                let profile = null;
                try {
                  profile = await authApi.getMe();
                } catch {}
                setDone(true);
                setFlashToast({
                  variant: "success",
                  title: "Đăng nhập Google thành công!",
                  description: "Chào mừng bạn quay trở lại với Interviewly.",
                });
                handlePostAuthRedirect(tokenRes, profile);
              } catch (err: any) {
                setError(err.message || "Đăng nhập Google thất bại.");
              } finally {
                setLoading(false);
              }
            }
          },
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: 360,
            logo_alignment: "left",
          });
        }

        setGoogleReady(true);
        return true;
      } catch {
        return false;
      }
    };

    if (!initGsi()) {
      const interval = setInterval(() => {
        if (initGsi()) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleLogin, router]);

  const handlePostAuthRedirect = (tokenRes?: any, userProfile?: any) => {
    // 1. Force password setup popup for first-time Google users (or users without password)
    if (tokenRes?.needs_password || userProfile?.needs_password) {
      setPendingAuthResponse({ tokenRes, userProfile });
      setShowSetPasswordPopup(true);
      setLoading(false);
      setError(null);
      return;
    }

    // 2. Check if user hasn't completed onboarding -> redirect to /onboarding
    if (tokenRes?.is_onboarded === false || (userProfile && !userProfile.is_onboarded)) {
      window.location.href = "/onboarding";
      return;
    }

    // 3. Otherwise redirect to admin or home
    if (userProfile?.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/";
  };

  const handleSetInitialPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Mật khẩu mới phải có độ dài tối thiểu 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không trùng khớp.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await setInitialPassword(newPassword);
      setFlashToast({
        variant: "success",
        title: "Thiết lập mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật an toàn.",
      });

      let profile = null;
      try {
        profile = await authApi.getMe();
      } catch {}

      if (profile && !profile.is_onboarded) {
        window.location.href = "/onboarding";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err?.data?.detail || err?.message || "Không thể thiết lập mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode || loading) return;
    setMode(next);
    setDone(false);
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    if (onModeChange) {
      onModeChange(next);
    } else if (syncUrl) {
      window.history.replaceState(null, "", MODE_PATH[next]);
    }
  };

  const handleSendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ để nhận mã OTP.");
      return;
    }
    try {
      setOtpLoading(true);
      setError(null);
      const res = await authApi.sendOtp({ email, purpose: "verify_email" });
      setShowOtpField(true);
      setOtpCountdown(60);
      const msg = res.message || "Mã OTP 6 chữ số đã được gửi tới email của bạn.";
      setSuccessMsg(msg);
      toast.info("Đã gửi mã OTP", msg);
    } catch (err: any) {
      setError(err.message || "Không thể gửi mã OTP. Vui lòng thử lại sau.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP đã nhận.");
      return;
    }
    try {
      setOtpLoading(true);
      setError(null);
      const res = await authApi.verifyOtp({ email, otp: otp.trim(), purpose: "verify_email" });
      setOtpVerified(true);
      const msg = res.message || "Xác thực OTP thành công!";
      setSuccessMsg(msg);
      toast.success("Xác thực OTP thành công", "Bạn có thể tiếp tục hoàn tất tạo tài khoản.");
    } catch (err: any) {
      setError(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFallbackGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Chưa cấu hình Google Client ID. Vui lòng cấu hình .env.local.");
      return;
    }

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              try {
                setLoading(true);
                setError(null);
                const tokenRes = await googleLogin(response.credential);
                let profile = null;
                try {
                  profile = await authApi.getMe();
                } catch {}
                setDone(true);
                setFlashToast({
                  variant: "success",
                  title: "Đăng nhập Google thành công!",
                  description: "Chào mừng bạn quay trở lại với Interviewly.",
                });
                handlePostAuthRedirect(tokenRes, profile);
              } catch (err: any) {
                console.error("Google auth backend error:", err);
                const detail = err?.data?.detail;
                const msg = typeof detail === "string" ? detail : (err?.message || "Đăng nhập Google thất bại.");
                setError(msg);
              } finally {
                setLoading(false);
              }
            } else {
              setError("Không nhận được token xác thực từ Google.");
            }
          },
          error_callback: (err) => {
            console.warn("Google GSI error:", err);
          },
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (googleBtnRef.current) {
              googleBtnRef.current.innerHTML = "";
              window.google?.accounts.id.renderButton(googleBtnRef.current, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "continue_with",
                shape: "pill",
                width: 360,
                logo_alignment: "left",
              });
              setGoogleReady(true);
            }
          }
        });
      } catch (err: any) {
        setError(err?.message || "Không thể khởi tạo đăng nhập Google.");
      }
    } else {
      setError("Google Identity SDK đang tải. Vui lòng thử lại sau giây lát.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Vui lòng nhập đúng định dạng email.");
      return;
    }

    if (mode === "login") {
      if (!password) {
        setError("Vui lòng nhập mật khẩu.");
        return;
      }

      try {
        setLoading(true);
        await login({ email, password });
        setDone(true);
        setFlashToast({
          variant: "success",
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại với Interviewly.",
        });
        window.location.href = "/";
      } catch (err: any) {
        setError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      if (!fullName.trim()) {
        setError("Vui lòng nhập họ và tên.");
        return;
      }
      if (password.length < 8) {
        setError("Mật khẩu phải có tối thiểu 8 ký tự.");
        return;
      }
      if (confirmPassword !== password) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }

      try {
        setLoading(true);
        await register({
          full_name: fullName.trim(),
          email,
          password,
          otp: otp.trim() || null,
        });

        setDone(true);
        setFlashToast({
          variant: "success",
          title: "Tạo tài khoản thành công!",
          description: "Chào mừng bạn bắt đầu hành trình cùng Interviewly.",
        });

        try {
          const tokenRes = await login({ email, password });
          let profile = null;
          try {
            profile = await authApi.getMe();
          } catch {}
          handlePostAuthRedirect(tokenRes, profile);
        } catch {
          setTimeout(() => {
            switchMode("login");
          }, 1500);
        }
      } catch (err: any) {
        setError(err.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
      } finally {
        setLoading(false);
      }
    }
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
            Về trang chủ
          </Link>
        </header>
      )}

      <div className={styles.authCard} data-mode={mode}>
        <div className={styles.formSide}>
          <p className={styles.eyebrow}>
            <span />
            {mode === "set_password"
              ? "Bảo mật tài khoản Google"
              : mode === "login"
              ? "Chào mừng trở lại"
              : "Tham gia cùng interviewly"}
          </p>
          <h1>
            {mode === "set_password"
              ? "Thiết lập mật khẩu tài khoản"
              : mode === "login"
              ? "Đăng nhập tài khoản"
              : "Tạo tài khoản luyện tập"}
          </h1>
          <p className={styles.sub}>
            {mode === "set_password"
              ? "Bạn vừa đăng nhập lần đầu bằng Google. Vui lòng tạo mật khẩu cho tài khoản để tăng cường bảo mật và có thể đăng nhập bằng email sau này."
              : mode === "login"
              ? "Tiếp tục các phiên luyện tập phỏng vấn và xem nhận xét chi tiết từ AI."
              : "Khởi tạo tài khoản chỉ trong 1 phút và bắt đầu phiên phỏng vấn thông minh."}
          </p>

          {mode !== "set_password" && (
            <div className={styles.segmented} role="tablist" aria-label="Lựa chọn đăng nhập hoặc tạo tài khoản">
            <span className={styles.segmentThumb} aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? styles.segmentActive : undefined}
              onClick={() => switchMode("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? styles.segmentActive : undefined}
              onClick={() => switchMode("register")}
            >
              Đăng ký
            </button>
          </div>
          )}

          <div className={styles.formStack}>
            {mode === "set_password" ? (
              <form
                key="set-password-form"
                className={styles.formPane + " " + styles.paneLogin}
                onSubmit={handleSetInitialPasswordSubmit}
                noValidate
              >
                <label className={styles.field}>
                  <span>Mật khẩu mới (tối thiểu 8 ký tự)</span>
                  <span className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập ít nhất 8 ký tự"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>

                <label className={styles.field}>
                  <span>Xác nhận mật khẩu mới</span>
                  <span className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirm_password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </span>
                </label>

                {error && <p className={styles.error} role="alert">{error}</p>}
                {(done || successMsg) && (
                  <p className={styles.success} role="status">
                    <Check size={15} /> {successMsg}
                  </p>
                )}

                <button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? (
                    <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                  ) : (
                    <>Lưu mật khẩu &amp; Tiếp tục <ArrowRight size={18} aria-hidden="true" /></>
                  )}
                </button>
              </form>
            ) : mode === "login" ? (
              <form
                key="login-form"
                className={styles.formPane + " " + styles.paneLogin}
                onSubmit={handleSubmit}
                noValidate
              >
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Mật khẩu</span>
                  <span className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
                <div className={styles.formRow}>
                  <label className={styles.remember}>
                    <input type="checkbox" name="remember" defaultChecked />
                    Ghi nhớ đăng nhập
                  </label>
                  <Link href="/forgot-password" className={styles.forgot}>
                    Quên mật khẩu?
                  </Link>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}
                {(done || successMsg) && (
                  <p className={styles.success} role="status">
                    <Check size={15} /> {successMsg || "Đăng nhập thành công!"}
                  </p>
                )}

                <button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? (
                    <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                  ) : (
                    <>Đăng nhập <ArrowRight size={18} aria-hidden="true" /></>
                  )}
                </button>
              </form>
            ) : (
              <form
                key="register-form"
                className={styles.formPane + " " + styles.paneRegister}
                onSubmit={handleSubmit}
                noValidate
              >
                <label className={styles.field}>
                  <span>Họ và tên</span>
                  <input
                    type="text"
                    name="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <div className={styles.twoCol}>
                  <label className={styles.field}>
                    <span>Mật khẩu (tối thiểu 8 ký tự)</span>
                    <span className={styles.passwordWrap}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </span>
                  </label>
                  <label className={styles.field}>
                    <span>Xác nhận mật khẩu</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      required
                    />
                  </label>
                </div>

                {/* Optional OTP Verification Section */}
                <div className={styles.otpSection}>
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold">Mã OTP xác thực email (Tùy chọn)</span>
                    {otpVerified ? (
                      <span className={styles.otpSuccessBadge}>
                        <ShieldCheck size={14} /> Đã xác thực OTP
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-[#8b4513] hover:underline font-medium"
                        onClick={handleSendOtp}
                        disabled={otpLoading || otpCountdown > 0}
                      >
                        {otpLoading ? "Đang gửi..." : otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : "Gửi mã OTP qua email"}
                      </button>
                    )}
                  </div>

                  {showOtpField && !otpVerified && (
                    <div className={styles.otpRow}>
                      <input
                        type="text"
                        placeholder="Nhập mã OTP 6 số"
                        maxLength={10}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.otpActionBtn}
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || !otp}
                      >
                        Xác nhận OTP
                      </button>
                    </div>
                  )}
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}
                {(done || successMsg) && (
                  <p className={styles.success} role="status">
                    <Check size={15} /> {successMsg || "Tạo tài khoản thành công!"}
                  </p>
                )}

                <button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? (
                    <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                  ) : (
                    <>Tạo tài khoản <ArrowRight size={18} aria-hidden="true" /></>
                  )}
                </button>
              </form>
            )}
          </div>

          {mode !== "set_password" && (
            <>
              <div className={styles.divider}>
                <span /> hoặc <span />
              </div>

          {/* Official Google Identity Services Button Container */}
          <div className={styles.googleContainer}>
            <div ref={googleBtnRef} />
            {!googleReady && (
              <button
                type="button"
                className={styles.googleButton}
                onClick={handleFallbackGoogleClick}
                disabled={loading}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z" />
                  <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.6 0 10.2 0 12s.5 3.4 1.4 4.9l3.8-2.5z" />
                  <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.4 6.8l3.8 2.9c.9-2.9 3.6-5 6.8-5z" />
                </svg>
                Tiếp tục với Google
              </button>
            )}
          </div>

              <p className={styles.switchLine}>
                {mode === "login" ? (
                  <>Bạn mới biết đến Interviewly? <button type="button" onClick={() => switchMode("register")}>Đăng ký ngay</button></>
                ) : (
                  <>Đã có tài khoản? <button type="button" onClick={() => switchMode("login")}>Đăng nhập</button></>
                )}
              </p>
            </>
          )}
        </div>

        <aside className={styles.showcase} aria-hidden="true">
          <div className={styles.showcaseLogin}>
            <p className={styles.showEyebrow}>Duy trì sự tiến bộ</p>
            <p className={styles.showQuote}>“Luyện tập có chủ đích. Phản xạ tự tin trước mọi phỏng vấn.”</p>
            <div className={styles.showStats}>
              <div><strong>12.8k+</strong><span>phiên luyện tập</span></div>
              <div><strong>94%</strong><span>đỗ phỏng vấn</span></div>
              <div><strong>4.9/5</strong><span>điểm rubric AI</span></div>
            </div>
          </div>
          <div className={styles.showcaseRegister}>
            <p className={styles.showEyebrow}>Phiên phỏng vấn đầu tiên</p>
            <p className={styles.showQuote}>“Cuộc phỏng vấn tiếp theo xứng đáng với sự chuẩn bị tốt nhất.”</p>
            <ol className={styles.showSteps}>
              <li><strong>01</strong> Chọn vai trò và kỹ năng</li>
              <li><strong>02</strong> Trả lời câu hỏi phỏng vấn</li>
              <li><strong>03</strong> Nhận nhận xét điểm số Rubric</li>
            </ol>
          </div>
          <span className={styles.showGlow} />
          <span className={styles.showMark}>{"\u2726"}</span>
        </aside>
      </div>

      {/* POPUP REQUIRING PASSWORD FOR FIRST-TIME GOOGLE LOGIN */}
      {showSetPasswordPopup && (
        <SetPasswordModal
          isOpen={true}
          canClose={false}
          email={email || user?.email || pendingAuthResponse?.userProfile?.email}
          onSuccess={() => {
            setShowSetPasswordPopup(false);
            const isNotOnboarded =
              pendingAuthResponse?.tokenRes?.is_onboarded === false ||
              pendingAuthResponse?.userProfile?.is_onboarded === false ||
              user?.is_onboarded === false;
            if (isNotOnboarded) {
              window.location.href = "/onboarding";
            } else if (user?.role === "admin" || pendingAuthResponse?.userProfile?.role === "admin") {
              window.location.href = "/admin";
            } else {
              window.location.href = "/";
            }
          }}
        />
      )}
    </div>
  );
}