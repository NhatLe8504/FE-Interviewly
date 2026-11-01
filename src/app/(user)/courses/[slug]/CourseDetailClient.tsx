"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Clock,
  Award,
  Layers,
  Building2,
  PlayCircle,
  FileText,
  Check,
  Plus,
  Minus,
  Play,
  Monitor,
  Lock,
  ArrowRight,
  ShieldCheck,
  X,
  RotateCcw,
  GraduationCap,
} from "lucide-react";
import { courseApi } from "@/services/courseApi";
import { parseVideoUrl } from "@/lib/videoUtils";
import type { CourseDetailOut, CourseOut, LessonOut } from "@/types/course";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import styles from "./courseDetail.module.css";

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetailOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseOut[]>([]);

  // Accordion Expand/Collapse All
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<number>>(new Set());

  // Video Preview Modal State
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    courseApi
      .getCourseDetail(slug)
      .then((data) => {
        if (!active) return;
        setCourse(data);
        const allChapterIds = new Set((data.chapters || []).map((ch) => ch.chapter_id));
        setExpandedChapterIds(allChapterIds);

        // Fetch related courses
        courseApi
          .listCourses({ category: data.category, limit: 4 })
          .then((relRes) => {
            if (!active) return;
            setRelatedCourses(
              (relRes.items || []).filter((item) => item.course_id !== data.course_id).slice(0, 3)
            );
          })
          .catch(() => {
            // ignore related course errors
          });
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || "Không thể tải chi tiết khóa học. Khóa học có thể không tồn tại hoặc đã bị ẩn.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  // Flattened lessons in curriculum order
  const flattenedLessons = useMemo(() => {
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

  // Find previewable video lesson
  const previewLesson = useMemo(() => {
    return flattenedLessons.find((ls) => ls.is_free && ls.video_url);
  }, [flattenedLessons]);

  const previewVideoInfo = useMemo(() => parseVideoUrl(previewLesson?.video_url), [previewLesson?.video_url]);

  const firstLesson = flattenedLessons[0];
  const firstLessonUrl = firstLesson
    ? `/courses/${slug}/${firstLesson.chapter_id}/${firstLesson.lesson_id}`
    : `/courses/${slug}`;

  const toggleChapter = (chapterId: number) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const isAllExpanded =
    course && course.chapters
      ? expandedChapterIds.size === course.chapters.length
      : false;

  const toggleAllChapters = () => {
    if (!course || !course.chapters) return;
    if (isAllExpanded) {
      setExpandedChapterIds(new Set());
    } else {
      setExpandedChapterIds(new Set(course.chapters.map((ch) => ch.chapter_id)));
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container} style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", color: "var(--ink-soft)" }}>
            <GraduationCap size={44} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Đang tải lộ trình khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container} style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <GraduationCap size={48} style={{ color: "#c2410c", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
              Không tìm thấy khóa học
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              {error || "Khóa học này hiện không khả dụng hoặc đã bị tắt."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/courses" className={styles.mainEnrollBtn} style={{ textDecoration: "none" }}>
                <span>Quay lại thư viện khóa học</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.detailGrid}>
          {/* =========================================================
              LEFT COLUMN: MAIN CONTENT
             ========================================================= */}
          <main className={styles.mainContent}>
            {/* Header Title & Meta */}
            <div className={styles.headerSection}>
              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseSubtitle}>{course.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaRating}>
                  <BookOpen size={14} className={styles.starIcon} />
                  <span>{course.chapter_count} chương</span>
                </span>
                <span>•</span>
                <span>{course.lesson_count} bài học</span>
                <span>•</span>
                <span>Thời lượng ~{course.estimated_hours} giờ</span>
                <span>•</span>
                <span style={{ color: "#8b4513" }}>{course.level_label || course.level}</span>
              </div>
            </div>

            {/* Section: Bạn sẽ học được gì? (What you will learn) */}
            {course.highlights && course.highlights.length > 0 && (
              <div className={styles.whatYouLearnBox}>
                <h2 className={styles.sectionHeading} style={{ marginBottom: 16 }}>
                  Bạn sẽ học được gì?
                </h2>
                <div className={styles.learnGrid}>
                  {course.highlights.map((item, idx) => (
                    <div key={idx} className={styles.learnItem}>
                      <Check size={16} className={styles.checkIcon} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Nội dung khóa học (Curriculum Accordion) */}
            <div className={styles.sectionBox}>
              <h2 className={styles.sectionHeading}>Nội dung khóa học</h2>

              <div className={styles.curriculumHeader}>
                <div className={styles.curriculumStats}>
                  <strong>{course.chapter_count}</strong> chương <span>•</span>{" "}
                  <strong>{course.lesson_count}</strong> bài học <span>•</span>{" "}
                  Thời lượng <strong>~{course.estimated_hours}</strong> giờ
                </div>

                <button
                  type="button"
                  onClick={toggleAllChapters}
                  className={styles.expandAllBtn}
                >
                  {isAllExpanded ? "Thu nhỏ tất cả" : "Mở rộng tất cả"}
                </button>
              </div>

              {/* Chapters Accordion List */}
              <div className={styles.chapterList}>
                {(course.chapters || []).map((sec, secIdx) => {
                  const isExpanded = expandedChapterIds.has(sec.chapter_id);
                  const lessons = sec.lessons || [];

                  return (
                    <div key={sec.chapter_id} className={styles.chapterCard}>
                      <button
                        type="button"
                        onClick={() => toggleChapter(sec.chapter_id)}
                        className={`${styles.chapterHeader} ${isExpanded ? styles.chapterHeaderActive : ""}`}
                      >
                        <div className={styles.chapterHeaderLeft}>
                          <span className={styles.plusMinusIcon}>
                            {isExpanded ? <Minus size={13} /> : <Plus size={13} />}
                          </span>
                          <span className={styles.chapterTitleText}>
                            {sec.title}
                          </span>
                        </div>

                        <span className={styles.chapterCountBadge}>
                          {lessons.length} bài học
                        </span>
                      </button>

                      {isExpanded && (
                        <div className={styles.lessonsWrapper}>
                          {lessons.map((lesson, lIdx) => {
                            const isVideo = lesson.type === "video";
                            const isStar = lesson.type === "star_practice";

                            return (
                              <Link
                                key={lesson.lesson_id}
                                href={`/courses/${slug}/${sec.chapter_id}/${lesson.lesson_id}`}
                                className={styles.lessonRow}
                              >
                                <div className={styles.lessonRowLeft}>
                                  {isVideo ? (
                                    <PlayCircle size={15} className={styles.lessonIcon} />
                                  ) : isStar ? (
                                    <Sparkles size={15} className={styles.lessonIcon} color="#d98236" />
                                  ) : (
                                    <FileText size={15} className={styles.lessonIcon} />
                                  )}
                                  <span className={styles.lessonTitle}>
                                    {secIdx + 1}.{lIdx + 1} {lesson.title}
                                  </span>
                                  {lesson.is_free ? (
                                    <span className={styles.freeTag}>Học thử</span>
                                  ) : (
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        background: "rgba(106, 72, 49, 0.08)",
                                        color: "var(--ink-soft)",
                                      }}
                                    >
                                      <Lock size={10} /> Pro
                                    </span>
                                  )}
                                </div>

                                <span className={styles.lessonDuration}>
                                  {lesson.duration_minutes}p
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
            </div>

            {/* Section: Kỹ năng & Mục tiêu */}
            {(course.skills?.length > 0 || course.target_companies?.length > 0) && (
              <div className={styles.sectionBox}>
                <h2 className={styles.sectionHeading}>Kỹ năng &amp; Mục tiêu</h2>
                {course.skills?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>
                      Kỹ năng trọng tâm:
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {course.skills.map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "rgba(217, 130, 54, 0.1)",
                            color: "#8b4513",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {course.target_companies?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>
                      Doanh nghiệp mục tiêu:
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {course.target_companies.map((c, idx) => (
                        <span key={idx} className={styles.companyBadge}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section: Khóa học liên quan */}
            {relatedCourses.length > 0 && (
              <div className={styles.sectionBox}>
                <h2 className={styles.sectionHeading}>Khóa học liên quan</h2>
                <div className={styles.relatedGrid}>
                  {relatedCourses.map((rel) => (
                    <Link key={rel.course_id} href={`/courses/${rel.slug}`} className={styles.relatedCard}>
                      <div style={{ height: 130, overflow: "hidden", background: "#211914", position: "relative" }}>
                        {rel.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={rel.image} alt={rel.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <GraduationCap size={36} color="#94a3b8" />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ fontSize: 13.5, fontWeight: 800, margin: "0 0 4px", color: "var(--ink)", lineClamp: 2 }}>
                            {rel.title}
                          </h4>
                          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                            {rel.role}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(106,72,49,0.1)", fontSize: 11, fontWeight: 700 }}>
                          <span style={{ color: "#8b4513" }}>{rel.chapter_count} chương</span>
                          <span style={{ color: "var(--ink-soft)" }}>{rel.lesson_count} bài học</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* =========================================================
              RIGHT COLUMN: STICKY PURCHASE BADGE
             ========================================================= */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -46, right: 24, pointerEvents: "none", zIndex: 5 }}>
              <PageMascot size={52} />
            </div>
            <aside className={styles.stickySidebar}>
              {/* Preview Media Thumbnail */}
              <div
                className={styles.previewMedia}
                onClick={() => previewLesson && setShowVideoModal(true)}
                title={previewLesson ? "Xem video giới thiệu khóa học" : course.title}
                style={{ cursor: previewLesson ? "pointer" : "default" }}
              >
                {course.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={course.image} alt={course.title} className={styles.previewImg} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #1e293b, #334155)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GraduationCap size={48} color="#94a3b8" />
                  </div>
                )}
                {previewLesson && (
                  <div className={styles.previewOverlay}>
                    <div className={styles.playCircleBtn}>
                      <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />
                    </div>
                    <span className={styles.previewText}>Xem video học thử</span>
                  </div>
                )}
              </div>

              {/* Sidebar Body */}
              <div className={styles.sidebarBody}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceLabel}>Hình thức học</span>
                  <h5 className={styles.priceValue}>{course.type === "course" ? "Khóa học" : course.type}</h5>
                </div>

                {/* Main Enroll Button */}
                <Link href={firstLessonUrl} className={styles.mainEnrollBtn}>
                  <span>BẮT ĐẦU HỌC</span>
                  <ArrowRight size={15} />
                </Link>

                {/* Features List */}
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <Award size={16} className={styles.featureIcon} />
                    <span>Trình độ: <strong>{course.level_label || course.level}</strong></span>
                  </li>

                  <li className={styles.featureItem}>
                    <BookOpen size={16} className={styles.featureIcon} />
                    <span>Tổng số: <strong>{course.lesson_count} bài học</strong></span>
                  </li>

                  <li className={styles.featureItem}>
                    <Layers size={16} className={styles.featureIcon} />
                    <span>Cấu trúc: <strong>{course.chapter_count} chương</strong></span>
                  </li>

                  <li className={styles.featureItem}>
                    <Clock size={16} className={styles.featureIcon} />
                    <span>Thời lượng: <strong>~{course.estimated_hours} giờ học</strong></span>
                  </li>

                  <li className={styles.featureItem}>
                    <Sparkles size={16} className={styles.featureIcon} />
                    <span>Cấu trúc câu hỏi STAR chuyên sâu</span>
                  </li>

                  <li className={styles.featureItem}>
                    <Monitor size={16} className={styles.featureIcon} />
                    <span>Học mọi lúc trên trình duyệt web</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && previewLesson?.video_url && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
          onClick={() => setShowVideoModal(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 820,
              background: "#000",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "#111" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                {previewLesson.title}
              </span>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              {previewVideoInfo?.isIframe ? (
                <iframe
                  src={previewVideoInfo.embedUrl}
                  title={previewLesson.title}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideoInfo?.embedUrl || previewLesson.video_url}
                  controls
                  autoPlay
                  playsInline
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
