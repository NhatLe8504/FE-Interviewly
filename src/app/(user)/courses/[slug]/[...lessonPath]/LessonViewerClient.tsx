"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  Lock,
  Search,
  X,
  Edit3,
  RotateCcw,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { courseApi } from "@/services/courseApi";
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

  // Sidebar visibility & search
  const [showTracks, setShowTracks] = useState<boolean>(true);
  const [tracksSearch, setTracksSearch] = useState<string>("");
  const [openChapterIds, setOpenChapterIds] = useState<Set<number>>(new Set());

  // Active Tab: "content" | "practice"
  const [activeTab, setActiveTab] = useState<"content" | "practice">("content");

  // Local storage completed lessons & personal notes (Gate G3, P4)
  const storageKey = `completed_lessons_${slug}`;
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
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
        setOpenChapterIds(new Set([lessonData.chapter_id]));
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

  // Load local completed states and notes
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

  const toggleChapterAccordion = (chId: number) => {
    setOpenChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) {
        next.delete(chId);
      } else {
        next.add(chId);
      }
      return next;
    });
  };

  const completedCount = completedIds.size;
  const totalLessons = allLessons.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
  const isCurrentCompleted = lesson ? completedIds.has(lesson.lesson_id) : false;

  // Render Loading
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

  // Render Paywall / Auth Guards
  if (errorStatus === 401) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 460, padding: 32, background: "#fff", borderRadius: 24, border: "1.5px solid rgba(106,72,49,0.15)" }}>
            <Lock size={44} color="#d98236" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
              Vui lòng đăng nhập
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              Bài học này yêu cầu tài khoản để tiếp tục. Hãy đăng nhập để lưu trữ tiến trình học tập của bạn.
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

  if (errorStatus === 403) {
    return (
      <div className={styles.pageShell}>
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 32, background: "#fff", borderRadius: 24, border: "1.5px solid rgba(217, 130, 54, 0.3)" }}>
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

  // Render 404 / Error
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
      {/* 1. Context Toolbar */}
      <div className={styles.contextBar}>
        <div className={styles.contextLeft}>
          <Link href={`/courses/${slug}`} className={styles.backBtn} title="Quay lại chi tiết khóa học">
            <ArrowLeft size={13} />
            <span>Giáo trình</span>
          </Link>
          <span className={styles.divider}>/</span>
          {currentChapter && (
            <span className={styles.chapterBadge}>{currentChapter.title}</span>
          )}
          <span className={styles.divider}>/</span>
          <span className={styles.lessonIndexBadge}>
            Bài {currentIndex + 1}/{totalLessons}
          </span>
        </div>

        <div className={styles.contextRight}>
          <div className={styles.progressPill}>
            <span>Tiến độ:</span>
            <span className={styles.progressMiniRing}>{progressPercent}%</span>
          </div>

          <button
            type="button"
            onClick={() => setShowNotesDrawer(true)}
            className={styles.toolBtn}
            title="Ghi chú cá nhân"
          >
            <Edit3 size={13} />
            <span>Ghi chú {personalNote ? "(1)" : ""}</span>
          </button>

          <button
            type="button"
            onClick={toggleCompleteCurrent}
            className={`${styles.completeBtn} ${isCurrentCompleted ? styles.completeBtnDone : ""}`}
          >
            <CheckCircle2 size={14} />
            <span>{isCurrentCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Split Layout */}
      <div className={`${styles.splitLayout} ${showTracks ? styles.splitLayoutWithSidebar : ""}`}>
        {/* Main Canvas */}
        <div className={styles.mainCanvas}>
          {/* Video Player (if video_url is available) */}
          {lesson.video_url && (
            <div className={styles.videoWrapper}>
              <div className={styles.videoStage}>
                {lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be") ? (
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className={styles.videoIframe}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={lesson.video_url}
                    controls
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Reading Header (if no video) */}
          {!lesson.video_url && (
            <div className={styles.readingHeroHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(217, 130, 54, 0.12)",
                    color: "#8b4513",
                  }}
                >
                  {lesson.type}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  Thời lượng dự kiến ~{lesson.duration_minutes} phút
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                {lesson.title}
              </h1>
            </div>
          )}

          {/* Tab Switcher */}
          <div className={styles.tabBar}>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`${styles.tabBtn} ${activeTab === "content" ? styles.tabBtnActive : ""}`}
            >
              <FileText size={15} />
              <span>Nội dung bài học</span>
            </button>

            {lesson.practice_question && (
              <button
                type="button"
                onClick={() => setActiveTab("practice")}
                className={`${styles.tabBtn} ${activeTab === "practice" ? styles.tabBtnActive : ""}`}
              >
                <Sparkles size={15} />
                <span>Bài tập thực hành (STAR)</span>
              </button>
            )}
          </div>

          {/* TAB 1: CONTENT */}
          {activeTab === "content" && (
            <div className={styles.contentCard}>
              {lesson.video_url && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>
                    {lesson.title}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--ink-soft)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> ~{lesson.duration_minutes} phút học
                    </span>
                    {lesson.is_free && (
                      <span style={{ color: "#166534", fontWeight: 700 }}>Học thử miễn phí</span>
                    )}
                  </div>
                </div>
              )}

              {/* HTML Content */}
              {lesson.content_html ? (
                <div
                  style={{ fontSize: 15, lineHeight: 1.8, color: "var(--ink)" }}
                  dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                />
              ) : (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-soft)" }}>
                  <p>Nội dung bài học dạng văn bản đang được cập nhật.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAR PRACTICE */}
          {activeTab === "practice" && lesson.practice_question && (
            <div className={styles.contentCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Sparkles size={20} color="#d98236" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>
                    Đề Bài Phỏng Vấn Thực Tế (Khung STAR)
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                    Áp dụng kiến thức bài học vào cấu trúc phân tích tình huống thực chiến.
                  </p>
                </div>
              </div>

              <div style={{ padding: 22, borderRadius: 18, background: "rgba(245, 239, 230, 0.45)", border: "1.5px solid rgba(106, 72, 49, 0.16)", marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513", textTransform: "uppercase" }}>
                  Tình huống mẫu
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "8px 0" }}>
                  {lesson.practice_question.title || lesson.practice_question.prompt || lesson.title}
                </h4>

                {lesson.practice_question.intent && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 16px", fontStyle: "italic" }}>
                    <strong>Mục tiêu câu hỏi:</strong> {lesson.practice_question.intent}
                  </p>
                )}

                {/* STAR breakdown if present */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
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

                {lesson.practice_question.sampleAnswer && (
                  <div style={{ padding: 14, borderRadius: 10, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.1)", fontSize: 13, lineHeight: 1.6 }}>
                    <strong style={{ color: "#166534", display: "block", marginBottom: 4 }}>Gợi ý câu trả lời mẫu:</strong>
                    <p style={{ margin: 0, color: "var(--ink)" }}>{lesson.practice_question.sampleAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prev / Next Navigation Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, paddingTop: 16, borderTop: "1px solid rgba(106,72,49,0.1)" }}>
            {prevLesson ? (
              <Link
                href={`/courses/${slug}/${prevLesson.chapter_id}/${prevLesson.lesson_id}`}
                className={styles.toolBtn}
                style={{ padding: "8px 16px" }}
              >
                <ChevronLeft size={16} />
                <span>Bài trước: {prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${slug}/${nextLesson.chapter_id}/${nextLesson.lesson_id}`}
                className={styles.completeBtn}
                style={{ background: "#8b4513", color: "#fff", padding: "8px 20px" }}
              >
                <span>Bài kế tiếp: {nextLesson.title}</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <Link
                href={`/courses/${slug}`}
                className={styles.completeBtn}
                style={{ background: "#10b981", color: "#fff", padding: "8px 20px" }}
              >
                <CheckCircle2 size={16} />
                <span>Hoàn tất khóa học</span>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar: Curriculum Track Navigation */}
        {showTracks && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div>
                <h3 className={styles.sidebarTitle}>Nội dung khóa học</h3>
                <span className={styles.sidebarSubtitle}>
                  {completedCount}/{totalLessons} bài học hoàn thành
                </span>
              </div>
            </div>

            <div className={styles.sidebarSearchWrap}>
              <Search size={14} className={styles.sidebarSearchIcon} />
              <input
                type="text"
                placeholder="Tìm bài học..."
                value={tracksSearch}
                onChange={(e) => setTracksSearch(e.target.value)}
                className={styles.sidebarSearchInput}
              />
            </div>

            <div className={styles.curriculumScroll}>
              {(course.chapters || []).map((sec, sIdx) => {
                const isOpen = openChapterIds.has(sec.chapter_id);
                const lessons = (sec.lessons || []).filter((l) =>
                  !tracksSearch.trim() || l.title.toLowerCase().includes(tracksSearch.toLowerCase())
                );

                if (tracksSearch.trim() && lessons.length === 0) return null;

                return (
                  <div key={sec.chapter_id} className={styles.secGroup}>
                    <button
                      type="button"
                      onClick={() => toggleChapterAccordion(sec.chapter_id)}
                      className={styles.secGroupHeader}
                    >
                      <div className={styles.secHeaderLeft}>
                        <span className={styles.secIndex}>Chương {sIdx + 1}</span>
                        <span className={styles.secTitle}>{sec.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={styles.secLessonCount}>{lessons.length} bài</span>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className={styles.secLessonsList}>
                        {lessons.map((ls, lIdx) => {
                          const isCurrent = ls.lesson_id === lesson.lesson_id;
                          const isDone = completedIds.has(ls.lesson_id);

                          return (
                            <Link
                              key={ls.lesson_id}
                              href={`/courses/${slug}/${sec.chapter_id}/${ls.lesson_id}`}
                              className={`${styles.navLessonItem} ${isCurrent ? styles.navLessonItemActive : ""}`}
                            >
                              <div className={styles.navItemLeft}>
                                <span
                                  className={`${styles.navCheckRing} ${isDone ? styles.navCheckRingDone : ""}`}
                                >
                                  {isDone && <CheckCircle2 size={13} />}
                                </span>
                                <div className={styles.navItemTextWrap}>
                                  <span className={styles.navItemTitle}>
                                    {sIdx + 1}.{lIdx + 1} {ls.title}
                                  </span>
                                  <div className={styles.navItemMeta}>
                                    <span>{ls.duration_minutes} phút</span>
                                    {ls.is_free ? (
                                      <span style={{ color: "#166534", fontWeight: 700 }}>Học thử</span>
                                    ) : (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                                        <Lock size={9} /> Pro
                                      </span>
                                    )}
                                  </div>
                                </div>
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

      {/* Notes Drawer Modal */}
      {showNotesDrawer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
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
              padding: 24,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>
                  Ghi Chú Cá Nhân
                </h3>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  Lưu trên thiết bị này
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={personalNote}
              onChange={(e) => handleSaveNote(e.target.value)}
              placeholder="Ghi lại các ý tưởng, đánh đổi kiến trúc hoặc điểm cần nhớ cho bài học này..."
              style={{
                flex: 1,
                width: "100%",
                padding: 16,
                borderRadius: 12,
                border: "1.5px solid rgba(106,72,49,0.2)",
                fontSize: 14,
                lineHeight: 1.6,
                resize: "none",
                fontFamily: "inherit",
              }}
            />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                className={styles.completeBtn}
                style={{ background: "#8b4513", color: "#fff" }}
              >
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
