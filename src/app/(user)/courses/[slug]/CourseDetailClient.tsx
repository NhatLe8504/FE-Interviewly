"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Clock,
  Award,
  Layers,
  Star,
  Users,
  Building2,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  Mic,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  Video,
  Flame,
  GraduationCap,
} from "lucide-react";
import { COURSES_DATA } from "@/data/coursesData";
import { EM_COURSE_SECTIONS } from "@/data/emCourseCurriculum";
import type { CourseItem } from "@/types/course";
import styles from "../courses.module.css";

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string>("em-intro");
  const [lessonSearch, setLessonSearch] = useState<string>("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");

  const course: CourseItem =
    COURSES_DATA.find((c) => c.slug === slug) || COURSES_DATA[0];

  const isEM = slug === "engineering-management";

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Filter lessons in EM course
  const filteredSections = useMemo(() => {
    if (!isEM) return [];
    return EM_COURSE_SECTIONS.map((sec) => {
      if (selectedSectionFilter !== "all" && sec.id !== selectedSectionFilter) {
        return { ...sec, lessons: [] };
      }
      if (!lessonSearch.trim()) return sec;
      const kw = lessonSearch.trim().toLowerCase();
      const matched = sec.lessons.filter(
        (l) => l.title.toLowerCase().includes(kw)
      );
      return { ...sec, lessons: matched };
    }).filter((sec) => sec.lessons.length > 0);
  }, [isEM, selectedSectionFilter, lessonSearch]);

  const totalFilteredLessons = useMemo(() => {
    return filteredSections.reduce((acc, s) => acc + s.lessons.length, 0);
  }, [filteredSections]);

  return (
    <div className={styles.pageShell}>
      {/* Top Back Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <Link
          href="/courses"
          className={styles.categoryPill}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Thư viện khóa học</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={handleCopy}
            className={styles.categoryPill}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{copiedLink ? "Đã sao chép!" : "Chia sẻ khóa học"}</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div
        style={{
          borderRadius: 28,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 245, 235, 0.9))",
          border: "1px solid rgba(106, 72, 49, 0.18)",
          padding: "36px 32px",
          boxShadow: "0 10px 30px -10px rgba(139, 69, 19, 0.08)",
          marginBottom: 36,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: 999,
                background: "rgba(217, 130, 54, 0.12)",
                color: "#8b4513",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Compass size={12} />
              <span>{course.type}</span>
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                background: "#f3f4f6",
                color: "#374151",
              }}
            >
              {course.levelLabel}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink-soft)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={12} />
              <span>~{course.estimatedHours} giờ học &amp; luyện tập</span>
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.25 }}>
            {course.title}
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)", margin: "0 0 16px" }}>
            {course.description}
          </p>

          {/* Companies Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Building2 size={13} /> Phù hợp phỏng vấn tại:
            </span>
            {course.targetCompanies.map((comp, idx) => (
              <span key={idx} className={styles.companyBadge} style={{ fontSize: 11, padding: "3px 9px" }}>
                {comp}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <Link
              href="/practice"
              className={styles.btnAction}
              style={{ padding: "12px 26px", fontSize: 13, textDecoration: "none" }}
            >
              <Sparkles size={15} />
              <span>Giả Lập Phỏng Vấn EM (AI Coach)</span>
            </Link>

            <Link
              href="/questions"
              className={styles.categoryPill}
              style={{ padding: "11px 22px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <BookOpen size={14} />
              <span>Luyện Ngân Hàng Câu Hỏi</span>
            </Link>
          </div>
        </div>

        {/* Media Banner / Embedded Video */}
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(106, 72, 49, 0.2)", position: "relative", height: 280, background: "#111827", boxShadow: "0 12px 28px -6px rgba(0,0,0,0.25)" }}>
          {isEM ? (
            <iframe
              src="https://www.youtube.com/embed/XStqtnUGgTc?autoplay=0&rel=0"
              title="Welcome to our Engineering Management Interview Course"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.image} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
            </>
          )}
        </div>
      </div>

      {/* Featured Video Highlights (from course.html) */}
      {isEM && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Flame size={18} color="#d98236" />
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--ink)" }}>
              Video Bài Học Nổi Bật Được Yêu Thích Nhất
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                title: "Stop Sounding Like a Robot",
                desc: "Bí quyết trả lời phỏng vấn tự nhiên, truyền cảm hứng và tránh nói như đọc kịch bản mẫu.",
                time: "12 phút video",
                tag: "Giao tiếp đỉnh cao",
              },
              {
                title: "Measuring Impact as an Engineering Manager",
                desc: "Cách định lượng tầm ảnh hưởng lãnh đạo (Engineering Velocity, Retention, Team Productivity).",
                time: "18 phút video",
                tag: "People & OKRs",
              },
              {
                title: "Demonstrating Ownership in Crisis",
                desc: "Mổ xẻ ca sự cố Production nghiêm trọng: Tinh thần chịu trách nhiệm và bài học rút ra.",
                time: "22 phút video",
                tag: "Lãnh đạo thực chiến",
              },
            ].map((v, idx) => (
              <div
                key={idx}
                style={{
                  padding: "20px",
                  borderRadius: 18,
                  background: "#ffffff",
                  border: "1px solid rgba(106, 72, 49, 0.12)",
                  boxShadow: "0 4px 16px -8px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217,130,54,0.12)", color: "#8b4513" }}>
                      {v.tag}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} /> {v.time}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                    {v.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {v.desc}
                  </p>
                </div>

                <Link
                  href="/practice"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#d98236",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <PlayCircle size={14} />
                  <span>Xem bài giảng &amp; Thực hành</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Curriculum / Syllabus Accordion with Live Search & Tabs */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "var(--ink)" }}>
              Chương Trình Học &amp; Danh Mục Bài Học Chi Tiết ({isEM ? "132 bài học" : course.meta})
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
              Dựa trên tài liệu tuyển dụng chuẩn hóa từ Google, Meta, Slack và Amazon.
            </p>
          </div>

          {/* Search bar inside curriculum */}
          {isEM && (
            <div style={{ position: "relative", minWidth: 260, maxWidth: 360, flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
              <input
                type="text"
                placeholder="Lọc bài học (System Design, 1:1, OKRs...)..."
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 12px 0 36px",
                  borderRadius: 12,
                  border: "1px solid rgba(106, 72, 49, 0.2)",
                  background: "#ffffff",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>

        {/* Section Filter Pills for EM */}
        {isEM && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 18, scrollbarWidth: "thin" }}>
            <button
              type="button"
              onClick={() => setSelectedSectionFilter("all")}
              className={`${styles.categoryPill} ${selectedSectionFilter === "all" ? styles.categoryPillActive : ""}`}
            >
              Tất cả các chương (132 bài)
            </button>
            {EM_COURSE_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectionFilter(sec.id)}
                className={`${styles.categoryPill} ${selectedSectionFilter === sec.id ? styles.categoryPillActive : ""}`}
              >
                {sec.titleEn} ({sec.lessons.length})
              </button>
            ))}
          </div>
        )}

        {/* Modules Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredSections.map((m) => {
            const isOpen = openModuleId === m.id || lessonSearch.trim().length > 0;
            return (
              <div
                key={m.id}
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(106, 72, 49, 0.15)",
                  background: "#ffffff",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenModuleId(isOpen ? "" : m.id)}
                  style={{
                    width: "100%",
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isOpen ? "rgba(245, 239, 230, 0.5)" : "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ paddingRight: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(217, 130, 54, 0.12)", color: "#8b4513" }}>
                        {m.lessons.length} bài học
                      </span>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                        {m.title}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                      {m.description}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={18} color="#8b4513" /> : <ChevronDown size={18} color="#8b4513" />}
                </button>

                {isOpen && (
                  <div style={{ padding: "14px 24px 20px", borderTop: "1px solid rgba(106, 72, 49, 0.1)", display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "#fafaf9",
                          fontSize: 12.5,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)", flex: 1, paddingRight: 12 }}>
                          {lesson.type === "video" && <PlayCircle size={15} color="#2563eb" style={{ flexShrink: 0 }} />}
                          {lesson.type === "mock_simulation" && <Mic size={15} color="#9333ea" style={{ flexShrink: 0 }} />}
                          {lesson.type === "reading" && <FileText size={15} color="#059669" style={{ flexShrink: 0 }} />}
                          {lesson.type === "star_practice" && <Star size={15} color="#d98236" style={{ flexShrink: 0 }} />}
                          <span style={{ fontWeight: 600 }}>{lesson.title}</span>
                          {lesson.isFree && (
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#059669", flexShrink: 0 }}>
                              Học thử miễn phí
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--ink-soft)", fontSize: 11.5, flexShrink: 0 }}>
                          <span>{lesson.durationMinutes} phút</span>
                          <Link
                            href="/practice"
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#d98236",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <span>Luyện tập</span>
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Feedback & Reviews from course.html */}
      {isEM && (
        <div style={{ padding: "32px 28px", borderRadius: 24, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.12)", marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="#d98236" />
            <span>Đánh Giá Từ Các Engineering Managers Đã Trúng Tuyển</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                author: "Doug",
                role: "Engineering Manager tại Slack",
                quote: "Khóa học EM cực kỳ giá trị không chỉ ở lượng kiến thức cô đọng, mà còn ở các ví dụ mẫu câu hỏi và câu trả lời thực chiến đúng chuẩn Google và Meta.",
              },
              {
                author: "Diego",
                role: "Engineering Manager tại Amazon",
                quote: "Hệ thống đã đúc kết được những điểm cốt lõi nhất của các vòng phỏng vấn EM thực tế, kèm các khuyến nghị bổ ích để chuẩn bị cho vòng Bar Raiser.",
              },
              {
                author: "Vaibhav",
                role: "Senior Lead tại Microsoft",
                quote: "Các buổi mock interview và bài tập People Management giúp tôi tự tin trình bày tầm ảnh hưởng lãnh đạo của mình mà không bị ngập ngừng.",
              },
            ].map((rev, idx) => (
              <div key={idx} style={{ padding: 18, borderRadius: 14, background: "#fafaf9", border: "1px solid #e7e5e4", fontSize: 12.5, lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 10px", fontStyle: "italic", color: "var(--ink)" }}>
                  &ldquo;{rev.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e7e5e4", paddingTop: 8 }}>
                  <strong style={{ color: "#8b4513" }}>{rev.author}</strong>
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
