"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Code,
  Megaphone,
  Landmark,
  TrendingUp,
  Palette,
  Users,
  GraduationCap,
  Sparkles,
  Briefcase,
  Target,
  Award,
  Zap,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { toast } from "@/components/user-component/toast";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/services/apiClient";
import {
  FacebookLogo,
  TikTokLogo,
  YouTubeLogo,
  OpenAiLogo,
  GoogleLogo,
  ReferralLogo,
  OtherChannelLogo,
} from "@/components/admin/onboarding/BrandLogos";
import {
  ONBOARDING_DOMAINS,
  COMPREHENSIVE_ROLES,
} from "./onboardingData";
import styles from "./onboarding.module.css";
import { SetPasswordModal } from "@/components/auth/SetPasswordModal";

type StepIndex = 1 | 2 | 3 | 4 | 5 | 6;

export function UserOnboardingClient() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { user, updateUserLocal, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepIndex>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<"vi" | "en">(
    locale === "en" ? "en" : "vi"
  );
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("it");
  const [currentJobTitle, setCurrentJobTitle] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetLevel, setTargetLevel] = useState<string>("junior");
  const [targetGoal, setTargetGoal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isVi = selectedLanguage === "vi";

  const handleSelectLanguage = (lang: "vi" | "en") => {
    setSelectedLanguage(lang);
    setLocale(lang);
  };

  // Auto-redirect to home on Step 6 (Success) with top-level navigation
  useEffect(() => {
    if (currentStep === 6) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleCopy = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleResetOnboardingDebug = async () => {
    try {
      toast.info("Đang đặt lại trạng thái Onboarding...", "Vui lòng chờ trong giây lát");
      await request("/api/v1/onboarding/reset", { method: "POST" });
      updateUserLocal({ is_onboarded: false });
      await refreshUser();
      toast.success("Đã reset về Chưa Onboard!", "Bắt đầu lại luồng khảo sát từ bước 1.");
      setCurrentStep(1);
    } catch (err) {
      updateUserLocal({ is_onboarded: false });
      setCurrentStep(1);
    }
  };

  const channels = useMemo(
    () => [
      {
        id: "facebook",
        title: "Facebook",
        desc: isVi ? "Quảng cáo, Fanpage & các hội nhóm nghề nghiệp" : "Ads, Fanpage & career groups",
        icon: <FacebookLogo className="size-5" />,
      },
      {
        id: "tiktok",
        title: "TikTok",
        desc: isVi ? "Video ngắn, review AI từ Tech Creators" : "Short clips, tech creator reviews",
        icon: <TikTokLogo className="size-5" />,
      },
      {
        id: "youtube",
        title: "YouTube",
        desc: isVi ? "Video hướng dẫn phỏng vấn & review AI Coach" : "Tutorials & AI Coach reviews",
        icon: <YouTubeLogo className="size-5" />,
      },
      {
        id: "ai",
        title: isVi ? "Gợi ý từ AI" : "AI Recommendations",
        desc: isVi ? "Được ChatGPT, Claude, Perplexity giới thiệu" : "Recommended by ChatGPT, Claude",
        icon: <OpenAiLogo className="size-5" />,
      },
      {
        id: "google",
        title: "Google Search",
        desc: isVi ? "Tìm kiếm Google tự nhiên (SEO & bài viết)" : "Organic Google search & articles",
        icon: <GoogleLogo className="size-5" />,
      },
      {
        id: "referral",
        title: isVi ? "Bạn bè & Đồng nghiệp" : "Friend / Colleague",
        desc: isVi ? "Được người quen hoặc cộng đồng giới thiệu" : "Word of mouth & community",
        icon: <ReferralLogo className="size-5" />,
      },
    ],
    [isVi]
  );

  const availableRoles = useMemo(() => {
    return COMPREHENSIVE_ROLES.filter((r) => r.domainId === selectedDomain);
  }, [selectedDomain]);

  const levels = useMemo(
    () => [
      { key: "intern", label: isVi ? "Thực tập sinh (Intern)" : "Intern" },
      { key: "fresher", label: isVi ? "Fresher / Mới ra trường" : "Fresher" },
      { key: "junior", label: isVi ? "Junior (1 - 2 năm)" : "Junior" },
      { key: "middle", label: isVi ? "Middle (3 - 4 năm)" : "Middle" },
      { key: "senior", label: isVi ? "Senior / Tech Lead (5+ năm)" : "Senior / Lead" },
    ],
    [isVi]
  );

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedChannel) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDomain) return;
      const defaultRole = availableRoles[0];
      if (defaultRole && !currentJobTitle) {
        setCurrentJobTitle(isVi ? defaultRole.titleVi : defaultRole.titleEn);
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!currentJobTitle.trim()) return;
      if (!targetRole) setTargetRole(currentJobTitle);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!targetRole.trim() || isSubmitting) return;
      setIsSubmitting(true);
      try {
        const domainObj = ONBOARDING_DOMAINS.find((d) => d.id === selectedDomain);
        await request("/api/v1/onboarding", {
          method: "POST",
          body: JSON.stringify({
            preferred_language: selectedLanguage,
            acquisition_channel: selectedChannel || "other",
            current_domain: domainObj ? domainObj.nameVi : selectedDomain,
            current_role: currentJobTitle,
            target_role: targetRole,
            target_level: targetLevel,
            target_goal: targetGoal || (isVi ? "Chuẩn bị phỏng vấn tuyển dụng" : "Preparing for upcoming interviews"),
          }),
        });
        updateUserLocal({ is_onboarded: true });
        await refreshUser();
      } catch (err) {
        updateUserLocal({ is_onboarded: true });
        console.warn("Onboarding persist fallback:", err);
      } finally {
        setIsSubmitting(false);
        setCurrentStep(6);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepIndex);
    }
  };

  const getDomainIcon = (iconType: string, color: string) => {
    switch (iconType) {
      case "code": return <Code size={18} style={{ color }} />;
      case "megaphone": return <Megaphone size={18} style={{ color }} />;
      case "landmark": return <Landmark size={18} style={{ color }} />;
      case "trending-up": return <TrendingUp size={18} style={{ color }} />;
      case "palette": return <Palette size={18} style={{ color }} />;
      case "users": return <Users size={18} style={{ color }} />;
      case "graduation-cap": return <GraduationCap size={18} style={{ color }} />;
      default: return <Globe size={18} style={{ color }} />;
    }
  };

  return (
    <div
      className={styles.layout}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL: CONCENTRIC ORBITAL RINGS & CONTACT (Untitled UI style) */}
      <aside
        className={styles.sidebar}
        style={{
          width: "360px",
          minWidth: "340px",
          maxWidth: "400px",
          height: "100vh",
          flexShrink: 0,
          background: "#faf9f6",
        }}
      >
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.brandLogo}>
            <span className={styles.brandIcon}>✦</span>
            <span>INTERVIEWLY</span>
          </Link>

          <Link href="/" className={styles.backHomeLink} title="Về trang chủ">
            <ArrowLeft size={14} />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Concentric Orbit Rings Visual */}
        <div className={styles.orbitArea}>
          <div className={styles.orbitRing1} />
          <div className={styles.orbitRing2} />
          <div className={styles.orbitRing3} />
          <div className={styles.orbitRing4} />

          {/* Central AI Node */}
          <div className={styles.centerHub}>
            <Sparkles size={20} color="#ff7a45" />
          </div>

          {/* Floating Avatar Nodes on Orbits */}
          <div className={`${styles.avatarNode} ${styles.node1}`} title="Tech Lead Coach">
            <span className={styles.nodeInitials}>NL</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node2}`} title="Senior AI Mentor">
            <span className={styles.nodeInitials} style={{ color: "#ec4899", background: "#fdf2f8" }}>TH</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node3}`} title="AI Interview Director">
            <span className={styles.nodeInitials} style={{ color: "#d98236", background: "#fff7ed", fontSize: "13px" }}>AI</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node4}`} title="Product Lead">
            <span className={styles.nodeInitials} style={{ color: "#8b5cf6", background: "#f5f3ff" }}>HB</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node5}`} title="HR Director">
            <span className={styles.nodeInitials} style={{ color: "#10b981", background: "#ecfdf5" }}>MN</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node6}`} title="Engineering Manager">
            <span className={styles.nodeInitials} style={{ color: "#3b82f6", background: "#eff6ff" }}>DK</span>
          </div>
          <div className={`${styles.avatarNode} ${styles.node7}`} title="Career Coach">
            <span className={styles.nodeInitials} style={{ color: "#f59e0b", background: "#fefce8" }}>VU</span>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className={styles.sidebarFooter}>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>General</span>
            <button
              type="button"
              className={styles.contactValue}
              onClick={() => handleCopy("general", "hello@interviewly.ai")}
              title="Click to copy"
            >
              <span>hello@interviewly.ai</span>
              {copiedKey === "general" ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
          </div>

          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Support</span>
            <button
              type="button"
              className={styles.contactValue}
              onClick={() => handleCopy("support", "support@interviewly.ai")}
              title="Click to copy"
            >
              <span>support@interviewly.ai</span>
              {copiedKey === "support" ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
          </div>

          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Hotline</span>
            <button
              type="button"
              className={styles.contactValue}
              onClick={() => handleCopy("hotline", "1900 6868")}
              title="Click to copy"
            >
              <span>1900 6868 (8:00 - 21:00)</span>
              {copiedKey === "hotline" ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
          </div>

          <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed rgba(106, 72, 49, 0.15)" }}>
            <button
              type="button"
              onClick={handleResetOnboardingDebug}
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                color: "#b35919",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 0",
                opacity: 0.6,
                fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              title="Đặt lại trạng thái về Chưa Onboard để test lại luồng khảo sát"
            >
              <RotateCcw size={11} />
              <span>Reset Chưa Onboard (Debug)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CANVAS */}
      <main
        className={styles.mainCanvas}
        style={{
          flex: "1 1 0%",
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 32px 64px",
        }}
      >
        <div className={styles.canvasInner} style={{ width: "100%", maxWidth: "660px", margin: "0 auto" }}>
          {/* STEP 1: LANGUAGE SELECTION (BILINGUAL) */}
          {currentStep === 1 && (
            <div>
              <div className={styles.topIconBadge}>
                <Globe size={22} />
              </div>

              <h1 className={styles.heading}>
                Chọn ngôn ngữ / Choose language
              </h1>
              <p className={styles.subheading}>
                Ngôn ngữ bạn muốn sử dụng cho giao diện và các buổi phỏng vấn AI.
                <span className={styles.bilingualSubEn}>
                  Select your preferred language for the interface and AI practice sessions.
                </span>
              </p>

              <div className={styles.cardsGrid}>
                <div
                  className={`${styles.cardItem} ${
                    selectedLanguage === "vi" ? styles.cardItemSelected : ""
                  }`}
                  onClick={() => handleSelectLanguage("vi")}
                >
                  <div className={styles.cardIconBox} style={{ background: "#fef3c7" }}>
                    <span style={{ fontSize: "18px" }}>🇻🇳</span>
                  </div>
                  <h3 className={styles.cardTitle}>Tiếng Việt</h3>
                  <p className={styles.cardDesc}>
                    Giao diện tiếng Việt chuẩn, gợi ý cấu trúc STAR tự nhiên và nhận diện giọng nói mượt mà.
                  </p>
                </div>

                <div
                  className={`${styles.cardItem} ${
                    selectedLanguage === "en" ? styles.cardItemSelected : ""
                  }`}
                  onClick={() => handleSelectLanguage("en")}
                >
                  <div className={styles.cardIconBox} style={{ background: "#e0f2fe" }}>
                    <span style={{ fontSize: "18px" }}>🇺🇸</span>
                  </div>
                  <h3 className={styles.cardTitle}>English</h3>
                  <p className={styles.cardDesc}>
                    Standard international English interview experience with fluency and pacing metrics.
                  </p>
                </div>
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  className={styles.btnContinue}
                  onClick={handleNext}
                >
                  <span>{selectedLanguage === "vi" ? "Tiếp tục" : "Continue"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MARKETING ACQUISITION CHANNELS */}
          {currentStep === 2 && (
            <div>
              <div className={styles.topIconBadge}>
                <Sparkles size={22} />
              </div>

              <h2 className={styles.heading}>
                {isVi ? "Bạn biết đến chúng tôi qua đâu?" : "How did you hear about us?"}
              </h2>
              <p className={styles.subheading}>
                {isVi
                  ? "Chia sẻ nguồn tiếp cận giúp chúng tôi nâng cấp trải nghiệm người dùng tốt hơn."
                  : "Help us understand how you discovered our platform."}
              </p>

              <div className={styles.cardsGrid}>
                {channels.map((chan) => {
                  const isSelected = selectedChannel === chan.id;
                  return (
                    <div
                      key={chan.id}
                      className={`${styles.cardItem} ${
                        isSelected ? styles.cardItemSelected : ""
                      }`}
                      onClick={() => setSelectedChannel(chan.id)}
                    >
                      <div className={styles.cardIconBox} style={{ background: "#f3f4f6" }}>
                        {chan.icon}
                      </div>
                      <h4 className={styles.cardTitle}>{chan.title}</h4>
                      <p className={styles.cardDesc}>{chan.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  className={styles.btnBack}
                  onClick={handleBack}
                >
                  <ArrowLeft size={14} />
                  <span>{isVi ? "Quay lại" : "Go back"}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnContinue}
                  onClick={handleNext}
                  disabled={!selectedChannel}
                >
                  <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CURRENT JOB DOMAIN */}
          {currentStep === 3 && (
            <div>
              <div className={styles.topIconBadge}>
                <Briefcase size={22} />
              </div>

              <h2 className={styles.heading}>
                {isVi ? "Ngành nghề hiện tại của bạn?" : "What is your current industry?"}
              </h2>
              <p className={styles.subheading}>
                {isVi
                  ? "Chọn lĩnh vực chuyên môn để AI nạp bộ ngân hàng câu hỏi chuyên sâu sát thực tế nhất."
                  : "Pick your industry so our AI can curate relevant interview scenarios."}
              </p>

              <div className={styles.cardsGrid}>
                {ONBOARDING_DOMAINS.map((dom) => {
                  const isSelected = selectedDomain === dom.id;
                  return (
                    <div
                      key={dom.id}
                      className={`${styles.cardItem} ${
                        isSelected ? styles.cardItemSelected : ""
                      }`}
                      onClick={() => setSelectedDomain(dom.id)}
                    >
                      <div className={styles.cardIconBox} style={{ background: `${dom.color}15` }}>
                        {getDomainIcon(dom.iconType, dom.color)}
                      </div>
                      <h4 className={styles.cardTitle}>{isVi ? dom.nameVi : dom.nameEn}</h4>
                      <p className={styles.cardDesc}>{isVi ? dom.descVi : dom.descEn}</p>
                    </div>
                  );
                })}
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  className={styles.btnBack}
                  onClick={handleBack}
                >
                  <ArrowLeft size={14} />
                  <span>{isVi ? "Quay lại" : "Go back"}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnContinue}
                  onClick={handleNext}
                  disabled={!selectedDomain}
                >
                  <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CURRENT ROLE (COMPREHENSIVE ROLES) */}
          {currentStep === 4 && (
            <div>
              <div className={styles.topIconBadge}>
                <Award size={22} />
              </div>

              <h2 className={styles.heading}>
                {isVi ? "Chức danh hiện tại của bạn?" : "What is your current role?"}
              </h2>
              <p className={styles.subheading}>
                {isVi
                  ? "Chọn chức danh gần nhất hoặc tự nhập chức danh của bạn bên dưới."
                  : "Select your closest job title or enter a custom one."}
              </p>

              <div className={styles.cardsGrid}>
                {availableRoles.map((role) => {
                  const isSelected =
                    currentJobTitle.toLowerCase() === (isVi ? role.titleVi : role.titleEn).toLowerCase();
                  return (
                    <div
                      key={role.id}
                      className={`${styles.cardItem} ${
                        isSelected ? styles.cardItemSelected : ""
                      }`}
                      onClick={() => setCurrentJobTitle(isVi ? role.titleVi : role.titleEn)}
                    >
                      <div className={styles.cardIconBox} style={{ background: "#f3f4f6" }}>
                        <Briefcase size={16} color="#4b5563" />
                      </div>
                      <h4 className={styles.cardTitle}>{isVi ? role.titleVi : role.titleEn}</h4>
                      <p className={styles.cardDesc}>{isVi ? role.descVi : role.descEn}</p>
                    </div>
                  );
                })}
              </div>

              <div className={styles.customInputBox}>
                <input
                  type="text"
                  className={styles.customInput}
                  value={currentJobTitle}
                  onChange={(e) => setCurrentJobTitle(e.target.value)}
                  placeholder={isVi ? "Hoặc tự nhập chức danh của bạn (ví dụ: Team Lead, Senior Developer...)" : "Or enter your custom role..."}
                />
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  className={styles.btnBack}
                  onClick={handleBack}
                >
                  <ArrowLeft size={14} />
                  <span>{isVi ? "Quay lại" : "Go back"}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnContinue}
                  onClick={handleNext}
                  disabled={!currentJobTitle.trim()}
                >
                  <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TARGET ROLE & SENIORITY */}
          {currentStep === 5 && (
            <div>
              <div className={styles.topIconBadge}>
                <Target size={22} />
              </div>

              <h2 className={styles.heading}>
                {isVi ? "Vị trí bạn muốn theo đuổi & Cấp bậc?" : "Target role & seniority level?"}
              </h2>
              <p className={styles.subheading}>
                {isVi
                  ? "AI sẽ hiệu chỉnh độ khó và phong cách phỏng vấn theo đúng mục tiêu của bạn."
                  : "Our AI will calibrate questions and evaluation to your target position."}
              </p>

              {/* Seniority Level Pill Row */}
              <div className={styles.levelRow}>
                {levels.map((lvl) => {
                  const isSelected = targetLevel === lvl.key;
                  return (
                    <button
                      key={lvl.key}
                      type="button"
                      className={`${styles.levelPill} ${
                        isSelected ? styles.levelPillActive : ""
                      }`}
                      onClick={() => setTargetLevel(lvl.key)}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>

              {/* Target Role Selection Grid */}
              <div className={styles.cardsGrid}>
                {availableRoles.slice(0, 6).map((role) => {
                  const isSelected =
                    targetRole.toLowerCase() === (isVi ? role.titleVi : role.titleEn).toLowerCase();
                  return (
                    <div
                      key={role.id}
                      className={`${styles.cardItem} ${
                        isSelected ? styles.cardItemSelected : ""
                      }`}
                      onClick={() => setTargetRole(isVi ? role.titleVi : role.titleEn)}
                    >
                      <div className={styles.cardIconBox} style={{ background: "#f3f4f6" }}>
                        <Target size={16} color="#d98236" />
                      </div>
                      <h4 className={styles.cardTitle}>{isVi ? role.titleVi : role.titleEn}</h4>
                      <p className={styles.cardDesc}>{isVi ? role.descVi : role.descEn}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Target Role Input */}
              <div className={styles.customInputBox}>
                <input
                  type="text"
                  className={styles.customInput}
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={isVi ? "Nhập vị trí mục tiêu cụ thể (ví dụ: Staff Engineer, Technical Director...)" : "Enter specific target role..."}
                />
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  className={styles.btnBack}
                  onClick={handleBack}
                >
                  <ArrowLeft size={14} />
                  <span>{isVi ? "Quay lại" : "Go back"}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnContinue}
                  onClick={handleNext}
                  disabled={!targetRole.trim() || isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? isVi
                        ? "Đang lưu..."
                        : "Saving..."
                      : isVi
                      ? "Hoàn tất khảo sát"
                      : "Finish Setup"}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS CELEBRATION & AUTO REDIRECT TO HOME */}
          {currentStep === 6 && (
            <div className={styles.successContainer}>
              <div className={styles.successPulseOrb}>
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>

              <h1 className={styles.successTitle}>
                {isVi
                  ? "Cảm ơn bạn đã tìm đến Interviewly!"
                  : "Thank you for choosing Interviewly!"}
              </h1>

              <p className={styles.successDesc}>
                {isVi
                  ? `Tuyệt vời! Lộ trình phỏng vấn hướng tới vị trí ${targetRole} của bạn đã được thiết lập hoàn tất. Hệ thống đang tự động đưa bạn về trang chủ để bắt đầu hành trình chinh phục kỳ phỏng vấn...`
                  : `Awesome! Your personalized career roadmap for ${targetRole} has been calibrated. Redirecting you to the home page...`}
              </p>

              <div className={styles.redirectBarContainer}>
                <div className={styles.redirectBarFill} />
              </div>

              <span className={styles.redirectHint}>
                {isVi ? "Tự động chuyển tiếp về trang chủ trong 2 giây..." : "Redirecting to home in 2 seconds..."}
              </span>
            </div>
          )}
        </div>
      </main>
      {/* FORCE PASSWORD SETUP POPUP FOR FIRST-TIME GOOGLE USERS */}
      {Boolean(user && user.needs_password) && (
        <SetPasswordModal
          isOpen={true}
          canClose={false}
          email={user?.email}
          onSuccess={() => {
            toast.success(
              isVi ? "Thiết lập mật khẩu thành công!" : "Password created successfully!",
              isVi ? "Bắt đầu hoàn tất khảo sát Onboarding." : "Proceeding with onboarding."
            );
          }}
        />
      )}
    </div>
  );
}
