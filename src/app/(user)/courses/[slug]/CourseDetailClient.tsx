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
  Plus,
  Minus,
  Play,
  Monitor,
  Calendar,
  X,
} from "lucide-react";
import { COURSES_DATA } from "@/data/coursesData";
import { getCourseCurriculum, type CourseCurriculumSection, type ResolvedLesson } from "@/data/lessonResolver";
import type { CourseItem } from "@/types/course";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import styles from "./courseDetail.module.css";

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const router = useRouter();

  // Load course and curriculum
  const { course, sections, flattened } = useMemo(() => {
    return getCourseCurriculum(slug);
  }, [slug]);

  // Video Preview Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Accordion Expand/Collapse All
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(() => {
    return new Set(sections.map((s) => s.id));
  });

  const toggleChapter = (chapterId: string) => {
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

  const isAllExpanded = expandedChapterIds.size === sections.length;
  const toggleAllChapters = () => {
    if (isAllExpanded) {
      setExpandedChapterIds(new Set());
    } else {
      setExpandedChapterIds(new Set(sections.map((s) => s.id)));
    }
  };

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Related Courses
  const relatedCourses = useMemo(() => {
    return COURSES_DATA.filter((c) => c.slug !== slug).slice(0, 3);
  }, [slug]);

  const firstLesson = flattened[0];
  const firstLessonUrl = firstLesson ? firstLesson.href : `/courses/${slug}`;

  // Default "Bạn sẽ học được gì" items based on course
  const defaultLearningOutcomes = [
    `Nắm vững bản đồ các vòng phỏng vấn tuyển dụng ${course.role} tại các tập đoàn công nghệ hàng đầu (Google, Meta, OpenAI...).`,
    "Làm chủ phương pháp trả lời STAR có cấu trúc chặt chẽ, tư duy phân tích rủi ro và giải pháp kỹ thuật tối ưu.",
    "Bí quyết trả lời vòng thiết kế kiến trúc hệ thống (System Design) và đào sâu các đánh đổi (Trade-offs) thực tế.",
    "Khắc phục triệt để các lỗi thường gặp: Nói ngập ngừng, lạm dụng từ đệm, nói lan man không có số liệu định lượng.",
    "Tự tin trả lời vòng phỏng vấn văn hóa & hành vi (Behavioral Round) theo các tiêu chuẩn Leadership Principles.",
    "Được chấm điểm trực tiếp và nhận feedback tức thì từ AI Coach theo thang điểm Rubric quốc tế.",
  ];

  const outcomes = course.highlights && course.highlights.length > 0 ? course.highlights : defaultLearningOutcomes;

  const faqs = [
    {
      q: `Học xong khóa ${course.title} có cơ hội trúng tuyển Big Tech không?`,
      a: `Hoàn toàn có thể. Khóa học được thiết kế bám sát các câu hỏi phỏng vấn thực tế và tiêu chí đánh giá của phỏng vấn viên cấp cao tại Google, Meta, Amazon và Stripe. Hàng nghìn học viên đã áp dụng thành công các khung tư duy và bài tập STAR trong khóa học để nhận offer mức lương hấp dẫn.`,
    },
    {
      q: "Khóa học này phù hợp với đối tượng nào?",
      a: `Khóa học được tối ưu cho các kỹ sư, chuyên viên từ trình độ ${course.levelLabel} đang chuẩn bị nhảy việc, chuyển đổi vai trò hoặc muốn nâng cấp tư duy phỏng vấn để đạt level Senior / Lead / Manager.`,
    },
    {
      q: "Quy trình học và giả lập phỏng vấn cùng AI Coach hoạt động ra sao?",
      a: "Bạn sẽ học lý thuyết và case study qua từng bài học. Sau đó, tại mỗi chuyên đề, bạn có thể bấm nút 'Thực hành cùng AI Coach' để bật micro trả lời thử, hệ thống AI sẽ phân tích nhịp nói (WPM), phát hiện từ đệm và chấm điểm chi tiết theo thang Rubric 100 điểm.",
    },
    {
      q: "Tôi có được cấp chứng chỉ sau khi hoàn thành khóa học?",
      a: "Có. Sau khi bạn hoàn thành 100% bài học và vượt qua các bài kiểm tra thực hành, hệ thống sẽ cấp Chứng chỉ Xác thực Hoàn thành Khóa học (Certificate of Completion) có mã định danh để bạn đính kèm vào CV và LinkedIn.",
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 2-Column Responsive Grid (Matches chitiet.html exactly) */}
        <div className={styles.detailGrid}>
          {/* =========================================================
              LEFT COLUMN: MAIN CONTENT (col-9 in chitiet.html)
             ========================================================= */}
          <main className={styles.mainContent}>
            {/* Header Title & Meta */}
            <div className={styles.headerSection}>
              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseSubtitle}>{course.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaRating}>
                  <Star size={15} className={styles.starIcon} />
                  <span>{course.rating}</span>
                  <span style={{ color: "var(--ink-muted)", fontWeight: 500 }}>
                    ({course.reviewCount} đánh giá)
                  </span>
                </span>
                <span>•</span>
                <span>{course.enrolledCount} học viên đã tham gia</span>
                <span>•</span>
                <span style={{ color: "#8b4513" }}>{course.levelLabel}</span>
              </div>
            </div>

            {/* Section: Bạn sẽ học được gì? (What you will learn - chitiet.html) */}
            <div className={styles.whatYouLearnBox}>
              <h2 className={styles.sectionHeading} style={{ marginBottom: 16 }}>
                Bạn sẽ học được gì?
              </h2>
              <div className={styles.learnGrid}>
                {outcomes.map((item, idx) => (
                  <div key={idx} className={styles.learnItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Nội dung khóa học (Curriculum Accordion - chitiet.html) */}
            <div className={styles.sectionBox}>
              <h2 className={styles.sectionHeading}>Nội dung khóa học</h2>

              <div className={styles.curriculumHeader}>
                <div className={styles.curriculumStats}>
                  <strong>{sections.length}</strong> chương <span>•</span>{" "}
                  <strong>{flattened.length}</strong> bài học <span>•</span>{" "}
                  Thời lượng <strong>{course.estimatedHours}</strong> giờ
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
                {sections.map((sec, secIdx) => {
                  const isExpanded = expandedChapterIds.has(sec.id);

                  return (
                    <div key={sec.id} className={styles.chapterCard}>
                      <button
                        type="button"
                        onClick={() => toggleChapter(sec.id)}
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
                          {sec.lessons.length} bài học
                        </span>
                      </button>

                      {isExpanded && (
                        <div className={styles.lessonsWrapper}>
                          {sec.lessons.map((lesson, lIdx) => (
                            <Link
                              key={lesson.id}
                              href={lesson.href}
                              className={styles.lessonRow}
                            >
                              <div className={styles.lessonRowLeft}>
                                {lesson.isVideo ? (
                                  <PlayCircle size={15} className={styles.lessonIcon} />
                                ) : (
                                  <FileText size={15} className={styles.lessonIcon} />
                                )}
                                <span className={styles.lessonTitle}>
                                  {secIdx + 1}.{lIdx + 1} {lesson.title}
                                </span>
                                {lesson.isFree && (
                                  <span className={styles.freeTag}>Học thử</span>
                                )}
                              </div>

                              <span className={styles.lessonDuration}>
                                {lesson.durationMinutes}p
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Yêu cầu (Requirements - chitiet.html) */}
            <div className={styles.sectionBox}>
              <h2 className={styles.sectionHeading}>Yêu cầu</h2>
              <div className={styles.requirementsBox}>
                <ul className={styles.requirementList}>
                  <li>Máy tính hoặc thiết bị di động có kết nối internet và micro ổn định để thực hành phỏng vấn trực tiếp.</li>
                  <li>Kinh nghiệm nền tảng về chuyên môn kỹ thuật hoặc định hướng phát triển lên vai trò {course.role}.</li>
                  <li>Tinh thần chủ động tự học, kiên trì luyện tập và cởi mở tiếp nhận các phản hồi đánh giá khách quan từ AI Coach.</li>
                  <li>Không nóng vội, bình tĩnh hoàn thành bài thực hành tự luận và trả lời thử giọng nói sau mỗi bài học.</li>
                </ul>
              </div>
            </div>

            {/* Section: Mô tả khóa học & Hỏi đáp (Course FAQs - chitiet.html) */}
            <div className={styles.sectionBox}>
              <h2 className={styles.sectionHeading}>Mô tả khóa học</h2>
              <div className={styles.faqAccordion}>
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className={styles.faqQuestion}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={16} color="#8b4513" /> : <ChevronDown size={16} color="#8b4513" />}
                      </button>
                      {isOpen && <div className={styles.faqAnswer}>{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Khóa học liên quan (Related Courses - chitiet.html) */}
            <div className={styles.sectionBox}>
              <h2 className={styles.sectionHeading}>Khóa học liên quan</h2>
              <div className={styles.relatedGrid}>
                {relatedCourses.map((rel) => (
                  <Link key={rel.id} href={`/courses/${rel.slug}`} className={styles.relatedCard}>
                    <div style={{ height: 130, overflow: "hidden", background: "#211914", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rel.image} alt={rel.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                        <span style={{ color: "#8b4513" }}>Miễn phí</span>
                        <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 3 }}>
                          ★ {rel.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* =========================================================
              RIGHT COLUMN: STICKY PURCHASE BADGE (col-3 in chitiet.html)
             ========================================================= */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -46, right: 24, pointerEvents: "none", zIndex: 5 }}>
              <PageMascot size={52} />
            </div>
            <aside className={styles.stickySidebar}>
            {/* Preview Media Thumbnail */}
            <div
              className={styles.previewMedia}
              onClick={() => setShowVideoModal(true)}
              title="Xem video giới thiệu khóa học"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.image} alt={course.title} className={styles.previewImg} />
              <div className={styles.previewOverlay}>
                <div className={styles.playCircleBtn}>
                  <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />
                </div>
                <span className={styles.previewText}>Xem giới thiệu khóa học</span>
              </div>
            </div>

            {/* Sidebar Body */}
            <div className={styles.sidebarBody}>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Chi phí khóa học</span>
                <h5 className={styles.priceValue}>Miễn phí</h5>
              </div>

              {/* Main Enroll Button (Links directly to the learning page in hoc.html format!) */}
              <Link href={firstLessonUrl} className={styles.mainEnrollBtn}>
                <span>ĐĂNG KÝ HỌC NGAY</span>
                <ArrowRight size={15} />
              </Link>

              {/* Features List (Matches chitiet.html purchase badge features) */}
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}>
                  <Award size={16} className={styles.featureIcon} />
                  <span>Trình độ: <strong>{course.levelLabel}</strong></span>
                </li>

                <li className={styles.featureItem}>
                  <BookOpen size={16} className={styles.featureIcon} />
                  <span>Tổng số: <strong>{flattened.length} bài học</strong></span>
                </li>

                <li className={styles.featureItem}>
                  <Clock size={16} className={styles.featureIcon} />
                  <span>Thời lượng: <strong>{course.estimatedHours} giờ học</strong></span>
                </li>

                <li className={styles.featureItem}>
                  <ShieldCheck size={16} className={styles.featureIcon} />
                  <span>Chứng chỉ hoàn thành khóa học</span>
                </li>

                <li className={styles.featureItem}>
                  <Sparkles size={16} className={styles.featureIcon} />
                  <span>Giả lập phỏng vấn 1-1 với AI Coach</span>
                </li>

                <li className={styles.featureItem}>
                  <Monitor size={16} className={styles.featureIcon} />
                  <span>Học mọi lúc, mọi nơi trên máy tính &amp; mobile</span>
                </li>
              </ul>
            </div>
          </aside>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setShowVideoModal(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 800,
              aspectRatio: "16/9",
              background: "#000000",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <X size={18} />
            </button>
            <iframe
              src="https://www.youtube.com/embed/XStqtnUGgTc?autoplay=1&rel=0"
              title="Course Intro Video"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
