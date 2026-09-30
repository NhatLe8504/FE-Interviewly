"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Mic,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Edit3,
  Lightbulb,
  AlertTriangle,
  List,
  Compass,
} from "lucide-react";
import { resolveLesson, type LessonContext, type ResolvedLesson } from "@/data/lessonResolver";
import styles from "./lessonViewer.module.css";

interface LessonViewerClientProps {
  slug: string;
  lessonPath: string[];
}

export default function LessonViewerClient({ slug, lessonPath }: LessonViewerClientProps) {
  const router = useRouter();

  // Resolve Context from curriculum data
  const context: LessonContext = useMemo(() => {
    return resolveLesson(slug, lessonPath);
  }, [slug, lessonPath]);

  const { course, currentLesson, allSections, flattenedLessons, currentIndex, totalLessons, prevLesson, nextLesson } = context;

  // Sidebar visibility
  const [showTracks, setShowTracks] = useState<boolean>(true);
  const [tracksSearch, setTracksSearch] = useState<string>("");
  const [openChapterId, setOpenChapterId] = useState<string>(currentLesson.chapterId);

  // Active Tab: "guide" | "practice" | "notes"
  const [activeTab, setActiveTab] = useState<"guide" | "practice" | "notes">("guide");

  // Completed Lessons State in localStorage
  const storageKey = `completed_lessons_${slug}`;
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Notes Modal State & LocalStorage
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const noteKey = `lesson_note_${slug}_${currentLesson.id}`;
  const [personalNote, setPersonalNote] = useState<string>("");

  // In-lesson Quiz State
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<string | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCompletedIds(new Set(JSON.parse(saved)));

      const savedNote = localStorage.getItem(noteKey);
      setPersonalNote(savedNote || "");
    } catch {
      // ignore
    }
    setSelectedQuizOpt(null);
    setIsQuizSubmitted(false);
    setOpenChapterId(currentLesson.chapterId);
  }, [currentLesson.id, storageKey, noteKey, currentLesson.chapterId]);

  const toggleCompleteCurrent = () => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentLesson.id)) {
        next.delete(currentLesson.id);
      } else {
        next.add(currentLesson.id);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSaveNote = (val: string) => {
    setPersonalNote(val);
    try {
      localStorage.setItem(noteKey, val);
    } catch {
      // ignore
    }
  };

  const completedCount = completedIds.size;
  const progressPercent = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
  const isCurrentCompleted = completedIds.has(currentLesson.id);

  // Filtered tracks for sidebar
  const filteredSections = useMemo(() => {
    if (!tracksSearch.trim()) return allSections;
    const kw = tracksSearch.trim().toLowerCase();
    return allSections
      .map((sec) => ({
        ...sec,
        lessons: sec.lessons.filter((l) => l.title.toLowerCase().includes(kw)),
      }))
      .filter((sec) => sec.lessons.length > 0);
  }, [allSections, tracksSearch]);

  return (
    <div className={styles.pageShell}>
      {/* =========================================================
          1. INLINE CONTEXT TOOLBAR (REPLACES FIXED TOP HEADER)
             Seamlessly flows below the global transparent header
         ========================================================= */}
      <div className={styles.contextBar}>
        <div className={styles.contextLeft}>
          <Link
            href={`/courses/${slug}`}
            className={styles.backBtn}
            title="Quay lại trang chi tiết khóa học"
          >
            <ArrowLeft size={13} />
            <span>Về Lộ Trình: {course.title.split(" (")[0]}</span>
          </Link>

          <span className={styles.divider}>/</span>
          <span className={styles.chapterBadge}>
            {currentLesson.chapterTitle.split(": ")[0]}
          </span>

          <span className={styles.divider}>/</span>
          <span className={styles.lessonIndexBadge}>
            Bài {currentIndex} / {totalLessons}
          </span>
        </div>

        <div className={styles.contextRight}>
          {/* Progress Pill */}
          <div className={styles.progressPill}>
            <span className={styles.progressMiniRing}>{progressPercent}%</span>
            <span>Đã học {completedCount}/{totalLessons} bài</span>
          </div>

          {/* Notes Button */}
          <button
            type="button"
            onClick={() => setShowNotesDrawer(true)}
            className={styles.toolBtn}
            title="Ghi chú cá nhân cho bài học này"
          >
            <Edit3 size={13} color="#8b4513" />
            <span>Ghi chú</span>
          </button>

          {/* Guide / Help Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className={styles.toolBtn}
            title="Hướng dẫn phương pháp học"
          >
            <HelpCircle size={13} />
            <span>Hướng dẫn</span>
          </button>

          {/* Mark Complete Button */}
          <button
            type="button"
            onClick={toggleCompleteCurrent}
            className={`${styles.completeBtn} ${isCurrentCompleted ? styles.completeBtnDone : ""}`}
            title="Đánh dấu bài học này đã hoàn thành"
          >
            <Check size={13} />
            <span>{isCurrentCompleted ? "✓ Đã hoàn thành" : "Đánh dấu đã học"}</span>
          </button>

          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={() => setShowTracks(!showTracks)}
            className={styles.toolBtn}
            title={showTracks ? "Thu gọn mục lục bài học" : "Mở mục lục bài học"}
          >
            <List size={13} />
            <span>{showTracks ? "Ẩn mục lục" : "Hiện mục lục"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. MAIN TWO-COLUMN SPLIT LAYOUT (CANVAS + SIDEBAR)
         ========================================================= */}
      <div className={`${styles.splitLayout} ${showTracks ? styles.splitLayoutWithSidebar : ""}`}>
        {/* Left / Center Canvas */}
        <div className={styles.mainCanvas}>
          {/* Video Player or Reading Hero */}
          {currentLesson.videoUrl ? (
            <div className={styles.videoWrapper}>
              <div className={styles.videoStage}>
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className={styles.videoIframe}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className={styles.readingHeroHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "rgba(217, 130, 54, 0.12)", color: "#8b4513" }}>
                  {currentLesson.type === "star_practice" ? "Bài thực hành STAR" : currentLesson.type === "mock_simulation" ? "Phỏng vấn thử AI" : "Tài liệu chuyên sâu"}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {currentLesson.durationMinutes} phút học
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.3 }}>
                {currentLesson.title}
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
                {currentLesson.chapterTitle}
              </p>
            </div>
          )}

          {/* Tab Switcher */}
          <div className={styles.tabBar}>
            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`${styles.tabBtn} ${activeTab === "guide" ? styles.tabBtnActive : ""}`}
            >
              <BookOpen size={14} />
              <span>Nội Dung &amp; Phân Tích</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("practice")}
              className={`${styles.tabBtn} ${activeTab === "practice" ? styles.tabBtnActive : ""}`}
            >
              <Sparkles size={14} color="#d98236" />
              <span>Thực Hành Cùng AI Coach</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`${styles.tabBtn} ${activeTab === "notes" ? styles.tabBtnActive : ""}`}
            >
              <Edit3 size={14} />
              <span>Bóc Băng &amp; Ghi Chú</span>
            </button>
          </div>

          {/* TAB 1: GUIDE */}
          {activeTab === "guide" && (
            <div className={styles.contentCard}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px" }}>
                  {currentLesson.title}
                </h2>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                  Chương trình chuẩn hóa phỏng vấn quốc tế · Biên soạn bởi chuyên gia Big Tech
                </span>
              </div>

              {/* Core Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ margin: 0 }}>
                  Trong bài học này, chúng ta sẽ tập trung vào phương pháp tiếp cận có hệ thống để trả lời các câu hỏi phỏng vấn hóc búa nhất. Các phỏng vấn viên cấp cao tại Google, Meta, Stripe không tìm kiếm một câu trả lời học vẹt, mà họ đánh giá <strong>tư duy giải quyết vấn đề (Problem-Solving Framework)</strong>, năng lực làm chủ tình huống và độ đĩnh đạc khi giao tiếp.
                </p>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#8b4513", margin: "12px 0 6px" }}>
                  1. Khung Tư Duy 3 Bước (3-Step Execution Framework)
                </h3>
                <ul style={{ paddingLeft: 20, margin: "0 0 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>
                    <strong>Bước 1 (Clarify &amp; Scope):</strong> Đặt câu hỏi làm rõ các giả định và phạm vi trước khi đưa ra câu trả lời. Xác định rõ các giới hạn kỹ thuật (Constraints) và chỉ số thành công.
                  </li>
                  <li>
                    <strong>Bước 2 (High-Level Architecture / Strategy):</strong> Trình bày bức tranh tổng thể và chiến lược tiếp cận trước khi đi vào chi tiết, chứng minh khả năng bao quát toàn diện.
                  </li>
                  <li>
                    <strong>Bước 3 (Trade-offs &amp; Quantified Impact):</strong> Phân tích các đánh đổi (Trade-offs) giữa các phương án và dẫn chứng số liệu định lượng cụ thể.
                  </li>
                </ul>

                {/* Key Takeaways Box */}
                <div style={{ padding: "20px 24px", borderRadius: 16, background: "#f0fdf4", border: "1.5px solid #bbf7d0", margin: "20px 0" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14.5, fontWeight: 800, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                    <Lightbulb size={16} /> Điểm Mấu Chốt Cần Ghi Nhớ (Key Takeaways):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#14532d", lineHeight: 1.65 }}>
                    {currentLesson.keyTakeaways?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Pitfalls Box */}
                <div style={{ padding: "20px 24px", borderRadius: 16, background: "#fffaf5", border: "1.5px solid #fed7aa", margin: "20px 0" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14.5, fontWeight: 800, color: "#c2410c", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={16} /> Các Lỗi Phổ Biến Cần Tránh (Common Pitfalls):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#7c2d12", lineHeight: 1.65 }}>
                    {currentLesson.pitfalls?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRACTICE WITH AI */}
          {activeTab === "practice" && (
            <div className={styles.contentCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Sparkles size={20} color="#d98236" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>
                    Bài Tập Tình Huống Thực Chiến Cùng AI Coach
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                    Áp dụng ngay kiến thức vừa học vào trả lời câu hỏi phỏng vấn chuẩn hóa.
                  </p>
                </div>
              </div>

              {/* Practice Prompt Card */}
              {currentLesson.practiceQuestion && (
                <div style={{ padding: 22, borderRadius: 18, background: "rgba(245, 239, 230, 0.45)", border: "1.5px solid rgba(106, 72, 49, 0.16)", marginBottom: 24 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513", textTransform: "uppercase" }}>
                    Đề Bài Phỏng Vấn Thực Tế
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "8px 0 8px" }}>
                    {currentLesson.practiceQuestion.prompt}
                  </h4>
                  <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 16px", fontStyle: "italic" }}>
                    <strong>Mục tiêu:</strong> {currentLesson.practiceQuestion.intent}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 18 }}>
                    <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>S - Situation:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starSituation}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>T - Task:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starTask}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>A - Action:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starAction}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>R - Result:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starResult}</span>
                    </div>
                  </div>

                  <Link
                    href="/practice"
                    className={styles.completeBtn}
                    style={{ background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#ffffff", textDecoration: "none", padding: "10px 20px" }}
                  >
                    <Mic size={14} />
                    <span>Luyện Phỏng Vấn Thử Câu Này Cùng AI Coach</span>
                  </Link>
                </div>
              )}

              {/* In-lesson Quiz */}
              {currentLesson.quiz && (
                <div style={{ padding: 22, borderRadius: 18, background: "#ffffff", border: "1.5px solid rgba(106, 72, 49, 0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <HelpCircle size={16} color="#d98236" />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#8b4513" }}>
                      Trắc Nghiệm Kiểm Tra Kiến Thức
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>
                    {currentLesson.quiz.question}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentLesson.quiz.options.map((opt) => {
                      const isChosen = selectedQuizOpt === opt.id;
                      let bg = "#fafaf9";
                      let border = "1px solid #e7e5e4";

                      if (isQuizSubmitted) {
                        if (opt.isCorrect) {
                          bg = "#ecfdf5";
                          border = "1.5px solid #10b981";
                        } else if (isChosen) {
                          bg = "#fef2f2";
                          border = "1.5px solid #ef4444";
                        }
                      } else if (isChosen) {
                        bg = "rgba(217, 130, 54, 0.1)";
                        border = "1.5px solid #d98236";
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => !isQuizSubmitted && setSelectedQuizOpt(opt.id)}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: bg,
                            border: border,
                            cursor: isQuizSubmitted ? "default" : "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: isChosen ? "#d98236" : "#e7e5e4",
                                color: isChosen ? "#ffffff" : "var(--ink)",
                                fontWeight: 800,
                                fontSize: 10.5,
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              {opt.id}
                            </span>
                            <span style={{ fontWeight: 600 }}>{opt.text}</span>
                          </div>
                          {isQuizSubmitted && (
                            <p style={{ margin: "4px 0 0 30px", fontSize: 11.5, color: opt.isCorrect ? "#065f46" : "#991b1b" }}>
                              {opt.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!isQuizSubmitted && (
                    <button
                      type="button"
                      disabled={!selectedQuizOpt}
                      onClick={() => setIsQuizSubmitted(true)}
                      className={styles.toolBtn}
                      style={{ marginTop: 14, background: "#8b4513", color: "#ffffff", border: "none", padding: "8px 18px" }}
                    >
                      <span>Kiểm Tra Đáp Án</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSCRIPT & NOTES */}
          {activeTab === "notes" && (
            <div className={styles.contentCard}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                {/* Transcript */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} color="#d98236" />
                    <span>Nội Dung Bóc Băng Bài Giảng</span>
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentLesson.transcript?.map((t, idx) => (
                      <div key={idx} style={{ padding: 12, borderRadius: 12, background: "#fafaf9", border: "1px solid #e7e5e4" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#d98236", display: "inline-block", marginBottom: 4 }}>
                          [{t.time}]
                        </span>
                        <p style={{ margin: "0 0 4px", fontSize: 12.5, color: "var(--ink)", lineHeight: 1.5 }}>
                          {t.textVi}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-muted)", fontStyle: "italic" }}>
                          {t.textEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Notes */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Edit3 size={16} color="#d98236" />
                    <span>Ghi Chú Cá Nhân Của Bạn</span>
                  </h3>
                  <textarea
                    rows={12}
                    value={personalNote}
                    onChange={(e) => handleSaveNote(e.target.value)}
                    placeholder="Ghi lại những ý tưởng hoặc câu trả lời đúc kết... (Tự động lưu vào trình duyệt)"
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 12,
                      border: "1px solid rgba(106, 72, 49, 0.2)",
                      background: "#fafaf9",
                      fontSize: 13,
                      lineHeight: 1.6,
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--ink-muted)" }}>
                    <span>✓ Tự động lưu tức thời</span>
                    <button
                      type="button"
                      onClick={() => handleSaveNote("")}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 11 }}
                    >
                      Xóa ghi chú
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom In-Flow Navigation Bar */}
          <div className={styles.bottomNavBar}>
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && router.push(prevLesson.href)}
              className={styles.navStepBtn}
            >
              <ChevronLeft size={16} />
              <span>BÀI TRƯỚC</span>
            </button>

            <button
              type="button"
              onClick={toggleCompleteCurrent}
              className={`${styles.completeBtn} ${isCurrentCompleted ? styles.completeBtnDone : ""}`}
            >
              <Check size={14} />
              <span>{isCurrentCompleted ? "✓ Đã hoàn thành bài này" : "Đánh dấu hoàn thành"}</span>
            </button>

            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && router.push(nextLesson.href)}
              className={`${styles.navStepBtn} ${styles.navStepBtnPrimary}`}
            >
              <span>BÀI TIẾP THEO</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* =========================================================
            3. RIGHT TRACKS SIDEBAR (Course Playlist)
           ========================================================= */}
        {showTracks && (
          <aside className={styles.tracksSidebar}>
            <div className={styles.tracksHeader}>
              <h2 className={styles.tracksHeading}>Nội dung khóa học</h2>
              <button
                type="button"
                onClick={() => setShowTracks(false)}
                className={styles.closeTracksBtn}
                title="Đóng thanh nội dung"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search inside tracks */}
            <div className={styles.tracksSearchBox}>
              <Search size={13} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)" }} />
              <input
                type="text"
                placeholder="Tìm bài học trong khóa..."
                value={tracksSearch}
                onChange={(e) => setTracksSearch(e.target.value)}
                className={styles.tracksSearchInput}
              />
            </div>

            {/* Chapters & Lessons Accordion List */}
            <div className={styles.tracksBody}>
              {filteredSections.map((sec, secIdx) => {
                const isOpen = openChapterId === sec.id || tracksSearch.trim().length > 0;
                const chapterDone = sec.lessons.filter((l) => completedIds.has(l.id)).length;

                return (
                  <div key={sec.id} className={styles.trackItemWrapper}>
                    <button
                      type="button"
                      onClick={() => setOpenChapterId(isOpen ? "" : sec.id)}
                      className={`${styles.trackItemHeader} ${isOpen ? styles.trackItemHeaderOpen : ""}`}
                    >
                      <div style={{ flex: 1, paddingRight: 6 }}>
                        <div className={styles.trackItemTitle}>
                          {sec.title}
                        </div>
                        <div className={styles.trackItemStats}>
                          {chapterDone}/{sec.lessons.length} bài | {sec.lessons.reduce((acc, l) => acc + l.durationMinutes, 0)} phút
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={15} color="#8b4513" /> : <ChevronDown size={15} color="#8b4513" />}
                    </button>

                    {isOpen && (
                      <div className={styles.stepList}>
                        {sec.lessons.map((lesson, lIdx) => {
                          const isActive = lesson.id === currentLesson.id;
                          const isDone = completedIds.has(lesson.id);

                          return (
                            <Link
                              key={lesson.id}
                              href={lesson.href}
                              className={`${styles.stepItem} ${isActive ? styles.stepItemActive : ""}`}
                            >
                              <div className={styles.stepItemLeft}>
                                {isDone ? (
                                  <span className={styles.stepCheckCircle}>✓</span>
                                ) : isActive ? (
                                  <span className={styles.stepActiveIcon}>▶</span>
                                ) : (
                                  <span className={styles.stepPendingIcon} />
                                )}

                                <span className={styles.stepTitle}>
                                  {secIdx + 1}.{lIdx + 1} {lesson.title}
                                </span>
                              </div>

                              <span className={styles.stepDuration}>
                                {lesson.durationMinutes}p
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Slide-over Notes Drawer */}
      {showNotesDrawer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowNotesDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              height: "100%",
              background: "#ffffff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid rgba(106,72,49,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={18} color="#d98236" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Ghi Chú Bài Học</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "12px 0 16px" }}>
              Ghi lại những điểm cần lưu ý khi phỏng vấn hoặc các câu trả lời bạn tự đúc kết. Dữ liệu được lưu trữ trực tiếp trên thiết bị của bạn.
            </p>

            <textarea
              rows={16}
              value={personalNote}
              onChange={(e) => handleSaveNote(e.target.value)}
              placeholder="Nhập ghi chú cá nhân của bạn cho bài học này..."
              style={{
                width: "100%",
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: "1px solid rgba(106,72,49,0.2)",
                fontSize: 13,
                lineHeight: 1.6,
                outline: "none",
                resize: "none",
                background: "#fafaf9",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14 }}>
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>✓ Đã tự động lưu</span>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                className={styles.toolBtn}
                style={{ height: 32, fontSize: 11.5 }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Help Modal */}
      {showHelpModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#ffffff",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Hướng Dẫn Học Tập &amp; Luyện Phỏng Vấn</h3>
              <button type="button" onClick={() => setShowHelpModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 20px" }}>
              <li><strong>Xem video / đọc bài:</strong> Nắm chắc khung tư duy 3 bước và các mẫu câu hỏi phỏng vấn chuẩn hóa.</li>
              <li><strong>Thực hành STAR:</strong> Tại mỗi bài tập tình huống, hãy phác thảo nhanh 4 yếu tố: Bối cảnh, Nhiệm vụ, Hành động, Kết quả.</li>
              <li><strong>Phỏng vấn thử cùng AI:</strong> Bấm nút mic để vào phòng giả lập, trả lời trực tiếp bằng giọng nói để AI đo tốc độ WPM và chấm điểm Rubric.</li>
              <li><strong>Đánh dấu hoàn thành:</strong> Bấm nút hoàn thành trên thanh công cụ để hệ thống ghi nhận tiến độ vào chứng chỉ của bạn.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className={styles.toolBtn}
              style={{ width: "100%", justifyContent: "center", background: "#8b4513", color: "#ffffff", border: "none", height: 38 }}
            >
              Đã hiểu, tiếp tục học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
