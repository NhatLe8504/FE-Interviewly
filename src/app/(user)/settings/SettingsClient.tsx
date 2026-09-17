"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Sun,
  Moon,
  Globe,
  Mic,
  Volume2,
  Bell,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { profileApi } from "@/services/profileApi";
import { ApiError } from "@/services/apiClient";
import type { ChangePasswordIn } from "@/types/profile";
import styles from "./settings.module.css";

type TabKey = "general" | "interview" | "notifications" | "security";

export default function SettingsClient() {
  const { user, isAuthenticated, logout } = useAuth();
  const { locale: lang, setLocale, t } = useI18n();

  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Preferences state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("interviewly_theme") as "light" | "dark") || "light";
  });

  // Interview preferences state
  const [defaultMode, setDefaultMode] = useState<"text" | "voice">(() => {
    if (typeof window === "undefined") return "text";
    return (localStorage.getItem("interviewly_pref_mode") as "text" | "voice") || "text";
  });
  const [aiVoiceAutoPlay, setAiVoiceAutoPlay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("interviewly_pref_voice_autoplay") !== "false";
  });
  const [speechRate, setSpeechRate] = useState<"0.8" | "1.0" | "1.2">(() => {
    if (typeof window === "undefined") return "1.0";
    return (localStorage.getItem("interviewly_pref_speech_rate") as "0.8" | "1.0" | "1.2") || "1.0";
  });
  const [showStarGuide, setShowStarGuide] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("interviewly_pref_star_guide") !== "false";
  });
  const [autoAdvanceQuestion, setAutoAdvanceQuestion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("interviewly_pref_auto_advance") === "true";
  });

  // Notification preferences state
  const [emailReport, setEmailReport] = useState(true);
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [newQuestionNotice, setNewQuestionNotice] = useState(false);
  const [productUpdateNotice, setProductUpdateNotice] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback status
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Theme switcher
  const handleThemeChange = (next: "light" | "dark") => {
    setTheme(next);
    localStorage.setItem("interviewly_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    showQuickNotification(next === "dark" ? t.settings.generalSection.themeDarkNotif : t.settings.generalSection.themeLightNotif);
  };

  // Language switcher
  const handleLangChange = (next: "vi" | "en") => {
    setLocale(next);
    showQuickNotification(
      next === "vi" ? t.settings.generalSection.langViNotif : t.settings.generalSection.langEnNotif
    );
  };

  // Interview settings handlers
  const handleModeChange = (next: "text" | "voice") => {
    setDefaultMode(next);
    localStorage.setItem("interviewly_pref_mode", next);
    showQuickNotification("Đã lưu chế độ luyện tập mặc định.");
  };

  const handleAiVoiceToggle = () => {
    const next = !aiVoiceAutoPlay;
    setAiVoiceAutoPlay(next);
    localStorage.setItem("interviewly_pref_voice_autoplay", String(next));
    showQuickNotification(
      next ? "Đã bật tự động phát giọng đọc AI." : "Đã tắt tự động phát giọng đọc AI."
    );
  };

  const handleSpeechRateChange = (rate: "0.8" | "1.0" | "1.2") => {
    setSpeechRate(rate);
    localStorage.setItem("interviewly_pref_speech_rate", rate);
    showQuickNotification("Đã cập nhật tốc độ nói của AI Coach.");
  };

  const handleStarGuideToggle = () => {
    const next = !showStarGuide;
    setShowStarGuide(next);
    localStorage.setItem("interviewly_pref_star_guide", String(next));
    showQuickNotification(
      next ? "Đã bật gợi ý cấu trúc STAR." : "Đã ẩn gợi ý cấu trúc STAR."
    );
  };

  const handleAutoAdvanceToggle = () => {
    const next = !autoAdvanceQuestion;
    setAutoAdvanceQuestion(next);
    localStorage.setItem("interviewly_pref_auto_advance", String(next));
    showQuickNotification(
      next ? "Đã bật tự động chuyển câu hỏi." : "Đã tắt tự động chuyển câu hỏi."
    );
  };

  // Notification handlers
  const handleNotificationToggle = (
    key: "report" | "reminder" | "question" | "product"
  ) => {
    if (key === "report") {
      setEmailReport((prev) => !prev);
    } else if (key === "reminder") {
      setWeeklyReminder((prev) => !prev);
    } else if (key === "question") {
      setNewQuestionNotice((prev) => !prev);
    } else if (key === "product") {
      setProductUpdateNotice((prev) => !prev);
    }
    showQuickNotification("Đã lưu tùy chọn thông báo.");
  };

  const showQuickNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Password change handler
  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage(t.profile.securityTab.currentRequired);
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage(t.profile.securityTab.newMinLength);
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage(t.profile.securityTab.newMustDiffer);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.profile.securityTab.confirmMismatch);
      return;
    }

    setIsChangingPassword(true);
    try {
      const payload: ChangePasswordIn = {
        current_password: currentPassword,
        new_password: newPassword,
      };
      const res = await profileApi.changePassword(payload);
      setStatusMessage(res.message || t.profile.securityTab.successMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      let msg = "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, text: "", color: "" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: t.profile.securityTab.strengthWeak, color: "#ef4444" };
      case 2:
        return { score: 2, text: t.profile.securityTab.strengthFair, color: "#f59e0b" };
      case 3:
        return { score: 3, text: t.profile.securityTab.strengthStrong, color: "#10b981" };
      case 4:
        return { score: 4, text: t.profile.securityTab.strengthVeryStrong, color: "#059669" };
      default:
        return { score: 0, text: "", color: "" };
    }
  }, [newPassword]);

  const initials = useMemo(() => {
    const name = user?.full_name || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  return (
    <div className={styles.shell}>
      <div className={styles.eyebrow}>{t.settings.eyebrow}</div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t.settings.title}</h1>
          <p className={styles.sub}>{t.settings.subtitle}</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <CheckCircle2 size={16} />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <div className={styles.settingsLayout}>
        {/* Sidebar Nav */}
        <nav className={styles.sidebarNav} aria-label="Settings navigation">
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "general" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Settings size={16} className={styles.navItemIcon} />
            <span>{t.settings.tabs.general}</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "interview" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("interview")}
          >
            <Mic size={16} className={styles.navItemIcon} />
            <span>{t.settings.tabs.interview}</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "notifications" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={16} className={styles.navItemIcon} />
            <span>{t.settings.tabs.notifications}</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "security" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={16} className={styles.navItemIcon} />
            <span>{t.settings.tabs.security}</span>
          </button>
        </nav>

        {/* Content Pane */}
        <div className={styles.contentPane}>
          {/* TAB 1: CHUNG & GIAO DIỆN */}
          {activeTab === "general" && (
            <>
              {/* Account Quick Card */}
              {isAuthenticated && user && (
                <div className={styles.userBadgeRow}>
                  <div className={styles.userBadgeLeft}>
                    <div className={styles.userBadgeAvatar}>{initials}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" className={styles.secondaryBtn}>
                    <User size={14} />
                    {t.settings.generalSection.userCardEdit}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Sun size={18} />
                    {t.settings.generalSection.themeTitle}
                  </h2>
                  <p className={styles.cardHint}>{t.settings.generalSection.themeDesc}</p>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingRowLeft}>
                    <span className={styles.settingRowTitle}>{t.settings.generalSection.themeTitle}</span>
                    <p className={styles.settingRowDesc}>{t.settings.generalSection.themeDesc}</p>
                  </div>
                  <div className={styles.segmentGroup}>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={`${styles.segmentBtn} ${theme === "light" ? styles.segmentBtnActive : ""}`}
                    >
                      <Sun size={14} />
                      {t.common.lightMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("dark")}
                      className={`${styles.segmentBtn} ${theme === "dark" ? styles.segmentBtnActive : ""}`}
                    >
                      <Moon size={14} />
                      {t.common.darkMode}
                    </button>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingRowLeft}>
                    <span className={styles.settingRowTitle}>{t.settings.generalSection.langTitle}</span>
                    <p className={styles.settingRowDesc}>{t.settings.generalSection.langDesc}</p>
                  </div>
                  <div className={styles.segmentGroup}>
                    <button
                      type="button"
                      onClick={() => handleLangChange("vi")}
                      className={`${styles.segmentBtn} ${lang === "vi" ? styles.segmentBtnActive : ""}`}
                    >
                      <Globe size={14} />
                      {t.common.vietnamese}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLangChange("en")}
                      className={`${styles.segmentBtn} ${lang === "en" ? styles.segmentBtnActive : ""}`}
                    >
                      <Globe size={14} />
                      {t.common.english}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PHÒNG PHỎNG VẤN AI */}
          {activeTab === "interview" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Mic size={18} />
                  {t.settings.interviewSection.title}
                </h2>
                <p className={styles.cardHint}>{t.settings.interviewSection.hint}</p>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.interviewSection.defaultModeTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.interviewSection.defaultModeDesc}</p>
                </div>
                <div className={styles.segmentGroup}>
                  <button
                    type="button"
                    onClick={() => handleModeChange("text")}
                    className={`${styles.segmentBtn} ${defaultMode === "text" ? styles.segmentBtnActive : ""}`}
                  >
                    {t.common.textMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("voice")}
                    className={`${styles.segmentBtn} ${defaultMode === "voice" ? styles.segmentBtnActive : ""}`}
                  >
                    {t.common.voiceMode}
                  </button>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.interviewSection.autoPlayTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.interviewSection.autoPlayDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={aiVoiceAutoPlay}
                    onChange={handleAiVoiceToggle}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.interviewSection.speechRateTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.interviewSection.speechRateDesc}</p>
                </div>
                <div className={styles.segmentGroup}>
                  <button
                    type="button"
                    onClick={() => handleSpeechRateChange("0.8")}
                    className={`${styles.segmentBtn} ${speechRate === "0.8" ? styles.segmentBtnActive : ""}`}
                  >
                    {t.settings.interviewSection.rateSlow}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeechRateChange("1.0")}
                    className={`${styles.segmentBtn} ${speechRate === "1.0" ? styles.segmentBtnActive : ""}`}
                  >
                    {t.settings.interviewSection.rateNormal}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeechRateChange("1.2")}
                    className={`${styles.segmentBtn} ${speechRate === "1.2" ? styles.segmentBtnActive : ""}`}
                  >
                    {t.settings.interviewSection.rateFast}
                  </button>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.interviewSection.starGuideTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.interviewSection.starGuideDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={showStarGuide}
                    onChange={handleStarGuideToggle}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.interviewSection.autoAdvanceTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.interviewSection.autoAdvanceDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={autoAdvanceQuestion}
                    onChange={handleAutoAdvanceToggle}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.infoBox} style={{ marginTop: 10 }}>
                <Sparkles size={18} style={{ color: "var(--accent-warm)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  {t.settings.interviewSection.micCheckTip} <Link href="/profile" style={{ textDecoration: "underline", fontWeight: 700 }}>{t.settings.interviewSection.micCheckLink}</Link>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG BÁO & BÁO CÁO */}
          {activeTab === "notifications" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Bell size={18} />
                  {t.settings.notificationSection.title}
                </h2>
                <p className={styles.cardHint}>{t.settings.notificationSection.hint}</p>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.notificationSection.reportTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.notificationSection.reportDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={emailReport}
                    onChange={() => handleNotificationToggle("report")}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.notificationSection.reminderTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.notificationSection.reminderDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={weeklyReminder}
                    onChange={() => handleNotificationToggle("reminder")}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.notificationSection.newQuestionTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.notificationSection.newQuestionDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={newQuestionNotice}
                    onChange={() => handleNotificationToggle("question")}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingRowLeft}>
                  <span className={styles.settingRowTitle}>{t.settings.notificationSection.productUpdateTitle}</span>
                  <p className={styles.settingRowDesc}>{t.settings.notificationSection.productUpdateDesc}</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={productUpdateNotice}
                    onChange={() => handleNotificationToggle("product")}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: MẬT KHẨU & BẢO MẬT */}
          {activeTab === "security" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Lock size={18} />
                  {t.settings.securitySection.title}
                </h2>
                <p className={styles.cardHint}>{t.settings.securitySection.hint}</p>
              </div>

              <form onSubmit={handleChangePassword}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 540 }}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="current_password">
                      <span>{t.settings.securitySection.currentPasswordLabel}</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        className={styles.input}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className={styles.inputIconRight}
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        title={showCurrentPassword ? "Ẩn" : "Hiện"}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="new_password">
                      <span>{t.settings.securitySection.newPasswordLabel}</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        className={styles.input}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập ít nhất 8 ký tự"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className={styles.inputIconRight}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        title={showNewPassword ? "Ẩn" : "Hiện"}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {newPassword && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, fontSize: 12 }}>
                        <span style={{ color: "var(--ink-soft)" }}>{t.settings.securitySection.passwordStrength}</span>
                        <span style={{ color: passwordStrength.color, fontWeight: 800 }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="confirm_password">
                      <span>{t.settings.securitySection.confirmPasswordLabel}</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className={styles.inputIconRight}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        title={showConfirmPassword ? "Ẩn" : "Hiện"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={styles.primaryBtn}
                  >
                    <Shield size={14} />
                    {isChangingPassword ? "Đang cập nhật..." : "{t.settings.securitySection.savePasswordBtn}"}
                  </button>
                </div>
              </form>

              {isAuthenticated && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                        {t.settings.securitySection.logoutTitle}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                        {t.settings.securitySection.logoutDesc}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className={styles.dangerBtn}
                    >
                      <LogOut size={14} />
                      {t.settings.securitySection.logoutBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
