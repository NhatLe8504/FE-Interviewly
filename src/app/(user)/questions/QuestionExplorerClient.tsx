"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
  Keyboard,
  Mic,
  Briefcase,
  HelpCircle,
  Flame,
  Award,
  Compass,
} from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import { useI18n } from "@/context/I18nContext";
import { interviewApi } from "@/services/interviewApi";
import type {
  DomainOut,
  RoleOut,
  QuestionOut,
  QuestionFilterParams,
} from "@/types/catalog";
import { getDomainTheme, getLocalizedDomainName, getLocalizedRoleName } from "@/constants/domainThemes";
import { UserPagination, SimpleUserSelect } from "@/components/user-component/common";
import styles from "./questions.module.css";



export default function QuestionExplorerClient() {
  const router = useRouter();
  const { locale, t } = useI18n();

  // Dynamic filter options based on language
  const levelOptions = useMemo(
    () => [
      { id: "all", label: t.questions.allLevels },
      { id: "intern", label: "Intern" },
      { id: "fresher", label: "Fresher" },
      { id: "junior", label: "Junior" },
      { id: "mid", label: "Middle" },
      { id: "senior", label: "Senior" },
    ],
    [t]
  );

  const typeOptions = useMemo(
    () => [
      { id: "all", label: t.questions.allTypes },
      { id: "behavioral", label: t.questions.types.behavioral },
      { id: "technical", label: t.questions.types.technical },
      { id: "situational", label: t.questions.types.situational },
    ],
    [t]
  );

  const langOptions = useMemo(
    () => [
      { id: "all", label: t.questions.allLanguages },
      { id: "vi", label: "🇻🇳 Tiếng Việt" },
      { id: "en", label: "🇺🇸 English" },
    ],
    [t]
  );

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<number | "all">("all");
  const [selectedRole, setSelectedRole] = useState<number | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  // Pagination State (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Data State
  const [domains, setDomains] = useState<DomainOut[]>([]);
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Practice Modal State
  const [practiceModalQuestion, setPracticeModalQuestion] = useState<QuestionOut | null>(null);
  const [practiceMode, setPracticeMode] = useState<"text" | "voice">("text");
  const [isStartingPractice, setIsStartingPractice] = useState(false);

  // Load Domains & Initial Questions on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [domainList, roleList, questionPage] = await Promise.all([
          catalogApi.getDomains(),
          catalogApi.getRoles(null),
          catalogApi.getQuestions({ limit: 100 }),
        ]);

        if (!isMounted) return;
        setDomains(domainList);
        setRoles(roleList);
        setQuestions(questionPage.items);
      } catch {
        // Fallbacks are safely handled in catalogApi
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Roles when Domain changes
  useEffect(() => {
    let isMounted = true;
    const domainId = selectedDomain === "all" ? null : selectedDomain;

    catalogApi.getRoles(domainId).then((roleList) => {
      if (!isMounted) return;
      setRoles(roleList);
      // Reset selected role if it does not belong to the new domain
      if (domainId && selectedRole !== "all") {
        const exists = roleList.some((r) => r.role_id === selectedRole);
        if (!exists) setSelectedRole("all");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDomain, selectedRole]);

  // Filter questions client-side for immediate responsive search
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (selectedDomain !== "all") {
      result = result.filter((q) => q.domain_id === selectedDomain);
    }

    if (selectedRole !== "all") {
      result = result.filter((q) => q.role_id === selectedRole);
    }

    if (selectedLevel !== "all") {
      result = result.filter((q) => {
        if (selectedLevel === "mid") {
          return q.experience_level === "mid" || q.experience_level === "middle";
        }
        return q.experience_level === selectedLevel;
      });
    }

    if (selectedType !== "all") {
      result = result.filter((q) => q.question_type === selectedType);
    }

    if (selectedLanguage !== "all") {
      result = result.filter((q) => q.language === selectedLanguage);
    }

    if (searchQuery.trim()) {
      const kw = searchQuery.trim().toLowerCase();
      result = result.filter(
        (q) =>
          q.question_text.toLowerCase().includes(kw) ||
          q.role_name?.toLowerCase().includes(kw) ||
          q.domain_name?.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [
    questions,
    selectedDomain,
    selectedRole,
    selectedLevel,
    selectedType,
    selectedLanguage,
    searchQuery,
  ]);


  // Pagination calculations
  const totalItems = filteredQuestions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDomain !== "all" ||
    selectedRole !== "all" ||
    selectedLevel !== "all" ||
    selectedType !== "all" ||
    selectedLanguage !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDomain("all");
    setSelectedRole("all");
    setSelectedLevel("all");
    setSelectedType("all");
    setSelectedLanguage("all");
    setCurrentPage(1);
  };



  // Launch Practice Handler
  const handleLaunchPractice = async () => {
    if (!practiceModalQuestion) return;
    setIsStartingPractice(true);

    try {
      // Direct session start if authenticated, otherwise fallback to practice page
      const session = await interviewApi.startSession({
        domain_id: practiceModalQuestion.domain_id,
        role_id: practiceModalQuestion.role_id || 1,
        role_name: practiceModalQuestion.role_name || "Software Engineer",
        level: practiceModalQuestion.experience_level || "junior",
        language: practiceModalQuestion.language || "vi",
        mode: practiceMode,
      });

      setPracticeModalQuestion(null);
      router.push(`/practice/${session.session_id}`);
    } catch {
      // Fallback navigation with params
      const q = practiceModalQuestion;
      setPracticeModalQuestion(null);
      router.push(
        `/practice?domain=${q.domain_id}&role=${q.role_id || 1}&level=${q.experience_level || "junior"}&lang=${q.language || "vi"}`
      );
    } finally {
      setIsStartingPractice(false);
    }
  };

  // Helper Badge Color
  const getLevelBadgeClass = (level: string | null) => {
    if (!level) return styles.badge;
    const l = level.toLowerCase();
    if (l === "intern" || l === "fresher" || l === "junior") return `${styles.badge} ${styles.badgeLevelJunior}`;
    if (l === "mid" || l === "middle") return `${styles.badge} ${styles.badgeLevelMid}`;
    return `${styles.badge} ${styles.badgeLevelSenior}`;
  };

  const getTypeBadgeClass = (type: string) => {
    if (type === "behavioral") return `${styles.badge} ${styles.badgeTypeBehavioral}`;
    if (type === "technical") return `${styles.badge} ${styles.badgeTypeTechnical}`;
    return `${styles.badge} ${styles.badgeTypeSituational}`;
  };

  const getTypeName = (type: string) => {
    if (type === "behavioral") return t.questions.types.behavioral;
    if (type === "technical") return t.questions.types.technical;
    if (type === "situational") return t.questions.types.situational;
    return type;
  };

  return (
    <div className={styles.shell}>
      {/* Header Eyebrow */}
      <div className={styles.eyebrow}>{t.questions.eyebrow}</div>

      {/* Main Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t.questions.title}</h1>
          <p className={styles.sub}>{t.questions.subtitle}</p>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Compass size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{t.questions.stats.practical}</div>
            <div className={styles.statLabel}>{t.questions.stats.practicalSub}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Award size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{t.questions.stats.starRubric}</div>
            <div className={styles.statLabel}>{t.questions.stats.starRubricSub}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{t.questions.stats.aiCoach}</div>
            <div className={styles.statLabel}>{t.questions.stats.aiCoachSub}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Flame size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{t.questions.stats.bilingual}</div>
            <div className={styles.statLabel}>{t.questions.stats.bilingualSub}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Panel */}
      <div className={styles.filterCard}>
        {/* Search Bar */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.questions.searchPlaceholder}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid with Custom UserSelect */}
        <div className={styles.filterRow}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="domain-select">
              <Briefcase size={13} />
              <span>{t.questions.domainLabel}</span>
            </label>
            <SimpleUserSelect
              id="domain-select"
              value={String(selectedDomain)}
              onChange={(val) => {
                setSelectedDomain(val === "all" ? "all" : Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: t.questions.allDomains },
                ...domains.map((d) => ({
                  value: String(d.domain_id),
                  label: getLocalizedDomainName(d, locale),
                })),
              ]}
              aria-label="Chọn ngành nghề"
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="role-select">
              <Filter size={13} />
              <span>{t.questions.roleLabel}</span>
            </label>
            <SimpleUserSelect
              id="role-select"
              value={String(selectedRole)}
              onChange={(val) => {
                setSelectedRole(val === "all" ? "all" : Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: t.questions.allRoles },
                ...roles.map((r) => ({
                  value: String(r.role_id),
                  label: getLocalizedRoleName(r, locale),
                })),
              ]}
              aria-label="Chọn vị trí ứng tuyển"
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="type-select">
              <HelpCircle size={13} />
              <span>{t.questions.typeLabel}</span>
            </label>
            <SimpleUserSelect
              id="type-select"
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
              options={typeOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
              aria-label="Chọn dạng câu hỏi"
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="lang-select">
              <span>{t.questions.langLabel}</span>
            </label>
            <SimpleUserSelect
              id="lang-select"
              value={selectedLanguage}
              onChange={(val) => {
                setSelectedLanguage(val);
                setCurrentPage(1);
              }}
              options={langOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
              aria-label="Chọn ngôn ngữ"
            />
          </div>
        </div>

        {/* Level Chips Row */}
        <div className={styles.chipsRow}>
          <span className={styles.chipsLabel}>{t.questions.levelLabel}</span>
          {levelOptions.map((opt) => {
            const isActive = selectedLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.chipBtn} ${isActive ? styles.chipBtnActive : ""}`}
                onClick={() => {
                setSelectedLevel(opt.id);
                setCurrentPage(1);
              }}
              >
                {opt.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} />
              {t.questions.clearFilter}
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className={styles.resultsBar}>
        <div className={styles.resultsCount}>
          <span>{t.questions.resultsTitle}</span>
          <span className={styles.resultsBadge}>{filteredQuestions.length} {t.questions.resultsSuffix}</span>
        </div>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <>
        <div className={styles.questionsGrid}>
          {paginatedQuestions.map((q) => {
            const theme = getDomainTheme(q.domain_id, q.domain_name);
            return (
              <div key={q.question_id} className={styles.card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Domain Visual Banner */}
                  <div className={styles.cardBanner}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.imageUrl}
                      alt={theme.name}
                      className={styles.cardBannerImg}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = theme.localFallback;
                      }}
                    />
                    <div className={styles.cardBannerOverlay}>
                      <div className={styles.cardBannerTop}>
                        <span className={styles.bannerPill}>
                          <Briefcase size={11} />
                          {locale === "vi" ? theme.shortName : theme.shortNameEn}
                        </span>
                        <span className={styles.bannerPill}>
                          {q.language === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}
                        </span>
                      </div>
                      <div className={styles.cardBannerBottom}>
                        <span className={styles.bannerRole}>{q.role_name ? getLocalizedRoleName({ role_name: q.role_name }, locale) : (locale === "vi" ? theme.name : theme.nameEn)}</span>
                        <span className={getLevelBadgeClass(q.experience_level)}>
                          {q.experience_level ? q.experience_level.toUpperCase() : "GENERAL"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3 className={styles.cardQuestionText}>
                    <span className={styles.cardQuoteMark}>&ldquo;</span>
                    <span>{q.question_text}</span>
                  </h3>

                  {/* Meta Tags Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span className={getTypeBadgeClass(q.question_type)}>
                      {getTypeName(q.question_type)}
                    </span>
                    <span className={styles.starIndicator}>
                      <Sparkles size={13} />
                      <span>{t.questions.hasStarTip}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.cardActions}>
                  <Link
                    href={`/questions/${q.question_id}`}
                    className={styles.btnDetail}
                  >
                    <BookOpen size={14} />
                    <span>{t.questions.viewStarBtn}</span>
                  </Link>

                  <button
                    type="button"
                    className={styles.btnPractice}
                    onClick={() => setPracticeModalQuestion(q)}
                  >
                    <Sparkles size={14} />
                    <span>{t.questions.practiceBtn}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reusable User Pagination Component */}
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          showInfo={true}
          prevLabel={t.common.previous}
          nextLabel={t.common.next}
        />
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HelpCircle size={30} />
          </div>
          <h3 className={styles.emptyTitle}>{t.questions.emptyTitle}</h3>
          <p className={styles.emptyDesc}>{t.questions.emptyDesc}</p>
          <button
            type="button"
            className={styles.btnPractice}
            onClick={handleResetFilters}
            style={{ marginTop: 6 }}
          >
            <RotateCcw size={14} />
            <span>{t.questions.resetFiltersBtn}</span>
          </button>
        </div>
      )}

      {/* Quick Practice Launch Modal */}
      {practiceModalQuestion && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPracticeModalQuestion(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Sparkles size={20} style={{ color: "var(--accent-warm)" }} />
                <span>{t.questions.modal.title}</span>
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setPracticeModalQuestion(null)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalQuestionBox}>
              &ldquo;{practiceModalQuestion.question_text}&rdquo;
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`${styles.badge} ${styles.badgeRole}`}>
                {practiceModalQuestion.role_name ? getLocalizedRoleName({ role_name: practiceModalQuestion.role_name }, locale) : "Software Engineer"}
              </span>
              <span className={getLevelBadgeClass(practiceModalQuestion.experience_level)}>
                {locale === "vi" ? "Cấp độ:" : "Level:"} {practiceModalQuestion.experience_level || "Junior"}
              </span>
              <span className={styles.badge}>
                {locale === "vi" ? "Ngôn ngữ:" : "Language:"} {practiceModalQuestion.language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </div>

            <div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                {t.questions.modal.selectModeTitle}
              </p>
              <div className={styles.modeSelectGrid}>
                <button
                  type="button"
                  onClick={() => setPracticeMode("text")}
                  className={`${styles.modeOptionBtn} ${practiceMode === "text" ? styles.modeOptionBtnActive : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
                    <Keyboard size={16} />
                    <span>{t.common.textMode}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {t.questions.modal.textModeDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPracticeMode("voice")}
                  className={`${styles.modeOptionBtn} ${practiceMode === "voice" ? styles.modeOptionBtnActive : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
                    <Mic size={16} />
                    <span>{t.common.voiceMode}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {t.questions.modal.voiceModeDesc}
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className={styles.btnDetail}
                onClick={() => setPracticeModalQuestion(null)}
              >
                {t.questions.modal.laterBtn}
              </button>
              <button
                type="button"
                className={styles.btnPractice}
                onClick={handleLaunchPractice}
                disabled={isStartingPractice}
              >
                {isStartingPractice ? (
                  <span>{t.questions.modal.startingBtn}</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{t.questions.modal.startBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
