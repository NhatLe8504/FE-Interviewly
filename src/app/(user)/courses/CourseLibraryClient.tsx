"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  Award,
  Layers,
  Star,
  Users,
  Building2,
  ChevronRight,
  GraduationCap,
  Compass,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { COURSES_DATA, COURSE_CATEGORIES } from "@/data/coursesData";
import type { CourseItem } from "@/types/course";
import { useI18n } from "@/context/I18nContext";
import { SimpleUserSelect } from "@/components/user-component/common";
import styles from "./courses.module.css";

export default function CourseLibraryClient() {
  const { locale } = useI18n();
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((c) => {
      // 1. Search Query
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const inTitle = c.title.toLowerCase().includes(kw);
        const inRole = c.role.toLowerCase().includes(kw);
        const inDesc = c.description.toLowerCase().includes(kw);
        const inSkills = c.skills.some((s) => s.toLowerCase().includes(kw));
        const inCompanies = c.targetCompanies.some((comp) => comp.toLowerCase().includes(kw));
        if (!inTitle && !inRole && !inDesc && !inSkills && !inCompanies) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== "all" && c.category !== selectedCategory) {
        return false;
      }

      // 3. Type
      if (selectedType !== "all" && c.type !== selectedType) {
        return false;
      }

      // 4. Level
      if (selectedLevel !== "all") {
        if (selectedLevel === "fresher" && !["fresher", "junior", "all"].includes(c.level)) return false;
        if (selectedLevel === "mid" && !["mid", "all"].includes(c.level)) return false;
        if (selectedLevel === "senior" && !["senior", "lead", "all"].includes(c.level)) return false;
      }

      return true;
    });
  }, [search, selectedCategory, selectedType, selectedLevel]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedLevel("all");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    selectedLevel !== "all";

  return (
    <div className={styles.pageShell}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <div className={styles.eyebrow}>
          {locale === "vi" ? "Lộ trình ôn luyện chuyên sâu" : "Curated Course Library"}
        </div>
        <h1 className={styles.title}>
          {locale === "vi" ? (
            <>Thư viện <em>khóa học tuyển dụng</em></>
          ) : (
            <>Interview <em>Course Library</em></>
          )}
        </h1>
        <p className={styles.subtitle}>
          Các lộ trình ôn luyện có cấu trúc được thiết kế bởi các chuyên gia kỹ thuật và phỏng vấn viên cấp cao tại Google, Meta, OpenAI và Goldman Sachs. Học từ lý thuyết, phân tích ca thực tế, cấu trúc STAR và giả lập phỏng vấn 1-1 với AI.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khóa học, vị trí, công nghệ (RAG, System Design, Java...)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterControls}>
            <SimpleUserSelect
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: "all", label: "Tất cả hình thức" },
                { value: "Learning Path", label: "Lộ trình toàn diện (Learning Path)" },
                { value: "Course", label: "Khóa học chuyên sâu (Course)" },
              ]}
              aria-label="Hình thức khóa học"
              className="min-w-[190px]"
            />

            <SimpleUserSelect
              value={selectedLevel}
              onChange={setSelectedLevel}
              options={[
                { value: "all", label: "Tất cả cấp độ" },
                { value: "fresher", label: "Fresher / Junior" },
                { value: "mid", label: "Mid-Level" },
                { value: "senior", label: "Senior / Lead" },
              ]}
              aria-label="Cấp độ khóa học"
              className="min-w-[160px]"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.categoryPill}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryBar}>
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.categoryPillActive : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>
          Hiển thị <strong>{filteredCourses.length}</strong> khóa học &amp; lộ trình chuẩn hóa
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", background: "rgba(255, 255, 255, 0.7)", borderRadius: 24, border: "1px solid rgba(106, 72, 49, 0.12)" }}>
          <GraduationCap size={44} style={{ margin: "0 auto 12px", color: "#d98236", opacity: 0.8 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: "var(--ink)" }}>
            Không tìm thấy khóa học phù hợp
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 16px" }}>
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm đặt lại bộ lọc để xem toàn bộ thư viện.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className={styles.btnAction}
          >
            <RotateCcw size={14} />
            <span>Xem tất cả khóa học</span>
          </button>
        </div>
      ) : (
        <div className={styles.courseGrid}>
          {filteredCourses.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className={styles.courseCard}>
              <div className={styles.cardMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.title} className={styles.cardImg} loading="lazy" />
                <div className={styles.cardMediaOverlay} />
                <div className={styles.mediaBadge}>
                  {c.type === "Learning Path" ? <Compass size={12} color="#d98236" /> : <BookOpen size={12} color="#d98236" />}
                  <span>{c.type === "Learning Path" ? "Lộ trình tuyển chọn" : "Khóa học chuyên sâu"}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <Layers size={13} color="#d98236" />
                      <span>{c.meta}</span>
                    </span>
                    <span>•</span>
                    <span className={styles.metaItem}>
                      <Clock size={13} />
                      <span>~{c.estimatedHours} giờ học</span>
                    </span>
                    <span>•</span>
                    <span style={{ textTransform: "capitalize", color: "#8b4513" }}>{c.levelLabel}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardDesc}>{c.description}</p>

                  {/* Target Companies */}
                  <div className={styles.companyRow}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                      <Building2 size={11} /> Mục tiêu:
                    </span>
                    {c.targetCompanies.map((comp, idx) => (
                      <span key={idx} className={styles.companyBadge}>{comp}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.ratingBox}>
                    <Star size={13} className={styles.starIcon} fill="currentColor" />
                    <span>{c.rating}</span>
                    <span className={styles.enrollCount}>({c.enrolledCount} học viên)</span>
                  </div>

                  <span className={styles.btnAction}>
                    <span>Khám phá</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
