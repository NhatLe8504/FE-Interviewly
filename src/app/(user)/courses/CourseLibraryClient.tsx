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
import { PageMascot } from "@/components/user-component/common/PageMascot";
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
      <div className={styles.contentContainer}>
        {/* Hero Header */}
        <div className={styles.heroHeader}>
          <div className={styles.eyebrow}>
            <Sparkles size={13} />
            <span>{locale === "vi" ? "Lộ trình ôn luyện chuyên sâu" : "Curated Course Library"}</span>
          </div>
          <h1 className={styles.title}>
            {locale === "vi" ? (
              <>Thư viện <em>khóa học tuyển dụng</em></>
            ) : (
              <>Interview <em>Course Library</em></>
            )}
          </h1>
          <p className={styles.subtitle}>
            Các lộ trình ôn luyện có cấu trúc được thiết kế bởi các chuyên gia kỹ thuật và phỏng vấn viên cấp cao tại Google, Meta, OpenAI và Goldman Sachs. Học từ lý thuyết, phân tích ca thực tế, cấu trúc STAR và giả lập phỏng vấn 1-1 với AI Coach.
          </p>
        </div>

        {/* Feature Stat Highlights Banner */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <GraduationCap size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>12+ Lộ trình chuyên sâu</span>
              <span className={styles.statLabel}>System Design, SWE, AI, PM &amp; Data</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Building2 size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Chuẩn Big Tech &amp; FAANG</span>
              <span className={styles.statLabel}>Google, Meta, OpenAI, TikTok &amp; AWS</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Sparkles size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Mock Interview AI 1-1</span>
              <span className={styles.statLabel}>Giả lập phỏng vấn giọng nói phản xạ</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Star size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Cấu trúc STAR &amp; STAR+</span>
              <span className={styles.statLabel}>Mổ xẻ tình huống &amp; số liệu định lượng</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className={styles.filterBar}>
          {/* Mascot con mèo/con bot đứng phía trên bên phải của thanh tìm kiếm */}
          <div className={styles.mascotBadgeWrap}>
            <PageMascot size={68} />
          </div>

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
                  className={styles.resetBtn}
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
        <div className={styles.resultsCountRow}>
          <div>
            Hiển thị <strong>{filteredCourses.length}</strong> khóa học &amp; lộ trình tuyển chọn
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className={styles.emptyCard}>
            <GraduationCap size={44} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Không tìm thấy khóa học phù hợp</h3>
            <p className={styles.emptyDesc}>
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
                      <span className={styles.levelTag}>{c.levelLabel}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{c.title}</h3>
                    <p className={styles.cardDesc}>{c.description}</p>

                    {/* Target Companies */}
                    <div className={styles.companyRow}>
                      <span className={styles.companyLabel}>
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
    </div>
  );
}
