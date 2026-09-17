"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Camera,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { profileApi } from "@/services/profileApi";
import { ApiError } from "@/services/apiClient";
import type {
  ProfileOut,
  ProfileUpdateIn,
  ChangePasswordIn,
  ExperienceLevel,
  PreferredLanguage,
} from "@/types/profile";
import { SimpleUserSelect } from "@/components/user-component/common";
import styles from "./profile.module.css";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces",
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: "intern", label: "Intern", desc: "Thực tập sinh / Đang học" },
  { id: "fresher", label: "Fresher", desc: "Mới tốt nghiệp / Dưới 1 năm" },
  { id: "junior", label: "Junior", desc: "1 - 2 năm kinh nghiệm" },
  { id: "middle", label: "Middle", desc: "2 - 4 năm kinh nghiệm" },
  { id: "senior", label: "Senior", desc: "5+ năm kinh nghiệm" },
  { id: "lead", label: "Lead", desc: "Trưởng nhóm / Quản lý" },
];

const SINE_FACTORS = [0.4, 0.7, 1.0, 0.8, 0.6, 0.9, 1.2, 0.7, 0.5, 0.8, 1.1, 0.9, 0.6, 0.8, 0.5, 0.3];

export default function ProfileClient() {
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser } = useAuth();
  const { locale, t } = useI18n();

  // Dynamic experience options based on locale
  const experienceOptions = useMemo(
    () => [
      { id: "intern" as ExperienceLevel, label: "Intern", desc: locale === "vi" ? "Thực tập sinh / Đang học" : "Internship / Student" },
      { id: "fresher" as ExperienceLevel, label: "Fresher", desc: locale === "vi" ? "Mới tốt nghiệp / Dưới 1 năm" : "Entry Level / <1 year" },
      { id: "junior" as ExperienceLevel, label: "Junior", desc: locale === "vi" ? "1 - 2 năm kinh nghiệm" : "1 - 2 years experience" },
      { id: "middle" as ExperienceLevel, label: "Middle", desc: locale === "vi" ? "2 - 4 năm kinh nghiệm" : "2 - 4 years experience" },
      { id: "senior" as ExperienceLevel, label: "Senior", desc: locale === "vi" ? "5+ năm kinh nghiệm" : "5+ years experience" },
      { id: "lead" as ExperienceLevel, label: "Lead", desc: locale === "vi" ? "Trưởng nhóm / Quản lý" : "Team Lead / Management" },
    ],
    [locale]
  );

  const domainOptions = useMemo(
    () => [
      { id: 1, label: locale === "vi" ? "Kỹ thuật phần mềm (Software Engineering)" : "Software Engineering" },
      { id: 2, label: locale === "vi" ? "Dữ liệu & AI (Data & AI)" : "Data & Artificial Intelligence" },
      { id: 3, label: locale === "vi" ? "Sản phẩm & UI/UX (Product & Design)" : "Product & UI/UX Design" },
      { id: 4, label: locale === "vi" ? "Tiếp thị & Tăng trưởng (Marketing & Growth)" : "Marketing & Growth" },
    ],
    [locale]
  );

  const domainSelectOptions = useMemo(
    () => [
      { value: "", label: t.profile.careerTab.selectDomainPlaceholder },
      ...domainOptions.map((domain) => ({
        value: String(domain.id),
        label: domain.label,
      })),
    ],
    [domainOptions, t]
  );

  // Profile server data
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Active tab: general | career | security | readiness
  const [activeTab, setActiveTab] = useState<"general" | "career" | "security" | "readiness">("general");

  // General tab form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Career tab form state
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [preferredLang, setPreferredLang] = useState<PreferredLanguage>("vi");
  const [targetDomainId, setTargetDomainId] = useState<number | null>(null);

  // Password tab form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar picker modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Audio / Mic tester
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "error">("idle");
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Fetch profile on initial load
  const loadProfile = useCallback(async () => {
    setIsFetching(true);
    setProfileError(null);
    try {
      const data = await profileApi.getMyProfile();
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
      setExperienceLevel((data.experience_level as ExperienceLevel) || "");
      setPreferredLang((data.preferred_language as PreferredLanguage) || "vi");
      setTargetDomainId(data.target_domain_id || null);
    } catch {
      if (user) {
        setFullName(user.full_name || "");
        setProfile({
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: null,
          role: user.role,
          preferred_language: "vi",
          status: user.status,
          experience_level: null,
          target_domain_id: null,
          target_domain_name: null,
          bio: null,
          avatar_url: null,
          created_at: null,
          updated_at: null,
        });
      }
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      return;
    }
    let isMounted = true;
    profileApi
      .getMyProfile()
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setExperienceLevel((data.experience_level as ExperienceLevel) || "");
        setPreferredLang((data.preferred_language as PreferredLanguage) || "vi");
        setTargetDomainId(data.target_domain_id || null);
        setIsFetching(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (user) {
          setFullName(user.full_name || "");
          setProfile({
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: null,
            role: user.role,
            preferred_language: "vi",
            status: user.status,
            experience_level: null,
            target_domain_id: null,
            target_domain_name: null,
            bio: null,
            avatar_url: null,
            created_at: null,
            updated_at: null,
          });
        }
        setIsFetching(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, user]);

  const openAvatarModal = () => {
    setCustomAvatarInput(avatarUrl || "");
    openAvatarModal();
  };
  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setProfileError(t.profile.generalTab.nameRequired);
      return;
    }

    if (trimmedName.length > 150) {
      setProfileError(t.profile.generalTab.nameMaxLength);
      return;
    }

    if (phone && phone.trim().length > 20) {
      setProfileError(t.profile.generalTab.phoneMaxLength);
      return;
    }

    if (bio && bio.length > 5000) {
      setProfileError(t.profile.generalTab.bioMaxLength);
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: ProfileUpdateIn = {
        full_name: trimmedName,
        phone: phone.trim() ? phone.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        avatar_url: avatarUrl.trim() ? avatarUrl.trim() : null,
        preferred_language: preferredLang,
        experience_level: experienceLevel || null,
        target_domain_id: targetDomainId || null,
      };

      const updated = await profileApi.updateProfile(payload);
      setProfile(updated);
      setProfileSuccess(t.profile.generalTab.successMsg);
      await refreshUser();
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: unknown) {
      let msg = "Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại kết nối.";
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError(t.profile.securityTab.currentRequired);
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError(t.profile.securityTab.newMinLength);
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(t.profile.securityTab.newMustDiffer);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.profile.securityTab.confirmMismatch);
      return;
    }

    setIsChangingPassword(true);
    try {
      const payload: ChangePasswordIn = {
        current_password: currentPassword,
        new_password: newPassword,
      };
      const res = await profileApi.changePassword(payload);
      setPasswordSuccess(res.message || t.profile.securityTab.successMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      let msg = "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const stopMicTest = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicTesting(false);
    setMicStatus("idle");
    setMicVolume(0);
  }, []);

  const startMicTest = async () => {
    stopMicTest();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicTesting(true);
      setMicStatus("listening");

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      setMicStatus("error");
      setIsMicTesting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, [stopMicTest]);

  const formattedCreatedAt = useMemo(() => {
    if (!profile?.created_at) return "Thành viên Interviewly";
    try {
      const d = new Date(profile.created_at);
      return `${t.common.joined}: ${d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "long", year: "numeric" })}`;
    } catch {
      return "Thành viên Interviewly";
    }
  }, [profile]);

  const initials = useMemo(() => {
    const name = fullName || user?.full_name || "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [fullName, user]);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className={styles.shell}>
        <div className={styles.eyebrow}>{t.profile.eyebrow}</div>
        <h1 className={styles.title}>{t.profile.title}</h1>
        <p className={styles.sub}>{t.profile.notLoggedInDesc}</p>

        <div className={styles.guestBanner}>
          <div className={styles.avatar} style={{ width: 80, height: 80, fontSize: 26 }}>
            ?
          </div>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>
              {t.profile.notLoggedInTitle}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
              {t.profile.notLoggedInDesc}
            </p>
          </div>
          <Link href="/login" className={styles.primaryBtn} style={{ marginTop: 8 }}>
            {t.profile.loginNow}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.shell}>
      <div className={styles.eyebrow}>Hồ sơ cá nhân & Cài đặt</div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Hồ sơ ứng viên</h1>
          <p className={styles.sub}>
            Tùy chỉnh thông tin chuyên môn, định hướng nghề nghiệp, mức độ kinh nghiệm và kiểm tra thiết bị phỏng vấn.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProfile}
          disabled={isFetching}
          className={styles.secondaryBtn}
          title="Làm mới dữ liệu từ máy chủ"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroMain}>
          <div className={styles.avatarWrapper}>
            {avatarUrl && !avatarLoadError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={fullName || "Avatar"}
                className={styles.avatar}
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <div className={styles.avatar}>{initials}</div>
            )}
            <button
              type="button"
              className={styles.avatarChangeBtn}
              onClick={() => openAvatarModal()}
              title="Đổi ảnh đại diện"
              aria-label="Đổi ảnh đại diện"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroName}>
              {fullName || user?.full_name || "Ứng viên"}
              <span className={styles.pillBadgeAccent}>
                <Sparkles size={12} />
                {profile?.role === "admin" ? t.header.adminBadge : t.header.candidatePro}
              </span>
            </div>

            <div className={styles.heroEmail}>
              <Mail size={13} />
              {profile?.email || user?.email || "Chưa cập nhật email"}
              <CheckCircle2 size={13} className="text-green-600" />
            </div>

            <div className={styles.badgeRow}>
              <span className={styles.pillBadge}>
                <Globe size={11} />
                {preferredLang === "vi" ? t.common.vietnamese : t.common.english}
              </span>
              {experienceLevel && (
                <span className={styles.pillBadge}>
                  <Briefcase size={11} />
                  {experienceOptions.find((o) => o.id === experienceLevel)?.label || experienceLevel}
                </span>
              )}
              {profile?.target_domain_name && (
                <span className={styles.pillBadge}>
                  {profile.target_domain_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.heroMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t.common.status}</span>
            <span className={styles.metaValue} style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: 5 }}>
              <span className={styles.statusDotLive} style={{ width: 7, height: 7 }} />
              {profile?.status === "active" ? t.profile.accountActive : t.profile.accountVerified}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t.common.joined}</span>
            <span className={styles.metaValue}>
              <Calendar size={12} style={{ display: "inline", marginRight: 4 }} />
              {formattedCreatedAt}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t.common.id}</span>
            <span className={styles.metaValue}>ID #{profile?.user_id || user?.user_id || "1"}</span>
          </div>
        </div>
      </div>

      <div className={styles.tabNav} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "general"}
          onClick={() => setActiveTab("general")}
          className={`${styles.tabBtn} ${activeTab === "general" ? styles.tabBtnActive : ""}`}
        >
          <User size={15} />
          {t.profile.tabs.general}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "career"}
          onClick={() => setActiveTab("career")}
          className={`${styles.tabBtn} ${activeTab === "career" ? styles.tabBtnActive : ""}`}
        >
          <Briefcase size={15} />
          {t.profile.tabs.career}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          className={`${styles.tabBtn} ${activeTab === "security" ? styles.tabBtnActive : ""}`}
        >
          <Lock size={15} />
          {t.profile.tabs.security}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "readiness"}
          onClick={() => setActiveTab("readiness")}
          className={`${styles.tabBtn} ${activeTab === "readiness" ? styles.tabBtnActive : ""}`}
        >
          <Mic size={15} />
          {t.profile.tabs.readiness}
        </button>
      </div>

      {activeTab === "general" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <User size={18} />
              {t.profile.generalTab.title}
            </h2>
            <p className={styles.cardHint}>{t.profile.generalTab.hint}
            </p>
          </div>

          {profileSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={16} />
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="full_name">
                  <span>{t.profile.generalTab.fullNameLabel}</span>
                  <span className={styles.charCount}>{fullName.length}/150</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  className={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  maxLength={150}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">
                  <span>{t.profile.generalTab.emailLabel}</span>
                  <span className={styles.charCount}>{t.profile.generalTab.emailVerified}</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={profile?.email || user?.email || ""}
                  disabled
                  readOnly
                  title="Email dùng để đăng nhập và không thể tự chỉnh sửa"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="phone">
                  <span>{t.profile.generalTab.phoneLabel}</span>
                  <span className={styles.charCount}>{phone.length}/20</span>
                </label>
                <div className={styles.inputWithIcon}>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    maxLength={20}
                  />
                  <span className={styles.inputIconRight} style={{ pointerEvents: "none" }}>
                    <Phone size={14} />
                  </span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="avatar_url">
                  <span>{t.profile.generalTab.avatarUrlLabel}</span>
                  <span
                    className={styles.charCount}
                    style={{ cursor: "pointer", color: "var(--accent-deep)", textDecoration: "underline" }}
                    onClick={() => openAvatarModal()}
                  >
                    {t.profile.generalTab.choosePresetAvatar}
                  </span>
                </label>
                <div className={styles.inputWithIcon}>
                  <input
                    id="avatar_url"
                    type="url"
                    className={styles.input}
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarLoadError(false);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    maxLength={500}
                  />
                  <span className={styles.inputIconRight} style={{ pointerEvents: "none" }}>
                    <Camera size={14} />
                  </span>
                </div>
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel} htmlFor="bio">
                  <span>{t.profile.generalTab.bioLabel}</span>
                  <span className={styles.charCount}>{bio.length}/5000</span>
                </label>
                <textarea
                  id="bio"
                  className={styles.textarea}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả tóm tắt kinh nghiệm kỹ thuật, dự án tiêu biểu và kỹ năng thế mạnh của bạn để huấn luyện viên AI định hình phong cách phỏng vấn..."
                  maxLength={5000}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                disabled={isSavingProfile}
                className={styles.primaryBtn}
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {t.profile.generalTab.savingButton}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    {t.profile.generalTab.saveButton}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "career" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Briefcase size={18} />
              Cấp độ & Định hướng phỏng vấn
            </h2>
            <p className={styles.cardHint}>
              AI Coach sử dụng thông tin này để tinh chỉnh ngân hàng câu hỏi, tiêu chí STAR và thang điểm rubric phù hợp với bạn.
            </p>
          </div>

          {profileSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={16} />
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className={styles.fieldFull} style={{ marginBottom: 26 }}>
              <label className={styles.fieldLabel}>
                <span>{t.profile.careerTab.levelLabel}</span>
                <span className={styles.charCount}>{t.profile.careerTab.levelHint}</span>
              </label>
              <div className={styles.chipGrid}>
                {experienceOptions.map((opt) => {
                  const isActive = experienceLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExperienceLevel(opt.id)}
                      className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                    >
                      <span style={{ fontWeight: 800 }}>{opt.label}</span>
                      <span style={{ opacity: 0.7, fontSize: 11 }}>• {opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="preferred_language">
                  <span>{t.profile.careerTab.langLabel}</span>
                  <span className={styles.charCount}>VI / EN</span>
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setPreferredLang("vi")}
                    className={`${styles.chip} ${preferredLang === "vi" ? styles.chipActive : ""}`}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    🇻🇳 {t.common.vietnamese}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredLang("en")}
                    className={`${styles.chip} ${preferredLang === "en" ? styles.chipActive : ""}`}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    🇺🇸 {t.common.english}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="target_domain_id">
                  <span>{t.profile.careerTab.targetDomainLabel}</span>
                </label>
                <SimpleUserSelect
                  id="target_domain_id"
                  value={targetDomainId ? String(targetDomainId) : ""}
                  onChange={(val) => {
                    setTargetDomainId(val ? Number(val) : null);
                  }}
                  options={domainSelectOptions}
                  placeholder={t.profile.careerTab.selectDomainPlaceholder}
                  aria-label={t.profile.careerTab.targetDomainLabel}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "16px 20px",
                borderRadius: 16,
                background: "rgba(217, 130, 54, 0.08)",
                border: "1px solid rgba(217, 130, 54, 0.2)",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--ink)",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <Sparkles size={18} style={{ color: "var(--accent-warm)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>{t.profile.careerTab.aiTipTitle}</strong> {t.profile.careerTab.aiTipDesc}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                disabled={isSavingProfile}
                className={styles.primaryBtn}
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    {t.profile.careerTab.saveButton}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {activeTab === "security" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Lock size={18} />
              {t.profile.securityTab.title}
            </h2>
            <p className={styles.cardHint}>{t.profile.securityTab.hint}
            </p>
          </div>

          {passwordSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} />
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 540 }}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="current_password">
                  <span>{t.profile.securityTab.currentPasswordLabel}</span>
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
                    title={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="new_password">
                  <span>{t.profile.securityTab.newPasswordLabel}</span>
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
                    title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newPassword && (
                  <div className={styles.strengthMeter}>
                    <div className={styles.strengthBars}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={styles.strengthBar}
                          style={{
                            backgroundColor:
                              passwordStrength.score >= level ? passwordStrength.color : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <div className={styles.strengthLabel}>
                      <span>{t.profile.securityTab.passwordStrengthLabel}</span>
                      <span style={{ color: passwordStrength.color, fontWeight: 800 }}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="confirm_password">
                  <span>{t.profile.securityTab.confirmPasswordLabel}</span>
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
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
                {isChangingPassword ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    {t.profile.securityTab.submitButton}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "readiness" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Mic size={18} />
              {t.profile.readinessTab.title}
            </h2>
            <p className={styles.cardHint}>{t.profile.readinessTab.hint}
            </p>
          </div>

          <div className={styles.micBox}>
            <div className={styles.micMeta}>
              <div className={styles.micStatus}>
                <span
                  className={`${styles.statusDot} ${isMicTesting ? styles.statusDotLive : ""}`}
                />
                <span>
                  {micStatus === "listening"
                    ? "{t.profile.readinessTab.micListening}"
                    : micStatus === "error"
                    ? "{t.profile.readinessTab.micError}"
                    : "{t.profile.readinessTab.micIdle}"}
                </span>
              </div>

              {isMicTesting ? (
                <button
                  type="button"
                  onClick={stopMicTest}
                  className={styles.secondaryBtn}
                  style={{ color: "#b91c1c", borderColor: "rgba(239, 68, 68, 0.4)" }}
                >
                  <MicOff size={15} />
                  {t.profile.readinessTab.stopMic}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startMicTest}
                  className={styles.primaryBtn}
                >
                  <Mic size={15} />
                  {t.profile.readinessTab.startMic}
                </button>
              )}
            </div>

            <div className={styles.micVisualizer}>
              {Array.from({ length: 16 }).map((_, index) => {
                const barHeight = isMicTesting
                  ? Math.max(6, Math.min(54, Math.round(micVolume * SINE_FACTORS[index] * 0.55)))
                  : 6;
                return (
                  <span
                    key={index}
                    className={`${styles.micBar} ${isMicTesting && micVolume > 10 ? styles.micActiveBar : ""}`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              })}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(106, 72, 49, 0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  <Volume2 size={16} className="text-amber-700" />
                  {t.profile.readinessTab.tipCardTitle}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {t.profile.readinessTab.tipCardDesc}
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(106, 72, 49, 0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  <Sparkles size={16} className="text-[#d98236]" />
                  {t.profile.readinessTab.readyCardTitle}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {t.profile.readinessTab.readyCardDesc}
                </p>
                <Link
                  href="/practice"
                  className={styles.primaryBtn}
                  style={{ marginTop: 12, display: "inline-flex", fontSize: 11, padding: "8px 18px" }}
                >
                  {t.profile.readinessTab.enterRoomBtn}
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAvatarModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className={styles.modalTitle}>{t.profile.avatarModal.title}</h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink)" }}
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>
                {t.profile.avatarModal.presetsLabel}
              </p>
              <div className={styles.avatarPresets}>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setAvatarLoadError(false);
                      setIsAvatarModalOpen(false);
                    }}
                    className={`${styles.avatarPresetBtn} ${avatarUrl === url ? styles.avatarPresetBtnActive : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Preset ${idx + 1}`} className={styles.presetImg} />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: 6 }}>
              <label className={styles.fieldLabel} htmlFor="custom_avatar_input">
                {t.profile.avatarModal.customUrlLabel}
              </label>
              <input
                id="custom_avatar_input"
                type="url"
                className={styles.input}
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl("");
                  setAvatarLoadError(false);
                  setIsAvatarModalOpen(false);
                }}
                className={styles.secondaryBtn}
                style={{ fontSize: 11, padding: "8px 16px" }}
              >
                {t.profile.avatarModal.removeAvatar}
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className={styles.secondaryBtn}
                  style={{ fontSize: 11, padding: "8px 16px" }}
                >
                  {t.profile.avatarModal.closeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl(customAvatarInput.trim());
                    setAvatarLoadError(false);
                    setIsAvatarModalOpen(false);
                  }}
                  className={styles.primaryBtn}
                  style={{ fontSize: 11, padding: "8px 18px" }}
                >
                  {t.profile.avatarModal.applyBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
