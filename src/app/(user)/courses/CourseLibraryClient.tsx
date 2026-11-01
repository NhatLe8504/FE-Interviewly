"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  Star,
  Building2,
  GraduationCap,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { COURSE_CATEGORIES } from "@/data/coursesData";
import { courseApi } from "@/services/courseApi";
import type { CourseOut } from "@/types/course";
import { useI18n } from "@/context/I18nContext";
import { SimpleUserSelect } from "@/components/user-component/common";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { UserPagination } from "@/components/user-component/common/Pagination";
import styles from "./courses.module.css";

const PAGE_SIZE = 6;

export default function CourseLibraryClient() {
  const { locale } = useI18n();
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const requestSeq = useRef<number>(0);

  const loadCourses = useCallback(
    async (targetPage = 1) => {
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      try {
        const offset = (targetPage - 1) * PAGE_SIZE;
        const res = await courseApi.listCourses({
          search: search.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          level: selectedLevel !== "all" ? selectedLevel : undefined,
          limit: PAGE_SIZE,
          offset,
        });

        if (seq !== requestSeq.current) return;
        setCourses(res.items || []);
        setTotal(res.total || 0);
        setPage(targetPage);
      } catch (err: any) {
        if (seq !== requestSeq.current) return;
        setError(err?.message || "Không thể tải danh sách khóa học. Vui lòng thử lại.");
        setCourses([]);
        setTotal(0);
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
        }
      }
    },
    [search, selectedCategory, selectedType, selectedLevel]
  );

  // Debounced search & filter reset to page 1
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadCourses(1);
    }, 280);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [loadCourses]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
            Các lộ trình ôn luyện có cấu trúc được xây dựng bài bản. Học từ lý thuyết, phân tích ca thực tế, cấu trúc STAR và giả lập phỏng vấn cùng AI Coach.
          </p>
        </div>

        {/* Feature Stat Highlights Banner */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <GraduationCap size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Lộ trình chuyên sâu</span>
              <span className={styles.statLabel}>System Design, SWE &amp; Kỹ thuật</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Building2 size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Kiến trúc thực tế</span>
              <span className={styles.statLabel}>Phân tích đánh đổi &amp; Trade-offs</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Sparkles size={22} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statVal}>Mock Interview AI</span>
              <span className={styles.statLabel}>Luyện tập phản xạ có cấu trúc</span>
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
          <div className={styles.mascotBadgeWrap}>
            <PageMascot size={68} />
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchInputWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khóa học, vị trí, công nghệ (System Design, SWE, Java...)..."
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
                  { value: "course", label: "Khóa học chuyên sâu (Course)" },
                  { value: "workshop", label: "Workshop thực hành" },
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
            Hiển thị <strong>{courses.length}</strong> / <strong>{total}</strong> khóa học đang được phát hành
          </div>
        </div>

        {/* Error State */}
        {error ? (
          <div className={styles.emptyCard} role="alert">
            <GraduationCap size={44} className={styles.emptyIcon} style={{ color: "#c2410c" }} />
            <h3 className={styles.emptyTitle}>Chưa thể tải dữ liệu khóa học</h3>
            <p className={styles.emptyDesc}>{error}</p>
            <button
              type="button"
              onClick={() => loadCourses(page)}
              className={styles.btnAction}
            >
              <RotateCcw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className={styles.courseGrid}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className={styles.courseCard}
                style={{ opacity: 0.6, pointerEvents: "none", minHeight: 320 }}
              >
                <div className={styles.cardMedia} style={{ background: "#e5e7eb" }} />
                <div className={styles.cardBody}>
                  <div style={{ height: 16, background: "#e5e7eb", borderRadius: 4, width: "60%", marginBottom: 12 }} />
                  <div style={{ height: 20, background: "#e5e7eb", borderRadius: 4, width: "85%", marginBottom: 10 }} />
                  <div style={{ height: 14, background: "#e5e7eb", borderRadius: 4, width: "100%", marginBottom: 6 }} />
                  <div style={{ height: 14, background: "#e5e7eb", borderRadius: 4, width: "75%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
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
          /* Real Courses Grid */
          <>
            <div className={styles.courseGrid}>
              {courses.map((c) => (
                <Link key={c.course_id} href={`/courses/${c.slug}`} className={styles.courseCard}>
                  <div className={styles.cardMedia}>
                    {c.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={c.image} alt={c.title} className={styles.cardImg} loading="lazy" />
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
                    <div className={styles.cardMediaOverlay} />
                    <div className={styles.mediaBadge}>
                      <BookOpen size={12} color="#d98236" />
                      <span>{c.type === "course" ? "Khóa học chuyên sâu" : c.type}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaItem}>
                          <Layers size={13} color="#d98236" />
                          <span>{c.chapter_count} chương</span>
                        </span>
                        <span>•</span>
                        <span className={styles.metaItem}>
                          <Clock size={13} />
                          <span>~{c.estimated_hours} giờ học</span>
                        </span>
                        <span>•</span>
                        <span className={styles.levelTag}>{c.level_label || c.level}</span>
                      </div>

                      <h3 className={styles.cardTitle}>{c.title}</h3>
                      <p className={styles.cardDesc}>{c.description}</p>

                      {/* Target Companies (if any) */}
                      {c.target_companies && c.target_companies.length > 0 && (
                        <div className={styles.companyRow}>
                          <span className={styles.companyLabel}>
                            <Building2 size={11} /> Mục tiêu:
                          </span>
                          {c.target_companies.map((comp, idx) => (
                            <span key={idx} className={styles.companyBadge}>{comp}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.ratingBox}>
                        <BookOpen size={13} className={styles.starIcon} />
                        <span>{c.chapter_count} chương</span>
                        <span className={styles.enrollCount}>({c.lesson_count} bài học)</span>
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

            {totalPages > 1 && (
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                <UserPagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => loadCourses(p)}
                  itemLabel="khóa học"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
