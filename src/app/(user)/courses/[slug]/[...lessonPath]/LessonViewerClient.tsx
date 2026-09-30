"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  HelpCircle,
  Mic,
  Star,
  CheckCircle2,
  Clock,
  Compass,
  Sparkles,
  BookOpen,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  PanelRightClose,
  PanelRightOpen,
  Edit3,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { resolveLesson, type LessonContext, type ResolvedLesson } from "@/data/lessonResolver";
import styles from "./lessonViewer.module.css";

interface LessonViewerClientProps {
  slug: string;
  lessonPath: string[];
}

export default function LessonViewerClient({ slug, lessonPath }: LessonViewerClientProps) {
  const router = useRouter();

  const context: LessonContext = useMemo(() => {
    return resolveLesson(slug, lessonPath);
  }, [slug, lessonPath]);

  const { course, currentLesson, allSections, flattenedLessons, currentIndex, totalLessons, prevLesson, nextLesson } = context;

  const [activeTab, setActiveTab] = useState<"guide" | "notes" | "practice">("guide");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [sidebarSearch, setSidebarSearch] = useState<string>("");
  const [openChapterId, setOpenChapterId] = useState<string>(currentLesson.chapterId);

  const storageKey = `completed_lessons_${slug}`;
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const noteKey = `lesson_note_${slug}_${currentLesson.id}`;
  const [personalNote, setPersonalNote] = useState<string>("");

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

  const progressPercent = Math.round((completedIds.size / Math.max(1, totalLessons)) * 100);
  const isCurrentCompleted = completedIds.has(currentLesson.id);

  const filteredSections = useMemo(() => {
    if (!sidebarSearch.trim()) return allSections;
    const kw = sidebarSearch.trim().toLowerCase();
    return allSections
      .map((sec) => ({
        ...sec,
        lessons: sec.lessons.filter((l) => l.title.toLowerCase().includes(kw)),
      }))
      .filter((sec) => sec.lessons.length > 0);
  }, [allSections, sidebarSearch]);

  return (
    <div className={styles.pageShell}>
      {/* Top Sticky Navigation Bar */}
      <div className={styles.topNav}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/courses/${slug}`} className={styles.backBtn}>
            <ArrowLeft size={13} />
            <span>Về Lộ Trình: {course.title.split(" (")[0]}</span>
          </Link>
          <div className={styles.navMiddle}>
            <span style={{ color: "var(--ink-muted)" }}>•</span>
            <span>{currentLesson.chapterTitle.split(": ")[0]}</span>
            <span style={{ color: "var(--ink-muted)" }}>•</span>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>
              Bài {currentIndex} / {totalLessons}
            </span>
          </div>
        </div>

        <div className={styles.navControls}>
          {/* Progress Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginRight: 6 }}>
            <span>Đã học {completedIds.size}/{totalLessons} ({progressPercent}%)</span>
            <div style={{ width: 48, height: 6, borderRadius: 999, background: "#e7e5e4", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "#10b981", borderRadius: 999 }} />
            </div>
          </div>

          {/* Mark Complete Button */}
          <button
            type="button"
            onClick={toggleCompleteCurrent}
            className={`${styles.completeBtn} ${isCurrentCompleted ? styles.completeBtnDone : ""}`}
            title="Đánh dấu đã hoàn thành bài học này"
          >
            <Check size={13} />
            <span>{isCurrentCompleted ? "✓ Đã hoàn thành" : "Đánh dấu đã học"}</span>
          </button>

          {/* Prev Lesson Button */}
          <button
            type="button"
            disabled={!prevLesson}
            onClick={() => prevLesson && router.push(prevLesson.href)}
            className={styles.iconBtn}
            title={prevLesson ? `Bài trước: ${prevLesson.title}` : "Đang ở bài đầu tiên"}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Bài trước</span>
          </button>

          {/* Next Lesson Button */}
          <button
            type="button"
            disabled={!nextLesson}
            onClick={() => nextLesson && router.push(nextLesson.href)}
            className={styles.iconBtn}
            style={{ background: nextLesson ? "#8b4513" : "#e7e5e4", color: nextLesson ? "#ffffff" : "#a8a29e", borderColor: "transparent" }}
            title={nextLesson ? `Bài tiếp theo: ${nextLesson.title}` : "Đã đến bài cuối cùng"}
          >
            <span className="hidden sm:inline">Bài tiếp theo</span>
            <ArrowRight size={13} />
          </button>

          {/* Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className={styles.iconBtn}
            title={showSidebar ? "Thu gọn mục lục bài học" : "Mở mục lục bài học"}
          >
            {showSidebar ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            <span className="hidden md:inline">Mục lục</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className={`${styles.splitLayout} ${showSidebar ? styles.splitLayoutWithSidebar : ""}`}>
        {/* Left / Center Canvas */}
        <div className={styles.mainCanvas}>
          {/* Media / Video Card */}
          {currentLesson.videoUrl ? (
            <div className={styles.mediaCard}>
              <div className={styles.videoWrapper}>
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
            <div className={styles.readingHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "rgba(217, 130, 54, 0.12)", color: "#8b4513" }}>
                  {currentLesson.type === "star_practice" ? "Bài thực hành STAR" : currentLesson.type === "mock_simulation" ? "Phỏng vấn thử AI" : "Bài đọc chuyên sâu"}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {currentLesson.durationMinutes} phút đọc &amp; nghiền ngẫm
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.3 }}>
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
              <span>Bóc Băng &amp; Ghi Chú Cá Nhân</span>
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
                  1. Khung Tư Duy Chuẩn Hóa 3 Bước Khi Bắt Đầu
                </h3>
                <ul style={{ paddingLeft: 20, margin: "0 0 8px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <li><strong>Bước 1 (Clarify &amp; Scope):</strong> Đặt câu hỏi làm rõ đề bài trước khi lao vào giải quyết. Xác định rõ ràng các ràng buộc kỹ thuật (Constraints) và mục tiêu đo lường.</li>
                  <li><strong>Bước 2 (High-Level Framework):</strong> Trình bày bức tranh tổng quan và cấu trúc câu trả lời theo các chặng logic. Không nhảy ngay vào chi tiết vụn vặt.</li>
                  <li><strong>Bước 3 (Deep Dive &amp; Trade-offs):</strong> Đào sâu vào giải pháp kỹ thuật, phân tích ưu nhược điểm của các phương án đã xem xét và nêu bật kết quả định lượng.</li>
                </ul>

                {/* Key Takeaways Callout */}
                <div style={{ padding: 20, borderRadius: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", margin: "12px 0" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                    <Lightbulb size={16} /> Điểm Mấu Chốt Cần Ghi Nhớ (Key Takeaways):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#14532d", lineHeight: 1.6 }}>
                    {currentLesson.keyTakeaways?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Pitfalls Callout */}
                <div style={{ padding: 20, borderRadius: 16, background: "#fffaf5", border: "1px solid #fed7aa", margin: "12px 0" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#c2410c", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={16} /> Các Lỗi Thường Gặp Cần Tuyệt Đối Tránh:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#7c2d12", lineHeight: 1.6 }}>
                    {currentLesson.pitfalls?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Next Lesson Link */}
              {nextLesson && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", display: "block" }}>BÀI TIẾP THEO</span>
                    <strong style={{ fontSize: 14, color: "var(--ink)" }}>{nextLesson.title}</strong>
                  </div>
                  <Link
                    href={nextLesson.href}
                    className={styles.completeBtn}
                    style={{ background: "#8b4513", color: "#ffffff", textDecoration: "none", border: "none" }}
                  >
                    <span>Học bài tiếp theo</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
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
                <div style={{ padding: 22, borderRadius: 18, background: "rgba(245, 239, 230, 0.45)", border: "1px solid rgba(106, 72, 49, 0.15)", marginBottom: 24 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513", textTransform: "uppercase" }}>
                    Đề Bài Phỏng Vấn Thực Tế
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "8px 0 10px" }}>
                    {currentLesson.practiceQuestion.prompt}
                  </h4>
                  <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 16px", fontStyle: "italic" }}>
                    <strong>Mục tiêu khảo sát:</strong> {currentLesson.practiceQuestion.intent}
                  </p>

                  {/* STAR Guidance Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 20 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>S - Situation:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starSituation}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>T - Task:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starTask}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>A - Action:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starAction}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                      <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>R - Result:</strong>
                      <span style={{ color: "var(--ink-soft)" }}>{currentLesson.practiceQuestion.starResult}</span>
                    </div>
                  </div>

                  {/* Practice CTAs */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                    <Link
                      href="/practice"
                      className={styles.completeBtn}
                      style={{ background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#ffffff", textDecoration: "none", padding: "10px 20px" }}
                    >
                      <Mic size={14} />
                      <span>Bật Mic Trả Lời Cùng AI Coach</span>
                    </Link>

                    <Link
                      href="/questions"
                      className={styles.backBtn}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                    >
                      <BookOpen size={14} />
                      <span>Luyện Ngân Hàng Câu Hỏi</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Interactive Quiz */}
              {currentLesson.quiz && (
                <div style={{ padding: 22, borderRadius: 18, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <HelpCircle size={16} color="#d98236" />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#8b4513" }}>
                      Kiểm Tra Nhanh Mức Độ Thấu Hiểu
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 16px" }}>
                    {currentLesson.quiz.question}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentLesson.quiz.options.map((opt) => {
                      const isChosen = selectedQuizOpt === opt.id;
                      let optBg = "#fafaf9";
                      let optBorder = "1px solid #e7e5e4";

                      if (isQuizSubmitted) {
                        if (opt.isCorrect) {
                          optBg = "#ecfdf5";
                          optBorder = "1.5px solid #10b981";
                        } else if (isChosen) {
                          optBg = "#fef2f2";
                          optBorder = "1.5px solid #ef4444";
                        }
                      } else if (isChosen) {
                        optBg = "rgba(217, 130, 54, 0.1)";
                        optBorder = "1.5px solid #d98236";
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => !isQuizSubmitted && setSelectedQuizOpt(opt.id)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: optBg,
                            border: optBorder,
                            cursor: isQuizSubmitted ? "default" : "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                            <span
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                background: isChosen ? "#d98236" : "#e7e5e4",
                                color: isChosen ? "#ffffff" : "var(--ink)",
                                fontWeight: 800,
                                fontSize: 11,
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              {opt.id}
                            </span>
                            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{opt.text}</span>
                          </div>

                          {isQuizSubmitted && (
                            <p style={{ margin: "6px 0 0 34px", fontSize: 12, color: opt.isCorrect ? "#065f46" : "#991b1b" }}>
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
                      className={styles.completeBtn}
                      style={{ marginTop: 16, background: "#8b4513", color: "#ffffff", border: "none", padding: "10px 20px" }}
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {/* Transcript */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} color="#d98236" />
                    <span>Nội Dung Bóc Băng Bài Giảng</span>
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    placeholder="Ghi lại những ý tưởng, bài học hoặc kỹ thuật bạn muốn áp dụng... (Tự động lưu vào trình duyệt của bạn)"
                    style={{
                      width: "100%",
                      padding: 16,
                      borderRadius: 14,
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
        </div>

        {/* Right Collapsible Syllabus Sidebar (Course Playlist) */}
        {showSidebar && (
          <aside className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                  Mục Lục Khóa Học
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>
                  {completedIds.size}/{totalLessons} hoàn thành
                </span>
              </div>

              {/* Search Inside Syllabus */}
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)" }} />
                <input
                  type="text"
                  placeholder="Tìm bài học trong khóa..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className={styles.sidebarSearch}
                />
              </div>
            </div>

            {/* Chapters Accordions List */}
            <div className={styles.lessonsListScroll}>
              {filteredSections.map((sec) => {
                const isOpen = openChapterId === sec.id || sidebarSearch.trim().length > 0;
                const chapterCompletedCount = sec.lessons.filter((l) => completedIds.has(l.id)).length;

                return (
                  <div key={sec.id} className={styles.chapterGroup}>
                    <button
                      type="button"
                      onClick={() => setOpenChapterId(isOpen ? "" : sec.id)}
                      className={styles.chapterBtn}
                    >
                      <div style={{ paddingRight: 8 }}>
                        <span style={{ display: "block", fontSize: 12, fontWeight: 800 }}>
                          {sec.title}
                        </span>
                        <span style={{ fontSize: 10.5, color: "var(--ink-muted)", fontWeight: 600 }}>
                          {chapterCompletedCount}/{sec.lessons.length} bài đã học
                        </span>
                      </div>
                      {isOpen ? <ChevronUp size={15} color="#8b4513" /> : <ChevronDown size={15} color="#8b4513" />}
                    </button>

                    {isOpen && (
                      <div>
                        {sec.lessons.map((lesson) => {
                          const isActive = lesson.id === currentLesson.id;
                          const isDone = completedIds.has(lesson.id);

                          return (
                            <Link
                              key={lesson.id}
                              href={lesson.href}
                              className={`${styles.lessonItem} ${isActive ? styles.lessonItemActive : ""}`}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                                {isDone ? (
                                  <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                                ) : lesson.type === "video" ? (
                                  <PlayCircle size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                                ) : (
                                  <FileText size={14} color="#d98236" style={{ flexShrink: 0 }} />
                                )}
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                  {lesson.title}
                                </span>
                              </div>

                              <span style={{ fontSize: 10.5, color: "var(--ink-muted)", flexShrink: 0 }}>
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
    </div>
  );
}
