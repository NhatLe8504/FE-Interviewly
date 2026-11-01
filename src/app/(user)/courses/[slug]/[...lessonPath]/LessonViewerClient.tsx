"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Sparkles,
  BookOpen,
  Search,
  X,
  Edit3,
  HelpCircle,
  List,
  Lock,
  GraduationCap,
} from "lucide-react";
import { courseApi } from "@/services/courseApi";
import { parseVideoUrl } from "@/lib/videoUtils";
import type { CourseDetailOut, LessonOut } from "@/types/course";
import styles from "./lessonViewer.module.css";

interface LessonViewerClientProps {
  slug: string;
  lessonPath: string[];
}

export default function LessonViewerClient({ slug, lessonPath }: LessonViewerClientProps) {
  const router = useRouter();

  const chapterId = lessonPath.length > 0 ? parseInt(lessonPath[0], 10) : NaN;
  const lessonId = lessonPath.length > 1 ? parseInt(lessonPath[1], 10) : NaN;
  const isInvalidUrl = isNaN(chapterId) || isNaN(lessonId);

  const [course, setCourse] = useState<CourseDetailOut | null>(null);
  const [lesson, setLesson] = useState<LessonOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sidebar visibility & tracks search
  const [showTracks, setShowTracks] = useState<boolean>(true);
  const [tracksSearch, setTracksSearch] = useState<string>("");
  const [openChapterId, setOpenChapterId] = useState<number | null>(null);

  // Active Tab: "guide" | "practice" | "notes"
  const [activeTab, setActiveTab] = useState<"guide" | "practice" | "notes">("guide");

  // Local storage completed lessons & notes
  const storageKey = `completed_lessons_${slug}`;
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  // Notes Drawer & Help Modal
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const noteKey = `lesson_note_${slug}_${lessonId}`;
  const [personalNote, setPersonalNote] = useState<string>("");

  useEffect(() => {
    if (isInvalidUrl) {
      setLoading(false);
      setErrorStatus(404);
      setErrorMessage("Đường dẫn bài học không đúng định dạng.");
      return;
    }

    let active = true;
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    Promise.all([
      courseApi.getCourseDetail(slug),
      courseApi.getLesson(slug, lessonId),
    ])
      .then(([courseData, lessonData]) => {
        if (!active) return;
        setCourse(courseData);
        setLesson(lessonData);
        setOpenChapterId(lessonData.chapter_id);
      })
      .catch((err: any) => {
        if (!active) return;
        const status = err?.status || 500;
        setErrorStatus(status);
        setErrorMessage(err?.message || "Không thể tải bài học.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, lessonId, isInvalidUrl]);

  // Load completed state & note from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCompletedIds(new Set(JSON.parse(saved)));

      if (!isNaN(lessonId)) {
        const savedNote = localStorage.getItem(`lesson_note_${slug}_${lessonId}`);
        setPersonalNote(savedNote || "");
      }
    } catch {
      // ignore
    }
  }, [slug, lessonId, storageKey]);

  const toggleCompleteCurrent = () => {
    if (!lesson) return;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lesson.lesson_id)) {
        next.delete(lesson.lesson_id);
      } else {
        next.add(lesson.lesson_id);
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

  // Flattened lessons list across chapters
  const allLessons = useMemo(() => {
    if (!course || !course.chapters) return [];
    const list: LessonOut[] = [];
    for (const ch of course.chapters) {
      if (ch.lessons) {
        for (const ls of ch.lessons) {
          list.push(ls);
        }
      }
    }
    return list;
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!lesson) return -1;
    return allLessons.findIndex((l) => l.lesson_id === lesson.lesson_id);
  }, [allLessons, lesson]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const currentChapter = useMemo(() => {
    if (!course || !lesson) return null;
    return course.chapters.find((ch) => ch.chapter_id === lesson.chapter_id) || null;
  }, [course, lesson]);

  const completedCount = completedIds.size;
  const totalLessons = allLessons.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
  const isCurrentCompleted = lesson ? completedIds.has(lesson.lesson_id) : false;
  const videoInfo = useMemo(() => parseVideoUrl(lesson?.video_url), [lesson?.video_url]);

  // Filtered tracks for sidebar search
  const filteredSections = useMemo(() => {
    if (!course || !course.chapters) return [];
    const kw = tracksSearch.trim().toLowerCase();
    return course.chapters
      .map((sec) => ({
        ...sec,
        lessons: (sec.lessons || []).filter((l) =>
          !kw || l.title.toLowerCase().includes(kw)
        ),
      }))
      .filter((sec) => sec.lessons.length > 0);
  }, [course, tracksSearch]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", color: "var(--ink-soft)" }}>
            <GraduationCap size={44} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Đang tải bài học...</p>
          </div>
        </div>
      </div>
    );
  }

  // Paywall Auth 401
  if (errorStatus === 401) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 460, padding: 32, background: "#fff", borderRadius: 24, border: "1.5px solid rgba(106,72,49,0.15)", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <Lock size={44} color="#d98236" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
              Vui lòng đăng nhập
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              Bài học này yêu cầu đăng nhập tài khoản để lưu trữ tiến trình học tập của bạn.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link
                href={`/auth/login?redirect=/courses/${slug}/${chapterId}/${lessonId}`}
                className={styles.completeBtn}
                style={{ background: "#8b4513", color: "#fff", padding: "10px 24px", textDecoration: "none" }}
              >
                <span>Đăng nhập ngay</span>
              </Link>
              <Link
                href={`/courses/${slug}`}
                className={styles.toolBtn}
                style={{ padding: "10px 18px", textDecoration: "none" }}
              >
                <span>Về trang khóa học</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paywall Pro 403
  if (errorStatus === 403) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 32, background: "#fff", borderRadius: 24, border: "1.5px solid rgba(217, 130, 54, 0.3)", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(217, 130, 54, 0.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <Lock size={32} color="#d98236" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
              Bài học thuộc gói Pro
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              Bài học chuyên sâu và các phân tích kiến trúc này chỉ dành riêng cho tài khoản Pro. Hãy nâng cấp để mở khóa toàn bộ khóa học!
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link
                href="/pricing"
                className={styles.completeBtn}
                style={{ background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#fff", padding: "10px 24px", textDecoration: "none" }}
              >
                <Sparkles size={14} />
                <span>Nâng cấp Pro</span>
              </Link>
              <Link
                href={`/courses/${slug}`}
                className={styles.toolBtn}
                style={{ padding: "10px 18px", textDecoration: "none" }}
              >
                <span>Về trang khóa học</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / 404
  if (errorStatus || !lesson || !course) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 32 }}>
            <GraduationCap size={44} style={{ color: "#c2410c", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
              Không tìm thấy bài học
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              {errorMessage || "Bài học không tồn tại hoặc đã được chuyển sang chương mục khác."}
            </p>
            <Link
              href={`/courses/${slug}`}
              className={styles.completeBtn}
              style={{ background: "#8b4513", color: "#fff", padding: "10px 24px", textDecoration: "none" }}
            >
              <span>Xem giáo trình khóa học</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageShell}>
      {/* =========================================================
          1. INLINE CONTEXT TOOLBAR (REPLACES FIXED TOP HEADER)
         ========================================================= */}
      <div className={styles.contextBar}>
        <div className={styles.contextLeft}>
          <Link
            href={`/courses/${slug}`}
            className={styles.backBtn}
            title="Quay lại trang chi tiết khóa học"
          >
            <ArrowLeft size={13} />
            <span>Về lộ trình</span>
          </Link>

          <span className={styles.divider}>/</span>
          <span className={styles.chapterBadge}>
            {currentChapter?.title || "Chương"}
          </span>

          <span className={styles.divider}>/</span>
          <span className={styles.lessonIndexBadge}>
            Bài {currentIndex + 1} / {totalLessons}
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
            <span>Ghi chú {personalNote ? "(1)" : ""}</span>
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
          {videoInfo ? (
            <div className={styles.videoWrapper}>
              <div className={styles.videoStage}>
                {videoInfo.isIframe ? (
                  <iframe
                    src={videoInfo.embedUrl}
                    title={lesson.title}
                    className={styles.videoIframe}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoInfo.embedUrl}
                    controls
                    playsInline
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className={styles.readingHeroHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "rgba(217, 130, 54, 0.12)",
                    color: "#8b4513",
                    textTransform: "uppercase",
                  }}
                >
                  {lesson.type === "star_practice" ? "Bài thực hành STAR" : lesson.type === "video" ? "Video bài giảng" : "Tài liệu chuyên sâu"}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {lesson.duration_minutes} phút học
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.3 }}>
                {lesson.title}
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
                {currentChapter?.title}
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
              <span>Ghi Chú &amp; Hướng Dẫn</span>
            </button>
          </div>

          {/* TAB 1: GUIDE */}
          {activeTab === "guide" && (
            <div className={styles.contentCard}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px" }}>
                  {lesson.title}
                </h2>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                  Chương trình chuẩn hóa phỏng vấn quốc tế · Biên soạn bởi chuyên gia Big Tech
                </span>
              </div>

              {/* Core Content */}
              {lesson.content_html ? (
                <div
                  style={{ fontSize: 14.5, lineHeight: 1.8, color: "var(--ink)" }}
                  dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                />
              ) : (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-soft)" }}>
                  <p>Nội dung bài học đang được cập nhật thêm tài liệu chi tiết.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRACTICE */}
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

              {lesson.practice_question ? (
                <div style={{ padding: 22, borderRadius: 18, background: "rgba(245, 239, 230, 0.45)", border: "1.5px solid rgba(106, 72, 49, 0.16)", marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513", textTransform: "uppercase" }}>
                    Đề Bài Phỏng Vấn Thực Tế
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "8px 0" }}>
                    {lesson.practice_question.title || lesson.practice_question.prompt || lesson.title}
                  </h4>

                  {lesson.practice_question.intent && (
                    <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 16px", fontStyle: "italic" }}>
                      <strong>Mục tiêu:</strong> {lesson.practice_question.intent}
                    </p>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 18 }}>
                    {lesson.practice_question.starSituation && (
                      <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                        <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>S - Situation:</strong>
                        <span style={{ color: "var(--ink-soft)" }}>{lesson.practice_question.starSituation}</span>
                      </div>
                    )}
                    {lesson.practice_question.starTask && (
                      <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                        <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>T - Task:</strong>
                        <span style={{ color: "var(--ink-soft)" }}>{lesson.practice_question.starTask}</span>
                      </div>
                    )}
                    {lesson.practice_question.starAction && (
                      <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                        <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>A - Action:</strong>
                        <span style={{ color: "var(--ink-soft)" }}>{lesson.practice_question.starAction}</span>
                      </div>
                    )}
                    {lesson.practice_question.starResult && (
                      <div style={{ padding: 12, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 12 }}>
                        <strong style={{ color: "#d98236", display: "block", marginBottom: 3 }}>R - Result:</strong>
                        <span style={{ color: "var(--ink-soft)" }}>{lesson.practice_question.starResult}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", background: "rgba(245, 239, 230, 0.3)", borderRadius: 16, border: "1px dashed rgba(106, 72, 49, 0.2)" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
                    Bài tập tình huống và phân tích STAR cho bài học này đang được tổng hợp. Hãy chuyển sang bài kế tiếp để làm bài tập có câu hỏi thực chiến!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === "notes" && (
            <div className={styles.contentCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Ghi Chú Cá Nhân</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                    Lưu trữ trên thiết bị của bạn · Tự động ghi nhớ cho bài học này.
                  </p>
                </div>
              </div>

              <textarea
                rows={10}
                value={personalNote}
                onChange={(e) => handleSaveNote(e.target.value)}
                placeholder="Nhập các điểm mấu chốt, công thức kỹ thuật hoặc câu trả lời tự đúc kết..."
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid rgba(106, 72, 49, 0.2)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "vertical",
                  background: "#fafaf9",
                  fontFamily: "inherit",
                }}
              />
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600, display: "block", marginTop: 8 }}>
                ✓ Đã tự động lưu trên trình duyệt này
              </span>
            </div>
          )}

          {/* Bottom In-Flow Navigation Bar */}
          <div className={styles.bottomNavBar}>
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && router.push(`/courses/${slug}/${prevLesson.chapter_id}/${prevLesson.lesson_id}`)}
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
              onClick={() => nextLesson && router.push(`/courses/${slug}/${nextLesson.chapter_id}/${nextLesson.lesson_id}`)}
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
              <Search
                size={13}
                style={{
                  position: "absolute",
                  left: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-muted)",
                }}
              />
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
                const isOpen = openChapterId === sec.chapter_id || tracksSearch.trim().length > 0;
                const chapterDone = (sec.lessons || []).filter((l) => completedIds.has(l.lesson_id)).length;
                const chapterMinutes = (sec.lessons || []).reduce(
                  (acc, l) => acc + (l.duration_minutes || 0),
                  0
                );

                return (
                  <div key={sec.chapter_id} className={styles.trackItemWrapper}>
                    <button
                      type="button"
                      onClick={() => setOpenChapterId(isOpen ? null : sec.chapter_id)}
                      className={`${styles.trackItemHeader} ${isOpen ? styles.trackItemHeaderOpen : ""}`}
                    >
                      <div style={{ flex: 1, paddingRight: 6 }}>
                        <div className={styles.trackItemTitle}>{sec.title}</div>
                        <div className={styles.trackItemStats}>
                          {chapterDone}/{sec.lessons.length} bài | {chapterMinutes} phút
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={15} color="#8b4513" />
                      ) : (
                        <ChevronDown size={15} color="#8b4513" />
                      )}
                    </button>

                    {isOpen && (
                      <div className={styles.stepList}>
                        {sec.lessons.map((ls, lIdx) => {
                          const isActive = ls.lesson_id === lesson.lesson_id;
                          const isDone = completedIds.has(ls.lesson_id);

                          return (
                            <Link
                              key={ls.lesson_id}
                              href={`/courses/${slug}/${sec.chapter_id}/${ls.lesson_id}`}
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
                                  {secIdx + 1}.{lIdx + 1} {ls.title}
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                {ls.is_free ? (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: "#166534",
                                      background: "#dcfce7",
                                      padding: "1px 5px",
                                      borderRadius: 4,
                                    }}
                                  >
                                    Học thử
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: "var(--ink-muted)",
                                      background: "rgba(106,72,49,0.08)",
                                      padding: "1px 5px",
                                      borderRadius: 4,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    <Lock size={9} /> Pro
                                  </span>
                                )}
                                <span className={styles.stepDuration}>
                                  {ls.duration_minutes}p
                                </span>
                              </div>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 16,
                borderBottom: "1px solid rgba(106,72,49,0.12)",
              }}
            >
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
                fontFamily: "inherit",
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
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 20px" }}>
              <li><strong>Xem video / đọc bài:</strong> Nắm chắc khung tư duy và các câu hỏi phỏng vấn chuẩn hóa.</li>
              <li><strong>Thực hành STAR:</strong> Tại mỗi bài tập tình huống, hãy phác thảo 4 yếu tố: Bối cảnh (S), Nhiệm vụ (T), Hành động (A), Kết quả (R).</li>
              <li><strong>Ghi chú cá nhân:</strong> Sử dụng ngăn ghi chú để đúc kết kinh nghiệm thực tế của chính bạn.</li>
              <li><strong>Đánh dấu hoàn thành:</strong> Bấm nút hoàn thành trên thanh công cụ để hệ thống ghi nhận tiến độ của bạn.</li>
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
