"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { COURSES_DATA } from "@/data/coursesData";
import type { CourseItem } from "@/types/course";
import styles from "../courses.module.css";

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string>("m-1");

  const course: CourseItem | undefined =
    COURSES_DATA.find((c) => c.slug === slug) || COURSES_DATA[0];

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const defaultModules = [
    {
      id: "m-1",
      title: "Module 1: Nền Tảng & Khung Tiêu Chí Phỏng Vấn Tuyển Dụng",
      description: "Làm rõ chân dung ứng viên kỳ vọng và các vòng thi cốt lõi.",
      lessons: [
        { id: "l-1-1", title: "Cấu trúc vòng phỏng vấn chuyên môn và tiêu chí đánh giá", durationMinutes: 15, type: "video" as const, isFree: true },
        { id: "l-1-2", title: "Khung tư duy giải quyết vấn đề dưới áp lực thời gian thực", durationMinutes: 20, type: "reading" as const, isFree: true },
        { id: "l-1-3", title: "Trắc nghiệm khởi động: Kiểm tra độ nhạy bén tình huống", durationMinutes: 15, type: "quiz" as const, isFree: true },
      ],
    },
    {
      id: "m-2",
      title: "Module 2: Đào Sâu Nghiệp Vụ & Phân Tích Ca Thực Chiến (Case Studies)",
      description: "Thực hành xử lý các bài toán kỹ thuật và tình huống hóc búa.",
      lessons: [
        { id: "l-2-1", title: "Phân tích tình huống sự cố thực tế và các đánh đổi (Trade-offs)", durationMinutes: 30, type: "video" as const },
        { id: "l-2-2", title: "Cấu trúc câu trả lời tự luận theo khung STAR chuẩn quốc tế", durationMinutes: 35, type: "reading" as const },
        { id: "l-2-3", title: "Bài tập tự luận STAR: Giải quyết bài toán mở rộng và tối ưu", durationMinutes: 40, type: "star_practice" as const },
      ],
    },
    {
      id: "m-3",
      title: "Module 3: Mô Phỏng Phỏng Vấn Thử 1-1 Với AI Coach",
      description: "Bật mic phát biểu thực tế, nhận chấm điểm Rubric và đo tốc độ nói WPM.",
      lessons: [
        { id: "l-3-1", title: "Giả lập phỏng vấn thử: Xử lý câu hỏi hành vi và văn hóa công ty", durationMinutes: 25, type: "mock_simulation" as const },
        { id: "l-3-2", title: "Giả lập phỏng vấn thử: Vòng kỹ thuật chuyên sâu cùng AI Interviewer", durationMinutes: 30, type: "mock_simulation" as const },
      ],
    },
  ];

  const curriculum = course.modules && course.modules.length > 0 ? course.modules : defaultModules;

  return (
    <div className={styles.pageShell}>
      {/* Top Back Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <Link
          href="/courses"
          className={styles.categoryPill}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Thư viện khóa học</span>
        </Link>

        <button
          type="button"
          onClick={handleCopy}
          className={styles.categoryPill}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
          <span>{copiedLink ? "Đã sao chép liên kết!" : "Chia sẻ khóa học"}</span>
        </button>
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
        <div style={{ spaceY: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 12 }}>
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
              {course.type === "Learning Path" ? <Compass size={12} /> : <BookOpen size={12} />}
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

          <h1 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.25 }}>
            {course.title}
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)", margin: "0 0 20px" }}>
            {course.description}
          </p>

          {/* Companies Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
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
              <span>Giả Lập Phỏng Vấn Thử (AI Coach)</span>
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

        {/* Media Banner Card */}
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(106, 72, 49, 0.2)", position: "relative", height: 260, background: "#211914", boxShadow: "0 8px 24px -6px rgba(0,0,0,0.15)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800 }}>
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <span>{course.rating} / 5.0</span>
              <span style={{ opacity: 0.8, fontSize: 12, fontWeight: 500 }}>({course.enrolledCount} học viên)</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
              {course.meta}
            </span>
          </div>
        </div>
      </div>

      {/* Highlights & Core Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 36 }}>
        <div style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 14px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={17} color="#d98236" />
            <span>Điểm Nổi Bật Của Lộ Trình</span>
          </h3>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {course.highlights.map((h, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 14px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={17} color="#d98236" />
            <span>Kỹ Năng &amp; Trọng Tâm Phỏng Vấn</span>
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {course.skills.map((s, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "rgba(217, 130, 54, 0.08)",
                  color: "#8b4513",
                  border: "1px solid rgba(217, 130, 54, 0.2)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: "#fafaf9", border: "1px dashed #d6d3d1", fontSize: 12, color: "#57534e", lineHeight: 1.6 }}>
            <ShieldCheck size={16} color="#d98236" style={{ marginBottom: 4 }} />
            <strong style={{ color: "#292524" }}>Đảm bảo chất lượng:</strong> 100% nội dung được định hướng theo thang điểm Rubric quốc tế và phương pháp STAR được các hội đồng phỏng vấn tin dùng.
          </div>
        </div>
      </div>

      {/* Curriculum Accordion */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "var(--ink)" }}>
          Chương Trình Học &amp; Bài Thực Hành Chi Tiết
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 20px" }}>
          Lộ trình được chia theo từng Module từ nền tảng, mổ xẻ tình huống đến bài thi giả lập 1-1.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {curriculum.map((m) => {
            const isOpen = openModuleId === m.id;
            return (
              <div
                key={m.id}
                style={{
                  borderRadius: 18,
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
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isOpen ? "rgba(245, 239, 230, 0.4)" : "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                      {m.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                      {m.description}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={18} color="#8b4513" /> : <ChevronDown size={18} color="#8b4513" />}
                </button>

                {isOpen && (
                  <div style={{ padding: "12px 22px 18px", borderTop: "1px solid rgba(106, 72, 49, 0.1)", display: "flex", flexDirection: "column", gap: 10 }}>
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
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)" }}>
                          {lesson.type === "video" && <PlayCircle size={15} color="#2563eb" />}
                          {lesson.type === "reading" && <FileText size={15} color="#059669" />}
                          {lesson.type === "star_practice" && <Star size={15} color="#d98236" />}
                          {lesson.type === "mock_simulation" && <Mic size={15} color="#9333ea" />}
                          {lesson.type === "quiz" && <HelpCircle size={15} color="#d97706" />}
                          <span style={{ fontWeight: 600 }}>{lesson.title}</span>
                          {lesson.isFree && (
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#059669" }}>
                              Học thử
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-soft)", fontSize: 11.5 }}>
                          <span>{lesson.durationMinutes} phút</span>
                          <Link
                            href="/practice"
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#d98236",
                              textDecoration: "none",
                            }}
                          >
                            Bắt đầu →
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
    </div>
  );
}
