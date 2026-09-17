"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Building2,
  Clock,
  Award,
  Star,
  ArrowRight,
  Plus,
  FileText,
  Briefcase,
  CheckCircle2,
  X,
  Keyboard,
  Mic,
  Link as LinkIcon,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { PRE_MADE_INTERVIEWS, PreMadeInterview } from "@/data/mockInterviews";
import styles from "./practice.module.css";

const SAMPLE_JD_TEXT = `Vị trí: Senior Software Engineer (Frontend / Fullstack)
Yêu cầu công việc:
- Tối thiểu 4 năm kinh nghiệm làm việc chuyên sâu với React, Next.js, TypeScript.
- Nắm vững kiến trúc Micro-frontends, tối ưu hóa Web Performance (LCP, INP, CLS) và SEO.
- Có kinh nghiệm thiết kế State Management quy mô lớn (Redux Toolkit, Zustand).
- Khả năng phối hợp liên chức năng với Product Manager và UI/UX Designer theo chuẩn Agile/Scrum.
- Tư duy phản biện, kỹ năng giải quyết sự cố trên production và văn hóa code review chặt chẽ.`;

export default function PracticeOverviewPage() {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Custom JD Modal State
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [jdJobTitle, setJdJobTitle] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  const [jdSource, setJdSource] = useState("LinkedIn");
  const [jdContent, setJdContent] = useState("");
  const [jdLevel, setJdLevel] = useState("senior");
  const [jdLanguage, setJdLanguage] = useState("vi");
  const [jdMode, setJdMode] = useState<"text" | "voice">("voice");
  const [isCreatingJd, setIsCreatingJd] = useState(false);

  // Pre-made Interview Quick Launch Modal
  const [selectedInterview, setSelectedInterview] = useState<PreMadeInterview | null>(null);
  const [launchMode, setLaunchMode] = useState<"text" | "voice">("voice");
  const [isLaunching, setIsLaunching] = useState(false);

  // Filter categories
  const categories = [
    { id: "all", label: "Tất cả các buổi" },
    { id: "bigtech", label: "🏢 Big Tech Khủng" },
    { id: "software", label: "💻 Software Dev" },
    { id: "ai", label: "🧠 AI & Data Science" },
    { id: "product", label: "🚀 Product & Management" },
    { id: "fintech", label: "💳 FinTech & Systems" },
  ];

  const levels = [
    { id: "all", label: "Mọi cấp độ" },
    { id: "junior", label: "Junior" },
    { id: "mid", label: "Middle" },
    { id: "senior", label: "Senior" },
    { id: "lead", label: "Staff / Lead" },
  ];

  // Filtered interviews list
  const filteredInterviews = useMemo(() => {
    return PRE_MADE_INTERVIEWS.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== "all" && item.level !== selectedLevel) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inCompany = item.company.toLowerCase().includes(q);
        const inDomain = item.domain.toLowerCase().includes(q);
        const inTopics = item.topics.some((t) => t.toLowerCase().includes(q));
        return inTitle || inCompany || inDomain || inTopics;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  // Handle launch pre-made interview
  const handleStartPreMade = (interview: PreMadeInterview) => {
    setSelectedInterview(interview);
  };

  const confirmLaunchPreMade = () => {
    if (!selectedInterview) return;
    setIsLaunching(true);

    const sessionId = `bt-${selectedInterview.company.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`;
    const metadata = {
      roleLabel: selectedInterview.title,
      companyName: selectedInterview.company,
      domainLabel: selectedInterview.domain,
      levelLabel: selectedInterview.levelLabel,
      languageLabel: "Tiếng Việt",
      mode: launchMode,
      totalQuestions: selectedInterview.sampleQuestions.length,
    };

    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(metadata));
      sessionStorage.setItem("active_session_metadata", JSON.stringify(metadata));
      sessionStorage.setItem(
        `custom_questions_${sessionId}`,
        JSON.stringify(selectedInterview.sampleQuestions)
      );
      sessionStorage.setItem(
        "active_custom_questions",
        JSON.stringify(selectedInterview.sampleQuestions)
      );
    } catch {
      // ignore
    }

    router.push(`/practice/${sessionId}`);
  };

  // Handle create interview from custom JD
  const handleCreateFromJd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdJobTitle.trim()) return;
    setIsCreatingJd(true);

    const sessionId = `jd-${Date.now().toString(36)}`;
    const roleTitle = jdJobTitle.trim();
    const company = jdCompany.trim() || "Doanh nghiệp mục tiêu";

    // Auto generate 4 custom questions tailored to JD
    const generatedQuestions = [
      {
        question_id: 1,
        question_text: `Dựa trên yêu cầu của vị trí ${roleTitle} tại ${company}, bạn hãy giới thiệu sơ lược về bản thân và dự án tiêu biểu nhất thể hiện rõ năng lực chuyên môn phù hợp với vị trí này.`,
        star_hint:
          "Situation: Bối cảnh dự án trước. Task: Nhiệm vụ chính của bạn. Action: Giải pháp kỹ thuật bạn chọn. Result: Hiệu quả định lượng.",
      },
      {
        question_id: 2,
        question_text: `Trong bản mô tả công việc (JD) có nhấn mạnh về các thách thức kỹ thuật và xử lý sự cố. Bạn hãy kể về một lần giải quyết một bài toán hóc búa nhất mà bạn từng trực tiếp xử lý.`,
        star_hint:
          "Đi sâu vào cách bạn phân tích nguyên nhân gốc rễ (Root Cause Analysis) và các phương án đánh đổi (Trade-offs).",
      },
      {
        question_id: 3,
        question_text: `Khi phải làm việc với các bên liên quan (Product Manager, Designer, Khách hàng) có sự bất đồng về độ ưu tiên của tính năng so với chất lượng mã nguồn, bạn giải quyết như thế nào?`,
        star_hint:
          "Thể hiện kỹ năng giao tiếp, khả năng thuyết phục dựa trên dữ liệu đo lường và tinh thần trách nhiệm cao.",
      },
      {
        question_id: 4,
        question_text: `Nếu được nhận vào vị trí ${roleTitle} tại ${company}, kế hoạch 30-60-90 ngày đầu tiên của bạn để nắm bắt công việc và tạo ra giá trị thiết thực sẽ như thế nào?`,
        star_hint:
          "30 ngày: Hòa nhập văn hóa, hiểu codebase. 60 ngày: Độc lập đóng góp tính năng. 90 ngày: Đề xuất cải tiến kiến trúc và mentor.",
      },
    ];

    const metadata = {
      roleLabel: roleTitle,
      companyName: company,
      domainLabel: company,
      levelLabel: jdLevel.toUpperCase(),
      languageLabel: jdLanguage === "vi" ? "Tiếng Việt" : "English",
      mode: jdMode,
      totalQuestions: generatedQuestions.length,
      jdSnippet: jdContent.slice(0, 300),
    };

    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(metadata));
      sessionStorage.setItem("active_session_metadata", JSON.stringify(metadata));
      sessionStorage.setItem(
        `custom_questions_${sessionId}`,
        JSON.stringify(generatedQuestions)
      );
      sessionStorage.setItem("active_custom_questions", JSON.stringify(generatedQuestions));
    } catch {
      // ignore
    }

    router.push(`/practice/${sessionId}`);
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case "junior":
        return styles.levelJunior;
      case "mid":
        return styles.levelMid;
      case "senior":
        return styles.levelSenior;
      case "lead":
        return styles.levelLead;
      default:
        return styles.levelSenior;
    }
  };

  return (
    <div className={styles.pageShell}>
      {/* Hero Title Section */}
      <div className={styles.heroHeader}>
        <div className={styles.eyebrow}>
          <Sparkles size={13} />
          <span>PHÒNG LUYỆN TẬP PHỎNG VẤN THỰC CHIẾN AI</span>
        </div>
        <h1 className={styles.title}>
          Chinh Phục Phỏng Vấn <span className={styles.titleGradient}>Big Tech & JD Tùy Biến</span>
        </h1>
        <p className={styles.sub}>
          Lựa chọn các buổi phỏng vấn mô phỏng chuẩn hóa từ các tập đoàn công nghệ hàng đầu thế giới,
          hoặc dán bản mô tả công việc (JD) bạn đang ứng tuyển để AI tạo bộ câu hỏi độc quyền 1-1.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBarWrapper}>
          <div className={styles.searchBox}>
            <Search size={17} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo vị trí, công ty (Google, Meta, Shopee) hoặc kỹ năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                className={`${styles.tabPill} ${selectedLevel === lvl.id ? styles.tabPillActive : ""}`}
                onClick={() => setSelectedLevel(lvl.id)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabsRow}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.tabPill} ${selectedCategory === cat.id ? styles.tabPillActive : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* VERTICAL PORTRAIT CARDS GRID */}
      <div className={styles.interviewsGrid}>
        {/* =========================================================
            CARD 1: CREATE CUSTOM INTERVIEW WITH JOB DESCRIPTION (JD)
            Tỉ lệ dọc, thiết kế sang trọng & nổi bật nhất
        ========================================================= */}
        <div
          className={`${styles.cardBase} ${styles.customJdCard}`}
          onClick={() => setIsJdModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsJdModalOpen(true);
          }}
          aria-label="Tạo buổi phỏng vấn mới theo JD của bạn"
        >
          {/* Top Illustration / Image Banner */}
          <div className={styles.customJdHeroImgWrap}>
            <div className={styles.customJdIllustration}>
              <div className={styles.customJdIconGlow}>
                <FileText size={32} />
              </div>
              <div className={styles.customJdSupportedBadges}>
                <span className={styles.customJdSupportPill}>LinkedIn</span>
                <span className={styles.customJdSupportPill}>TopCV</span>
                <span className={styles.customJdSupportPill}>VietCV</span>
                <span className={styles.customJdSupportPill}>PDF / Text</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className={styles.customJdBody}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className={styles.customJdBadge}>
                <Sparkles size={13} />
                <span>AI Tailored • Độc Quyền</span>
              </span>
              <h2 className={styles.customJdTitle}>Tạo Buổi Phỏng Vấn Theo JD Của Bạn</h2>
              <p className={styles.customJdDesc}>
                Dán bản mô tả công việc (JD) từ LinkedIn, TopCV hoặc link tuyển dụng bất kỳ.
                AI phân tích yêu cầu chuyên môn và mô phỏng chính xác buổi phỏng vấn thực tế.
              </p>

              {/* Feature Highlights */}
              <ul className={styles.customJdFeatures}>
                <li className={styles.customJdFeatureItem}>
                  <span className={styles.customJdFeatureDot}>✦</span>
                  <span>Bóc tách 100% kỹ thuật & văn hóa công ty</span>
                </li>
                <li className={styles.customJdFeatureItem}>
                  <span className={styles.customJdFeatureDot}>✦</span>
                  <span>Dự đoán câu hỏi đào sâu theo level</span>
                </li>
                <li className={styles.customJdFeatureItem}>
                  <span className={styles.customJdFeatureDot}>✦</span>
                  <span>Hỗ trợ Voice (Nói chuyện AI) hoặc Text</span>
                </li>
              </ul>
            </div>

            {/* Bottom Action */}
            <button
              type="button"
              className={styles.btnCreateJdAction}
              onClick={(e) => {
                e.stopPropagation();
                setIsJdModalOpen(true);
              }}
            >
              <Sparkles size={16} />
              <span>Tạo phỏng vấn theo JD ngay</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* =========================================================
            SUBSEQUENT CARDS: PRE-MADE INTERVIEWS (TỈ LỆ DỌC CÓ HÌNH ẢNH)
        ========================================================= */}
        {filteredInterviews.map((item) => (
          <div
            key={item.id}
            className={styles.cardBase}
            onClick={() => handleStartPreMade(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStartPreMade(item);
            }}
          >
            {/* Top Portrait Image */}
            <div className={styles.cardImgWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className={styles.cardImg}
                loading="lazy"
              />
              <div className={styles.cardImgOverlay}>
                <div className={styles.cardTopTags}>
                  <span className={styles.cardCompanyBadge}>
                    <Building2 size={12} className="text-[#d98236]" />
                    <span>{item.company}</span>
                  </span>
                  <span className={styles.cardRatingPill}>
                    <Star size={12} fill="#fbbf24" stroke="none" />
                    <span>{item.rating}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              <div className={styles.cardMainInfo}>
                <div className={styles.cardRoleLevelRow}>
                  <span className={`${styles.levelBadge} ${getLevelClass(item.level)}`}>
                    {item.levelLabel}
                  </span>
                  <span className={styles.cardDuration}>
                    <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                    {item.questionsCount} câu hỏi • ~{item.durationMinutes}p
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardSubtitle}>
                  <span>{item.companyBadge}</span> • <span>{item.domain}</span>
                </p>

                {/* Topics Tag List */}
                <div className={styles.cardTopicsRow}>
                  {item.topics.slice(0, 3).map((topic, i) => (
                    <span key={i} className={styles.topicTag}>
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Community Social Proof / Testimonial Box */}
                <div className={styles.testimonialQuoteBox}>
                  <p className={styles.quoteText}>&ldquo;{item.testimonial.quote}&rdquo;</p>
                  <p className={styles.quoteAuthor}>
                    <Award size={12} className="text-[#d98236]" />
                    <span>{item.testimonial.author} ({item.testimonial.role})</span>
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <span className={styles.candidatesCount}>
                  <TrendingUp size={12} style={{ display: "inline", marginRight: 4 }} />
                  {item.candidatesPracticed} ứng viên đã luyện
                </span>

                <button
                  type="button"
                  className={styles.btnStartInterview}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPreMade(item);
                  }}
                >
                  <span>Luyện tập</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
          MODAL 1: CREATE CUSTOM INTERVIEW FROM JOB DESCRIPTION (JD)
      ========================================================= */}
      {isJdModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsJdModalOpen(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} className="text-[#d98236]" />
                  <h2 className={styles.modalTitle}>Tạo Buổi Phỏng Vấn Theo JD</h2>
                </div>
                <p className={styles.modalSub}>
                  Dán nội dung bản mô tả công việc (JD) từ LinkedIn, TopCV, VietCV... để AI thiết lập buổi phỏng vấn đo ni đóng giày.
                </p>
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsJdModalOpen(false)}
                aria-label="Đóng cửa sổ"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateFromJd} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className={styles.modalFormGrid}>
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    <span>Vị trí ứng tuyển (Job Title) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.modalFieldInput}
                    placeholder="Ví dụ: Senior Frontend Engineer (React/Next.js)"
                    value={jdJobTitle}
                    onChange={(e) => setJdJobTitle(e.target.value)}
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    <span>Doanh nghiệp mục tiêu (Target Company)</span>
                  </label>
                  <input
                    type="text"
                    className={styles.modalFieldInput}
                    placeholder="Ví dụ: Shopee, Techcombank, VNG..."
                    value={jdCompany}
                    onChange={(e) => setJdCompany(e.target.value)}
                  />
                </div>

                <div className={`${styles.modalField} ${styles.modalFormFull}`}>
                  <div className={styles.modalFieldLabel}>
                    <span>Nội dung mô tả công việc (Job Description / Requirements) *</span>
                    <button
                      type="button"
                      className={styles.quickFillBtn}
                      onClick={() => {
                        setJdJobTitle("Senior Frontend Engineer");
                        setJdCompany("Shopee Singapore");
                        setJdContent(SAMPLE_JD_TEXT);
                      }}
                    >
                      Dán mẫu JD tham khảo
                    </button>
                  </div>
                  <textarea
                    required
                    className={styles.modalFieldTextarea}
                    placeholder="Dán các yêu cầu kỹ năng, trách nhiệm công việc hoặc link JD từ LinkedIn/TopCV/VietCV tại đây..."
                    value={jdContent}
                    onChange={(e) => setJdContent(e.target.value)}
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    <span>Cấp độ phỏng vấn (Level)</span>
                  </label>
                  <select
                    className={styles.modalFieldSelect}
                    value={jdLevel}
                    onChange={(e) => setJdLevel(e.target.value)}
                  >
                    <option value="intern">Intern / Thực tập sinh</option>
                    <option value="fresher">Fresher (Dưới 1 năm)</option>
                    <option value="junior">Junior (1 - 3 năm)</option>
                    <option value="mid">Middle (3 - 5 năm)</option>
                    <option value="senior">Senior (5+ năm kinh nghiệm)</option>
                    <option value="lead">Lead / Principal Engineer</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    <span>Ngôn ngữ phỏng vấn</span>
                  </label>
                  <select
                    className={styles.modalFieldSelect}
                    value={jdLanguage}
                    onChange={(e) => setJdLanguage(e.target.value)}
                  >
                    <option value="vi">🇻🇳 Tiếng Việt (Thực chiến)</option>
                    <option value="en">🇺🇸 English (Quốc tế)</option>
                  </select>
                </div>

                <div className={`${styles.modalField} ${styles.modalFormFull}`}>
                  <label className={styles.modalFieldLabel}>
                    <span>Hình thức phản xạ</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setJdMode("voice")}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: jdMode === "voice" ? "2px solid #d98236" : "1px solid rgba(106, 72, 49, 0.18)",
                        background: jdMode === "voice" ? "rgba(217, 130, 54, 0.12)" : "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <Mic size={18} className={jdMode === "voice" ? "text-[#d98236]" : "text-stone-500"} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#211914" }}>Nói trực tiếp (Voice STT)</div>
                        <div style={{ fontSize: 11, color: "#8b4513" }}>Khuyên dùng: Rèn luyện phong thái và WPM</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJdMode("text")}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: jdMode === "text" ? "2px solid #d98236" : "1px solid rgba(106, 72, 49, 0.18)",
                        background: jdMode === "text" ? "rgba(217, 130, 54, 0.12)" : "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <Keyboard size={18} className={jdMode === "text" ? "text-[#d98236]" : "text-stone-500"} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#211914" }}>Nhập phím (Text)</div>
                        <div style={{ fontSize: 11, color: "rgba(45, 31, 23, 0.6)" }}>Gõ câu trả lời, không cần micro</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalBtnCancel}
                  onClick={() => setIsJdModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.modalBtnSubmit}
                  disabled={isCreatingJd}
                >
                  <Sparkles size={16} />
                  <span>{isCreatingJd ? "AI đang phân tích JD..." : "Phân tích JD & Bắt đầu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: QUICK LAUNCH PRE-MADE INTERVIEW
      ========================================================= */}
      {selectedInterview && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className={styles.modalCard}
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <span className={`${styles.levelBadge} ${getLevelClass(selectedInterview.level)}`}>
                  {selectedInterview.levelLabel}
                </span>
                <h2 className={styles.modalTitle}>{selectedInterview.title}</h2>
                <p className={styles.modalSub}>
                  {selectedInterview.company} • {selectedInterview.domain} • {selectedInterview.questionsCount} câu hỏi
                </p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedInterview(null)}
                aria-label="Đóng cửa sổ"
              >
                <X size={17} />
              </button>
            </div>

            {/* Testimonial Box */}
            <div className={styles.testimonialQuoteBox} style={{ background: "rgba(217, 130, 54, 0.08)", border: "1px solid rgba(217, 130, 54, 0.2)" }}>
              <p className={styles.quoteText}>&ldquo;{selectedInterview.testimonial.quote}&rdquo;</p>
              <p className={styles.quoteAuthor}>
                <Award size={13} className="text-[#d98236]" />
                <span>{selectedInterview.testimonial.author} ({selectedInterview.testimonial.role})</span>
              </p>
            </div>

            {/* Mode Picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#211914" }}>Chọn hình thức phỏng vấn:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setLaunchMode("voice")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: launchMode === "voice" ? "2px solid #d98236" : "1px solid rgba(106, 72, 49, 0.18)",
                    background: launchMode === "voice" ? "rgba(217, 130, 54, 0.12)" : "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <Mic size={18} className={launchMode === "voice" ? "text-[#d98236]" : "text-stone-500"} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#211914" }}>Giọng nói (Voice)</div>
                    <div style={{ fontSize: 11, color: "#8b4513" }}>Khuyên dùng</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLaunchMode("text")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: launchMode === "text" ? "2px solid #d98236" : "1px solid rgba(106, 72, 49, 0.18)",
                    background: launchMode === "text" ? "rgba(217, 130, 54, 0.12)" : "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <Keyboard size={18} className={launchMode === "text" ? "text-[#d98236]" : "text-stone-500"} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#211914" }}>Nhập phím (Text)</div>
                    <div style={{ fontSize: 11, color: "rgba(45, 31, 23, 0.6)" }}>Gõ câu trả lời</div>
                  </div>
                </button>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnCancel}
                onClick={() => setSelectedInterview(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={styles.modalBtnSubmit}
                onClick={confirmLaunchPreMade}
                disabled={isLaunching}
              >
                <Sparkles size={16} />
                <span>{isLaunching ? "Đang chuẩn bị phòng..." : "Vào phòng phỏng vấn ngay"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}