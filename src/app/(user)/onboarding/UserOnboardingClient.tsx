"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
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
  Globe,
  Briefcase,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { useI18n } from "@/context/I18nContext";
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
import styles from "./onboarding.module.css";

type StepIndex = 1 | 2 | 3 | 4 | 5 | 6;

export function UserOnboardingClient() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepIndex>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<"vi" | "en">(
    locale === "en" ? "en" : "vi"
  );
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [currentJobTitle, setCurrentJobTitle] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetLevel, setTargetLevel] = useState<string>("junior");
  const [targetGoal, setTargetGoal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectLanguage = (lang: "vi" | "en") => {
    setSelectedLanguage(lang);
    setLocale(lang);
  };

  const isVi = selectedLanguage === "vi";

  const channels = [
    {
      id: "facebook",
      name: "Facebook",
      desc: isVi ? "Quảng cáo, Fanpage, Hội nhóm nghề nghiệp" : "Ads, Fanpage, Career groups",
      icon: <FacebookLogo className="size-6" />,
    },
    {
      id: "tiktok",
      name: "TikTok",
      desc: isVi ? "Video ngắn, Review AI từ Tech Creators" : "Short clips, Tech creator reviews",
      icon: <TikTokLogo className="size-6" />,
    },
    {
      id: "youtube",
      name: "YouTube",
      desc: isVi ? "Video hướng dẫn phỏng vấn, Review công cụ" : "Tutorials, Interview reviews",
      icon: <YouTubeLogo className="size-6" />,
    },
    {
      id: "ai",
      name: isVi ? "Gợi ý từ AI" : "AI Recommendations",
      desc: isVi ? "ChatGPT, Claude, Perplexity giới thiệu" : "Recommended by ChatGPT, Claude",
      icon: <OpenAiLogo className="size-6" />,
    },
    {
      id: "google",
      name: "Google Search",
      desc: isVi ? "Tìm kiếm Google (SEO & Tự nhiên)" : "Organic search, Web results",
      icon: <GoogleLogo className="size-6" />,
    },
    {
      id: "referral",
      name: isVi ? "Bạn bè giới thiệu" : "Friend / Referral",
      desc: isVi ? "Đồng nghiệp, bạn học giới thiệu trực tiếp" : "Word of mouth, colleagues",
      icon: <ReferralLogo className="size-6" />,
    },
    {
      id: "other",
      name: isVi ? "Kênh khác" : "Other sources",
      desc: isVi ? "Workshop, Ngày hội việc làm, Báo chí" : "Workshops, Job fairs, Articles",
      icon: <OtherChannelLogo className="size-6" />,
    },
  ];

  const domains = [
    {
      id: "it",
      name: isVi ? "Công nghệ thông tin (IT & Phần mềm)" : "Information Technology & Software",
      desc: isVi ? "Backend, Frontend, Fullstack, AI, DevOps, QA..." : "Backend, Frontend, Fullstack, AI, Cloud...",
      icon: <Code className="size-5" />,
      roles: ["Backend Developer", "Frontend Developer", "Fullstack Developer", "DevOps / SRE", "Data Analyst", "Sinh viên CNTT"],
    },
    {
      id: "marketing",
      name: isVi ? "Marketing & Truyền thông" : "Marketing & Communications",
      desc: isVi ? "Digital Marketing, Content, SEO, Brand Manager..." : "Digital Marketing, Content, SEO, Branding...",
      icon: <Megaphone className="size-5" />,
      roles: ["Digital Marketer", "Content Creator", "SEO Specialist", "Brand Manager", "Growth Marketer"],
    },
    {
      id: "finance",
      name: isVi ? "Tài chính & Ngân hàng" : "Finance & Banking",
      desc: isVi ? "Phân tích tài chính, Kế toán, QHKH, Ngân hàng..." : "Financial Analyst, Accounting, Banking...",
      icon: <Landmark className="size-5" />,
      roles: ["Financial Analyst", "Chuyên viên QHKH", "Kế toán tổng hợp", "Risk Analyst", "Chuyên viên tín dụng"],
    },
    {
      id: "business_sales",
      name: isVi ? "Quản trị Kinh doanh & Sales" : "Business & Sales Management",
      desc: isVi ? "B2B Sales, Business Development, Account Exec..." : "B2B Sales, Business Development, Account Exec...",
      icon: <TrendingUp className="size-5" />,
      roles: ["B2B Sales Executive", "Business Development", "Account Manager", "Tư vấn kinh doanh"],
    },
    {
      id: "design",
      name: isVi ? "Thiết kế Sản phẩm (UI/UX)" : "Product Design (UI/UX)",
      desc: isVi ? "UI/UX Designer, Product Designer, Figma..." : "UI/UX Designer, Product Designer, Graphic...",
      icon: <Palette className="size-5" />,
      roles: ["UI/UX Designer", "Product Designer", "Graphic Designer", "Web Designer"],
    },
    {
      id: "hr",
      name: isVi ? "Quản trị Nhân sự (HR)" : "Human Resources (HR)",
      desc: isVi ? "Tuyển dụng nhân tài, C&B, HR Generalist..." : "Talent Acquisition, C&B, HR Generalist...",
      icon: <Users className="size-5" />,
      roles: ["Talent Acquisition (Recruiter)", "HR Generalist", "C&B Specialist", "HRBP"],
    },
    {
      id: "student",
      name: isVi ? "Sinh viên mới tốt nghiệp / Chưa đi làm" : "Fresh Graduate / Entry-level",
      desc: isVi ? "Đang chuẩn bị tìm kiếm công việc hoặc thực tập đầu tiên" : "Seeking first job or internship position",
      icon: <GraduationCap className="size-5" />,
      roles: ["Thực tập sinh (Intern)", "Fresher / Mới ra trường", "Học viên chuyển ngành"],
    },
    {
      id: "other",
      name: isVi ? "Lĩnh vực khác / Đang chuyển ngành" : "Other / Career Transition",
      desc: isVi ? "Lĩnh vực chuyên môn khác hoặc đang học định hướng mới" : "Other profession or exploring new career",
      icon: <Globe className="size-5" />,
      roles: ["Project Manager", "Operations Manager", "Chuyên viên phân tích"],
    },
  ];

  const activeDomainObj = domains.find((d) => d.id === selectedDomain);

  const goals = isVi
    ? [
        "Chuẩn bị cho kỳ phỏng vấn xin việc sắp tới",
        "Rèn luyện kỹ năng phản xạ câu trả lời theo cấu trúc STAR",
        "Khắc phục tốc độ nói WPM và hạn chế dùng từ đệm (à, ừm)",
        "Luyện phỏng vấn chuyên nghiệp bằng tiếng Anh",
        "Khảo sát năng lực chuyên môn để định vị bản thân",
      ]
    : [
        "Preparing for upcoming real job interviews",
        "Mastering structured answers using the STAR method",
        "Improving speech pace (WPM) and reducing filler words",
        "Practicing fluent English interview responses",
        "Benchmarking skills and receiving actionable AI feedback",
      ];

  const levels = [
    { key: "intern", label: isVi ? "Thực tập sinh" : "Intern", sub: "< 6 tháng" },
    { key: "fresher", label: isVi ? "Fresher" : "Fresher", sub: "< 1 năm" },
    { key: "junior", label: isVi ? "Junior" : "Junior", sub: "1 - 2 năm" },
    { key: "middle", label: isVi ? "Middle" : "Middle", sub: "3 - 4 năm" },
    { key: "senior", label: isVi ? "Senior / Lead" : "Senior / Lead", sub: "5+ năm" },
  ];

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedChannel) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDomain) return;
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!currentJobTitle.trim()) return;
      if (!targetRole) setTargetRole(currentJobTitle);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!targetRole.trim() || isSubmitting) return;
      setIsSubmitting(true);
      try {
        await request("/api/v1/onboarding", {
          method: "POST",
          body: JSON.stringify({
            preferred_language: selectedLanguage,
            acquisition_channel: selectedChannel || "other",
            current_domain: activeDomainObj?.name || selectedDomain,
            current_role: currentJobTitle,
            target_role: targetRole,
            target_level: targetLevel,
            target_goal:
              targetGoal ||
              (isVi
                ? "Chuẩn bị cho kỳ phỏng vấn xin việc sắp tới"
                : "Preparing for upcoming job interviews"),
          }),
        });
      } catch (err) {
        console.warn("Onboarding save fallback:", err);
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

  const progressPercent =
    currentStep === 1
      ? 20
      : currentStep === 2
      ? 40
      : currentStep === 3
      ? 60
      : currentStep === 4
      ? 80
      : 100;

  return (
    <div className={styles.container}>
      <div className={styles.glowTop} />

      {currentStep <= 5 && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressHeader}>
            <span className={styles.stepIndicator}>
              <span>{isVi ? "Bước" : "Step"}</span>
              <strong>{currentStep} / 5</strong>
            </span>
            <span>{progressPercent}% {isVi ? "hoàn tất" : "completed"}</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.card}>
        {/* STEP 1: LANGUAGE SELECTION (BILINGUAL) */}
        {currentStep === 1 && (
          <div>
            <div className={styles.stepHeader}>
              <div className={styles.badge}>
                <Globe size={13} />
                <span>Language &bull; Ngôn ngữ</span>
              </div>
              <h1 className={styles.title}>
                <span>Chọn ngôn ngữ bạn muốn sử dụng</span>
                <span className={styles.titleHighlight}> / </span>
                <span className={styles.titleHighlight}>Choose language</span>
              </h1>
              <div className={styles.bilingualSub}>
                <p className={styles.subtitle}>
                  Ngôn ngữ này sẽ được áp dụng cho toàn bộ giao diện và các buổi phỏng vấn AI tiếp theo của bạn.
                </p>
                <span className={styles.bilingualEn}>
                  This language will be applied to the user interface and all your upcoming AI mock interviews.
                </span>
              </div>
            </div>

            <div className={styles.languageGrid}>
              <div
                className={`${styles.langCard} ${
                  selectedLanguage === "vi" ? styles.langCardActive : ""
                }`}
                onClick={() => handleSelectLanguage("vi")}
              >
                <span className={styles.flagIcon}>🇻🇳</span>
                <h3 className={styles.langName}>Tiếng Việt</h3>
                <span className={styles.langSub}>Vietnamese</span>
                <p className={styles.langDesc}>
                  Giao diện tiếng Việt chuẩn, gợi ý phản xạ STAR tự nhiên và nhận diện giọng nói tiếng Việt mượt mà.
                </p>
              </div>

              <div
                className={`${styles.langCard} ${
                  selectedLanguage === "en" ? styles.langCardActive : ""
                }`}
                onClick={() => handleSelectLanguage("en")}
              >
                <span className={styles.flagIcon}>🇺🇸</span>
                <h3 className={styles.langName}>English</h3>
                <span className={styles.langSub}>Tiếng Anh</span>
                <p className={styles.langDesc}>
                  Standard international English interface, professional behavioral question bank &amp; speech fluency analyzer.
                </p>
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
              >
                <span>{selectedLanguage === "vi" ? "Tiếp tục" : "Continue"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MARKETING ACQUISITION CHANNEL */}
        {currentStep === 2 && (
          <div>
            <div className={styles.stepHeader}>
              <div className={styles.badge}>
                <Sparkles size={13} />
                <span>{isVi ? "Khảo sát nhỏ" : "Quick Survey"}</span>
              </div>
              <h2 className={styles.title}>
                {isVi ? "Bạn biết đến Interviewly qua đâu?" : "How did you hear about Interviewly?"}
              </h2>
              <p className={styles.subtitle}>
                {isVi
                  ? "Chia sẻ nguồn tiếp cận giúp chúng tôi tối ưu hóa nội dung và kết nối cộng đồng tốt hơn."
                  : "Help us understand how you discovered our AI coaching platform."}
              </p>
            </div>

            <div className={styles.channelsGrid}>
              {channels.map((chan) => {
                const isSelected = selectedChannel === chan.id;
                return (
                  <div
                    key={chan.id}
                    className={`${styles.channelCard} ${
                      isSelected ? styles.channelCardActive : ""
                    }`}
                    onClick={() => setSelectedChannel(chan.id)}
                  >
                    <div className={styles.channelIconBox}>{chan.icon}</div>
                    <div className={styles.channelInfo}>
                      <h4 className={styles.channelTitle}>{chan.name}</h4>
                      <p className={styles.channelDesc}>{chan.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{isVi ? "Quay lại" : "Back"}</span>
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!selectedChannel}
              >
                <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CURRENT JOB DOMAIN */}
        {currentStep === 3 && (
          <div>
            <div className={styles.stepHeader}>
              <div className={styles.badge}>
                <Briefcase size={13} />
                <span>{isVi ? "Ngành nghề chuyên môn" : "Career Field"}</span>
              </div>
              <h2 className={styles.title}>
                {isVi ? "Lĩnh vực hoặc ngành nghề hiện tại của bạn?" : "What is your current industry or field?"}
              </h2>
              <p className={styles.subtitle}>
                {isVi
                  ? "AI sẽ chọn lọc các tình huống và bộ tiêu chí phỏng vấn chuẩn xác nhất theo lĩnh vực của bạn."
                  : "AI will adapt question scenarios and rubric evaluation matching your industry."}
              </p>
            </div>

            <div className={styles.domainsGrid}>
              {domains.map((dom) => {
                const isSelected = selectedDomain === dom.id;
                return (
                  <div
                    key={dom.id}
                    className={`${styles.domainCard} ${
                      isSelected ? styles.domainCardActive : ""
                    }`}
                    onClick={() => setSelectedDomain(dom.id)}
                  >
                    <div className={styles.domainIconBox}>{dom.icon}</div>
                    <div>
                      <h4 className={styles.domainTitle}>{dom.name}</h4>
                      <p className={styles.domainDesc}>{dom.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{isVi ? "Quay lại" : "Back"}</span>
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!selectedDomain}
              >
                <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CURRENT JOB TITLE */}
        {currentStep === 4 && (
          <div>
            <div className={styles.stepHeader}>
              <div className={styles.badge}>
                <Award size={13} />
                <span>{isVi ? "Chức danh hiện tại" : "Current Role"}</span>
              </div>
              <h2 className={styles.title}>
                {isVi ? "Chức danh hoặc vị trí công việc hiện tại của bạn?" : "What is your current job title or role?"}
              </h2>
              <p className={styles.subtitle}>
                {isVi
                  ? "Chọn nhanh vị trí gợi ý bên dưới hoặc tự nhập chức danh của bạn."
                  : "Pick a suggested role below or type your custom job title."}
              </p>
            </div>

            {activeDomainObj && activeDomainObj.roles.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <span className={styles.fieldLabel}>
                  {isVi ? `Gợi ý vị trí ngành ${activeDomainObj.name}:` : "Suggested roles in your field:"}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {activeDomainObj.roles.map((r) => {
                    const isSelected = currentJobTitle === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCurrentJobTitle(r)}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "999px",
                          border: isSelected ? "1.5px solid #d98236" : "1.5px solid rgba(106, 72, 49, 0.15)",
                          backgroundColor: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                          color: isSelected ? "#b35919" : "#211914",
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: "13px",
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 4px 14px rgba(217, 130, 54, 0.18)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="current-job" className={styles.fieldLabel}>
                {isVi ? "Chức danh cụ thể của bạn:" : "Your specific job title:"}
              </label>
              <input
                id="current-job"
                type="text"
                className={styles.customInput}
                value={currentJobTitle}
                onChange={(e) => setCurrentJobTitle(e.target.value)}
                placeholder={isVi ? "Ví dụ: Junior Backend Developer, Sinh viên năm cuối..." : "e.g. Junior Backend Developer, Final year student..."}
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{isVi ? "Quay lại" : "Back"}</span>
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!currentJobTitle.trim()}
              >
                <span>{isVi ? "Tiếp tục" : "Continue"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TARGET ROLE & GOAL */}
        {currentStep === 5 && (
          <div>
            <div className={styles.stepHeader}>
              <div className={styles.badge}>
                <Target size={13} />
                <span>{isVi ? "Mục tiêu hướng tới" : "Target Goals"}</span>
              </div>
              <h2 className={styles.title}>
                {isVi ? "Vị trí bạn muốn theo đuổi và mục tiêu luyện tập?" : "What is your target role and interview goal?"}
              </h2>
              <p className={styles.subtitle}>
                {isVi
                  ? "AI sẽ đóng vai nhà tuyển dụng và căn chỉnh độ khó câu hỏi theo đúng mục tiêu của bạn."
                  : "AI will simulate the exact interviewer persona calibrated to your target level."}
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="target-role" className={styles.fieldLabel}>
                {isVi ? "Vị trí công việc bạn muốn ứng tuyển / hướng tới:" : "Target job title you want to pursue:"}
              </label>
              <input
                id="target-role"
                type="text"
                className={styles.customInput}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={isVi ? "Ví dụ: Senior Backend Engineer, Product Manager..." : "e.g. Senior Backend Engineer, Product Manager..."}
              />
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>
                {isVi ? "Cấp bậc kinh nghiệm bạn hướng tới:" : "Target seniority level:"}
              </span>
              <div className={styles.levelsRow}>
                {levels.map((lvl) => {
                  const isSelected = targetLevel === lvl.key;
                  return (
                    <div
                      key={lvl.key}
                      className={`${styles.levelPill} ${
                        isSelected ? styles.levelPillActive : ""
                      }`}
                      onClick={() => setTargetLevel(lvl.key)}
                    >
                      <span className={styles.levelKey}>{lvl.label}</span>
                      <span className={styles.levelSub}>{lvl.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>
                {isVi ? "Mục tiêu trọng tâm khi luyện tập cùng AI Coach:" : "Primary interview goal:"}
              </span>
              <div className={styles.goalsList}>
                {goals.map((g) => {
                  const isSelected = targetGoal === g;
                  return (
                    <div
                      key={g}
                      className={`${styles.goalItem} ${
                        isSelected ? styles.goalItemActive : ""
                      }`}
                      onClick={() => setTargetGoal(g)}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: isSelected ? "2px solid #d98236" : "2px solid rgba(106, 72, 49, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isSelected ? "#d98236" : "transparent",
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span>{g}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{isVi ? "Quay lại" : "Back"}</span>
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!targetRole.trim() || isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? isVi
                      ? "Đang lưu..."
                      : "Saving..."
                    : isVi
                    ? "Hoàn tất & Xem kết quả"
                    : "Finish & View Profile"}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS SUMMARY SCREEN */}
        {currentStep === 6 && (
          <div className={styles.successWrapper}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>{isVi ? "Hồ sơ đã sẵn sàng" : "Onboarding Complete"}</span>
            </div>

            <h1 className={styles.title}>
              {isVi ? (
                <>
                  Cảm ơn bạn đã tìm đến và đồng hành cùng{" "}
                  <span className={styles.titleHighlight}>Interviewly!</span>
                </>
              ) : (
                <>
                  Thank you for choosing{" "}
                  <span className={styles.titleHighlight}>Interviewly!</span>
                </>
              )}
            </h1>

            <p className={styles.subtitle}>
              {isVi
                ? `Chào ${user?.full_name || "bạn"}, toàn bộ thông tin định hướng và lộ trình nghề nghiệp của bạn đã được AI ghi nhận. Hệ thống đã tối ưu hóa phòng phỏng vấn riêng biệt dành cho bạn.`
                : `Hello ${user?.full_name || "there"}, your profile and career roadmap have been calibrated. Your personalized AI interview room is ready.`}
            </p>

            <div className={styles.profileSummaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {isVi ? "Ngôn ngữ phỏng vấn:" : "Interview language:"}
                </span>
                <span className={styles.summaryVal}>
                  {selectedLanguage === "vi" ? "🇻🇳 Tiếng Việt (Vietnamese)" : "🇺🇸 English (International)"}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {isVi ? "Nguồn tiếp cận:" : "Discovery channel:"}
                </span>
                <span className={styles.summaryVal}>
                  {channels.find((c) => c.id === selectedChannel)?.name || "Internet"}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {isVi ? "Lĩnh vực chuyên môn:" : "Career field:"}
                </span>
                <span className={styles.summaryVal}>
                  {activeDomainObj?.name || selectedDomain}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {isVi ? "Lộ trình phát triển:" : "Career path:"}
                </span>
                <span className={styles.summaryVal} style={{ color: "#d98236" }}>
                  <span>{currentJobTitle}</span>
                  <ArrowRight size={14} style={{ margin: "0 4px" }} />
                  <strong>{targetRole}</strong>
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {isVi ? "Cấp bậc hướng tới:" : "Target seniority:"}
                </span>
                <span className={styles.summaryVal} style={{ textTransform: "capitalize" }}>
                  {levels.find((l) => l.key === targetLevel)?.label || targetLevel}
                </span>
              </div>

              {targetGoal && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {isVi ? "Mục tiêu trọng tâm:" : "Primary focus:"}
                  </span>
                  <span className={styles.summaryVal} style={{ fontStyle: "italic", fontSize: "12.5px" }}>
                    &ldquo;{targetGoal}&rdquo;
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "460px", margin: "0 auto" }}>
              <button
                type="button"
                className={styles.primaryBtn}
                style={{ width: "100%", justifyContent: "center", margin: 0 }}
                onClick={() => router.push("/practice")}
              >
                <Zap size={16} />
                <span>{isVi ? "Bắt đầu buổi phỏng vấn thử đầu tiên ngay" : "Start Your First Mock Interview"}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className={styles.backBtn}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => router.push("/profile")}
                >
                  <span>{isVi ? "Hồ sơ cá nhân" : "My Profile"}</span>
                </button>

                <button
                  type="button"
                  className={styles.backBtn}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => router.push("/questions")}
                >
                  <span>{isVi ? "Ngân hàng câu hỏi" : "Question Bank"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
