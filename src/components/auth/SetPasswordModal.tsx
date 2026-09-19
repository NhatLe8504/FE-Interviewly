"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, X, Loader2, ArrowRight, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/user-component/toast";
import styles from "./SetPasswordModal.module.css";

export interface SetPasswordModalProps {
  isOpen: boolean;
  canClose?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  email?: string;
  title?: string;
  description?: string;
}

export function SetPasswordModal({
  isOpen,
  canClose = false,
  onClose,
  onSuccess,
  email,
  title,
  description,
}: SetPasswordModalProps) {
  const router = useRouter();
  const { setInitialPassword, logout, refreshUser, user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLengthValid = password.length >= 8;
  const isMatchValid = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLengthValid) {
      setError("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }
    if (!isMatchValid) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await setInitialPassword(password);
      toast.success(
        "Thiết lập mật khẩu thành công!",
        "Mật khẩu bảo mật đã được kích hoạt cho tài khoản của bạn."
      );
      await refreshUser();
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.data?.detail ||
        err?.message ||
        "Không thể thiết lập mật khẩu. Vui lòng thử lại sau.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-pwd-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {canClose && onClose && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        )}

        <div className={styles.iconBadge}>
          <Lock size={24} />
        </div>

        <div className={styles.tag}>Bảo mật tài khoản Google</div>
        <h2 id="set-pwd-title" className={styles.title}>
          {title || "Thiết lập mật khẩu bảo vệ"}
        </h2>
        <p className={styles.desc}>
          {description ||
            `Tài khoản ${email || user?.email ? `(${email || user?.email}) ` : ""}chưa có mật khẩu vì đăng nhập qua Google lần đầu. Vui lòng tạo mật khẩu để bảo vệ tài khoản trước khi vào chế độ Onboarding.`}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="modal-new-pwd">
              Mật khẩu mới
            </label>
            <div className={styles.inputWrap}>
              <input
                id="modal-new-pwd"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="modal-confirm-pwd">
              Xác nhận mật khẩu mới
            </label>
            <div className={styles.inputWrap}>
              <input
                id="modal-confirm-pwd"
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Realtime checklist */}
          <div className={styles.checklist}>
            <div
              className={`${styles.checkItem} ${
                isLengthValid ? styles.checkItemValid : ""
              }`}
            >
              <Check size={13} strokeWidth={isLengthValid ? 3 : 2} />
              <span>Độ dài tối thiểu 8 ký tự</span>
            </div>
            <div
              className={`${styles.checkItem} ${
                isMatchValid ? styles.checkItemValid : ""
              }`}
            >
              <Check size={13} strokeWidth={isMatchValid ? 3 : 2} />
              <span>Mật khẩu xác nhận trùng khớp</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !isLengthValid || !isMatchValid}
          >
            {loading ? (
              <Loader2 size={18} className={styles.spin} />
            ) : (
              <>
                <span>Xác nhận &amp; Bắt đầu Onboarding</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Đăng xuất khỏi tài khoản này"
        >
          <LogOut size={13} />
          <span>Đăng xuất / Sử dụng tài khoản khác</span>
        </button>
      </div>
    </div>
  );
}

export default SetPasswordModal;