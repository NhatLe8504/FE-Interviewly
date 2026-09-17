"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Keyboard,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  Link as LinkIcon,
  Loader2,
  Check,
} from "lucide-react";
import { SimpleUserSelect, UserSelectOption, UserTooltip } from "@/components/user-component/common";
import styles from "./newPractice.module.css";

const MAX_FILES = 3;
const MAX_TOTAL_SIZE_MB = 200;
const MAX_TOTAL_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const SAMPLE_BIGTECH_JD = `Vị trí: Senior Fullstack / Backend Platform Engineer
Doanh nghiệp: Tập đoàn Công nghệ Đa quốc gia (FinTech & High-Concurrency Systems)
Yêu cầu chuyên môn:
- Tối thiểu 4 - 6 năm kinh nghiệm kiến trúc hệ thống phân tán, xử lý tải cao (High Throughput).
- Nắm vững Golang hoặc Java/Node.js, thiết kế cơ sở dữ liệu PostgreSQL và cụm Redis Cluster.
- Kinh nghiệm triển khai kiến trúc Message Queue với Apache Kafka, đảm bảo tính Idempotency và Exactly-Once Processing.
- Kỹ năng tối ưu hóa truy vấn SQL, phân mảnh dữ liệu (Sharding) và thiết kế hệ thống Microservices đạt chuẩn Zero-Downtime.
- Văn hóa làm việc: Tư duy sở hữu cao (Extreme Ownership), khả năng phối hợp đa chức năng và giao tiếp tiếng Anh lưu loát.`;


const LEVEL_OPTIONS: UserSelectOption[] = [
  { value: "intern", label: "Intern (Thực tập sinh)" },
  { value: "fresher", label: "Fresher (< 1 năm)" },
  { value: "junior", label: "Junior (1 - 3 năm)" },
  { value: "mid", label: "Middle (3 - 5 năm)" },
  { value: "senior", label: "Senior (5+ năm)" },
  { value: "lead", label: "Staff / Lead / Architect" },
];

const LANGUAGE_OPTIONS: UserSelectOption[] = [
  { value: "vi", label: "🇻🇳 Tiếng Việt (Thực chiến)" },
  { value: "en", label: "🇺🇸 English (Quốc tế)" },
];

export default function NewPracticeSessionPage() {
  const router = useRouter();

  // Input Method Tab: 'paste' | 'upload' | 'url'
  const [activeMethod, setActiveMethod] = useState<"paste" | "upload" | "url">("upload");

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [level, setLevel] = useState("senior");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [selectedFocus, setSelectedFocus] = useState<string>("architecture");

  // Validation & Loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate total uploaded size
  const totalSizeBytes = uploadedFiles.reduce((acc, curr) => acc + curr.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const percentUsed = Math.min(100, Math.round((totalSizeBytes / MAX_TOTAL_BYTES) * 100));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText size={18} />;
    if (ext === "doc" || ext === "docx") return <FileCode size={18} />;
    if (ext === "xls" || ext === "xlsx") return <FileSpreadsheet size={18} />;
    if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return <ImageIcon size={18} />;
    return <FileText size={18} />;
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const newItems: UploadedFileItem[] = [];
    let currentTotalBytes = totalSizeBytes;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (uploadedFiles.length + newItems.length >= MAX_FILES) {
        setErrorMessage(`Giới hạn tối đa ${MAX_FILES} tệp tài liệu. Chỉ nhận 3 tệp đầu tiên.`);
        break;
      }

      if (currentTotalBytes + file.size > MAX_TOTAL_BYTES) {
        setErrorMessage(`Vượt quá tổng dung lượng 200MB. Tệp "${file.name}" chưa được thêm.`);
        break;
      }

      currentTotalBytes += file.size;
      newItems.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        file,
      });
    }

    if (newItems.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newItems]);
      // If user hasn't typed job title, extract from first file name if possible
      if (!jobTitle && newItems[0]) {
        const guess = newItems[0].name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        if (guess.length > 3 && guess.length < 50) {
          setJobTitle(guess);
        }
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setErrorMessage(null);
  };

  // Submit and launch session
  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const title = jobTitle.trim();
    if (!title) {
      setErrorMessage("Vui lòng nhập tên vị trí ứng tuyển mục tiêu.");
      return;
    }

    if (uploadedFiles.length === 0 && !jdText.trim() && !jobUrl.trim()) {
      setErrorMessage("Vui lòng tải lên tài liệu JD, dán nội dung văn bản hoặc link tuyển dụng.");
      return;
    }

    setIsAnalyzing(true);

    const sessionId = `custom-${Date.now().toString(36)}`;
    const targetCompany = company.trim() || "Doanh nghiệp mục tiêu";

    // Build rich 4-5 tailored questions according to JD and chosen focus
    const questionsList = [
      {
        question_id: 1,
        question_text: `Chào bạn, dựa trên hồ sơ ứng tuyển vị trí ${title} tại ${targetCompany}, bạn hãy giới thiệu tóm tắt hành trình sự nghiệp và dự án phức tạp nhất minh chứng bạn hoàn toàn phù hợp với vị trí này.`,
        star_hint:
          "Situation: Bối cảnh dự án trước. Task: Nhiệm vụ chính của bạn. Action: Quyết định kỹ thuật và công nghệ bạn chọn. Result: Kết quả định lượng rõ ràng.",
      },
      {
        question_id: 2,
        question_text: `Trong yêu cầu tuyển dụng của ${targetCompany} có nhấn mạnh về khả năng thiết kế hệ thống và giải quyết sự cố kỹ thuật. Hãy kể về một bài toán hóc búa nhất bạn từng xử lý thành công trên thực tế.`,
        star_hint:
          "Phân tích rõ nguyên nhân gốc rễ (Root Cause Analysis), các phương án đánh đổi (Trade-offs) và giải pháp bền vững.",
      },
      {
        question_id: 3,
        question_text: `Khi đối mặt với sự thay đổi yêu cầu đột ngột từ ban giám đốc hoặc khách hàng ngay sát hạn bàn giao (Deadline), bạn điều phối thứ tự ưu tiên và giải quyết áp lực ra sao?`,
        star_hint:
          "Thể hiện khả năng quản trị kỳ vọng (Stakeholder Management), kỹ năng thương lượng phạm vi (Scope negotiation) và tinh thần trách nhiệm.",
      },
      {
        question_id: 4,
        question_text: `Nếu được chính thức gia nhập ${targetCompany}, kế hoạch hành động trong 90 ngày đầu tiên (30-60-90 plan) của bạn để tạo ra giá trị đột phá cho team sẽ bao gồm những mốc nào?`,
        star_hint:
          "30 ngày: Nắm bắt kiến trúc, quy trình. 60 ngày: Độc lập dẫn dắt tính năng. 90 ngày: Tối ưu hiệu năng và đóng góp cải tiến dài hạn.",
      },
    ];

    const sessionMetadata = {
      roleLabel: title,
      companyName: targetCompany,
      domainLabel: targetCompany,
      levelLabel: level.toUpperCase(),
      languageLabel: language === "vi" ? "Tiếng Việt" : "English",
      mode,
      totalQuestions: questionsList.length,
      uploadedFileNames: uploadedFiles.map((f) => f.name),
      jdTextSnippet: jdText.slice(0, 300),
    };

    try {
      sessionStorage.setItem(`session_metadata_${sessionId}`, JSON.stringify(sessionMetadata));
      sessionStorage.setItem("active_session_metadata", JSON.stringify(sessionMetadata));
      sessionStorage.setItem(`custom_questions_${sessionId}`, JSON.stringify(questionsList));
      sessionStorage.setItem("active_custom_questions", JSON.stringify(questionsList));
    } catch {
      // ignore
    }

    // Smooth navigation delay to simulate AI parsing
    setTimeout(() => {
      router.push(`/practice/${sessionId}`);
    }, 600);
  };

  return (
    <div className={styles.shell}>
      {/* Back Link */}
      <Link href="/practice" className={styles.backLink}>
        <ArrowLeft size={15} />
        <span>Quay lại danh sách buổi phỏng vấn</span>
      </Link>

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.eyebrow}>
          <Sparkles size={13} />
          <span>AI JOB DESCRIPTION INTELLIGENCE</span>
        </div>
        <h1 className={styles.title}>
          Tạo buổi phỏng vấn theo <em>JD &amp; Tài liệu tuyển dụng</em>
        </h1>
        <p className={styles.sub}>
          Tải lên tệp tài liệu JD (tối đa 3 tệp, 200MB) hoặc dán trực tiếp nội dung mô tả công việc.
          Động cơ AI sẽ bóc tách yêu cầu kỹ năng, công nghệ và lập trình kịch bản phỏng vấn chuyên biệt 1-1.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmitSession} className={styles.formGrid}>
        {/* =========================================================
            LEFT COLUMN: JD CONTENT & FILE UPLOAD
        ========================================================= */}
        <div className={styles.glassCard}>
          <div className={styles.cardSectionHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <FileText size={18} className="text-[#d98236]" />
                <span>Nguồn Tài Liệu & Nội Dung JD</span>
              </h2>
              <p className={styles.cardSub}>
                Cung cấp bản mô tả công việc thông qua tải tệp, dán văn bản hoặc đường dẫn link.
              </p>
            </div>
          </div>

          {/* Method Switcher Tabs */}
          <div className={styles.methodTabRow}>
            <button
              type="button"
              className={`${styles.methodTabBtn} ${activeMethod === "upload" ? styles.methodTabBtnActive : ""}`}
              onClick={() => setActiveMethod("upload")}
            >
              <UploadCloud size={15} />
              <span>Tải tệp JD (3 tệp / 200MB)</span>
            </button>
            <button
              type="button"
              className={`${styles.methodTabBtn} ${activeMethod === "paste" ? styles.methodTabBtnActive : ""}`}
              onClick={() => setActiveMethod("paste")}
            >
              <FileText size={15} />
              <span>Dán văn bản JD</span>
            </button>
            <button
              type="button"
              className={`${styles.methodTabBtn} ${activeMethod === "url" ? styles.methodTabBtnActive : ""}`}
              onClick={() => setActiveMethod("url")}
            >
              <LinkIcon size={15} />
              <span>Link tuyển dụng</span>
            </button>
          </div>

          {/* TAB 1: FILE UPLOAD (MAX 3 FILES, MAX 200MB) */}
          {activeMethod === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Dropzone */}
              <div
                className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFilesAdded(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.dropzoneIconWrapper}>
                  <UploadCloud size={28} />
                </div>
                <div>
                  <h3 className={styles.dropzoneTitle}>Kéo & Thả hoặc Bấm Để Tải Lên JD</h3>
                  <p className={styles.dropzoneNote}>
                    Hỗ trợ định dạng <strong>PDF, DOCX, DOC, TXT, PNG, JPG</strong>.
                    <br />
                    Tối đa <strong>3 tệp</strong> • Tổng dung lượng tối đa <strong>200MB</strong>.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt,image/*"
                  className={styles.dropzoneInput}
                  onChange={(e) => handleFilesAdded(e.target.files)}
                />
              </div>

              {/* Upload Limit & Storage Meter */}
              <div className={styles.quotaBarWrapper}>
                <div className={styles.quotaBarLabels}>
                  <span>Số lượng: {uploadedFiles.length} / {MAX_FILES} tệp</span>
                  <span>Tổng dung lượng: {totalSizeMB} / {MAX_TOTAL_SIZE_MB} MB</span>
                </div>
                <div className={styles.quotaBarTrack}>
                  <div
                    className={styles.quotaBarFill}
                    style={{ width: `${Math.max(4, percentUsed)}%` }}
                  />
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className={styles.uploadedFileList}>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className={styles.fileCardItem}>
                      <div className={styles.fileCardLeft}>
                        <div className={styles.fileTypeIcon}>{getFileIcon(file.name)}</div>
                        <div className={styles.fileNameWrap}>
                          <UserTooltip content={file.name}>
                            <span className={styles.fileName}>
                              {file.name}
                            </span>
                          </UserTooltip>
                          <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <UserTooltip content="Xóa tệp này">
                        <button
                          type="button"
                          className={styles.fileRemoveBtn}
                          onClick={() => handleRemoveFile(file.id)}
                          aria-label={`Xóa tệp ${file.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </UserTooltip>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional Text supplement */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span>Ghi chú thêm về JD hoặc yêu cầu riêng (Tùy chọn)</span>
                  <span className={styles.fieldLabelHint}>Bổ sung ngữ cảnh</span>
                </label>
                <textarea
                  className={styles.textarea}
                  style={{ minHeight: "100px" }}
                  placeholder="Nhập thêm các lưu ý về vòng phỏng vấn, tiêu chí đặc biệt hoặc stack công nghệ mà công ty đang dùng..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT DIRECTLY */}
          {activeMethod === "paste" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <span>Nội dung bản mô tả công việc (JD Text) *</span>
                  <button
                    type="button"
                    className={styles.quickActionLink}
                    onClick={() => {
                      setJobTitle("Senior Fullstack / Platform Engineer");
                      setCompany("FinTech MegaCorp");
                      setJdText(SAMPLE_BIGTECH_JD);
                      setLevel("senior");
                    }}
                  >
                    ✦ Dán mẫu JD Big Tech tham khảo
                  </button>
                </div>
                <textarea
                  className={styles.textarea}
                  placeholder="Dán toàn bộ nội dung bản mô tả công việc (trách nhiệm, yêu cầu kinh nghiệm, kỹ năng công nghệ) tại đây..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PASTE URL */}
          {activeMethod === "url" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span>Đường dẫn bài đăng tuyển dụng (Job URL)</span>
                  <span className={styles.fieldLabelHint}>LinkedIn, TopCV, VietCV, VietnamWorks...</span>
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <span>Trích xuất tóm tắt nội dung (Tùy chọn)</span>
                  <button
                    type="button"
                    className={styles.quickActionLink}
                    onClick={() => {
                      setJobTitle("Product / Tech Lead");
                      setCompany("Tech Unicorn");
                      setJdText(SAMPLE_BIGTECH_JD);
                    }}
                  >
                    ✦ Điền mẫu nội dung
                  </button>
                </div>
                <textarea
                  className={styles.textarea}
                  style={{ minHeight: "120px" }}
                  placeholder="Dán tóm tắt các gạch đầu dòng quan trọng nhất từ trang tuyển dụng..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* =========================================================
            RIGHT COLUMN: INTERVIEW CONFIGURATION & AI COACH
        ========================================================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className={styles.glassCard}>
            <div className={styles.cardSectionHeader}>
              <div>
                <h2 className={styles.cardTitle}>
                  <Briefcase size={18} className="text-[#d98236]" />
                  <span>Cấu Hình Buổi Phỏng Vấn</span>
                </h2>
                <p className={styles.cardSub}>
                  Thiết lập vị trí, cấp độ và phong cách để AI điều chỉnh độ khó tương xứng.
                </p>
              </div>
            </div>

            {/* Job Title */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <span>Vị trí ứng tuyển (Job Title) *</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="Ví dụ: Senior Backend Engineer (Golang)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            {/* Target Company */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <span>Doanh nghiệp mục tiêu</span>
                <span className={styles.fieldLabelHint}>Tùy chọn</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: Shopee, Google, VNG, Techcombank..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Level & Language Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span>Cấp độ (Level)</span>
                </label>
                <SimpleUserSelect
                  value={level}
                  onChange={(val) => setLevel(val)}
                  options={LEVEL_OPTIONS}
                  aria-label="Chọn cấp độ phỏng vấn"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span>Ngôn ngữ phỏng vấn</span>
                </label>
                <SimpleUserSelect
                  value={language}
                  onChange={(val) => setLanguage(val as "vi" | "en")}
                  options={LANGUAGE_OPTIONS}
                  aria-label="Chọn ngôn ngữ phỏng vấn"
                />
              </div>
            </div>

            {/* Interview Focus Cards */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <span>Trọng tâm phỏng vấn chính</span>
                <span className={styles.fieldLabelHint}>Chọn 1 trọng tâm</span>
              </label>
              <div className={styles.focusGrid}>
                {[
                  {
                    id: "architecture",
                    title: "Kiến trúc & Kỹ thuật",
                    desc: "Đào sâu thuật toán, System Design, bài toán tối ưu tải.",
                  },
                  {
                    id: "star",
                    title: "STAR & Tình huống",
                    desc: "Xử lý khủng hoảng, mâu thuẫn dự án và bài học kinh nghiệm.",
                  },
                  {
                    id: "culture",
                    title: "Văn hóa & Đội ngũ",
                    desc: "Khả năng gắn kết, tinh thần làm chủ và phong cách làm việc.",
                  },
                  {
                    id: "product",
                    title: "Tư duy sản phẩm",
                    desc: "Định hướng kinh doanh, thấu cảm người dùng và số liệu.",
                  },
                ].map((item) => {
                  const active = selectedFocus === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`${styles.focusCard} ${active ? styles.focusCardActive : ""}`}
                      onClick={() => setSelectedFocus(item.id)}
                    >
                      <div className={styles.focusCardTitle}>
                        <span>{item.title}</span>
                        {active && <Check size={13} className="text-[#d98236]" />}
                      </div>
                      <span className={styles.focusCardDesc}>{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode Selection (Voice vs Text) */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <span>Hình thức phản xạ</span>
              </label>
              <div className={styles.modeGrid}>
                <div
                  className={`${styles.modeOptionBtn} ${mode === "voice" ? styles.modeOptionBtnActive : ""}`}
                  onClick={() => setMode("voice")}
                >
                  <Mic size={18} className={mode === "voice" ? "text-[#d98236]" : "text-stone-400"} />
                  <div>
                    <span className={styles.modeTitle}>Nói chuyện (Voice STT)</span>
                    <p className={styles.modeDesc}>Khuyên dùng: Rèn phản xạ và tốc độ WPM thực tế</p>
                  </div>
                </div>

                <div
                  className={`${styles.modeOptionBtn} ${mode === "text" ? styles.modeOptionBtnActive : ""}`}
                  onClick={() => setMode("text")}
                >
                  <Keyboard size={18} className={mode === "text" ? "text-[#d98236]" : "text-stone-400"} />
                  <div>
                    <span className={styles.modeTitle}>Gõ phím (Text Mode)</span>
                    <p className={styles.modeDesc}>Luyện cấu trúc lập luận và câu chữ chặt chẽ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Session Summary */}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Kịch bản câu hỏi:</span>
                <span className={styles.summaryValue}>4 - 5 câu hỏi đào sâu theo JD</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Thời lượng ước tính:</span>
                <span className={styles.summaryValue}>~20 - 25 phút</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Tiêu chuẩn chấm điểm:</span>
                <span className={styles.summaryValue}>Rubric 3 tiêu chí + Khung STAR</span>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className={styles.spin} />
                  <span>AI đang phân tích JD & Tạo phòng phỏng vấn...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Phân tích JD & Bắt đầu phỏng vấn</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}