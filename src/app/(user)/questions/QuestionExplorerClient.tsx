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
  Layers,
  Languages,
  Flame,
  Award,
  Compass,
} from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import { Button } from "@/components/ui/button";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { useI18n } from "@/context/I18nContext";
import { interviewApi } from "@/services/interviewApi";
import type {
  DomainOut,
  RoleOut,
  QuestionOut,
  QuestionFilterParams,
} from "@/types/catalog";
import { getDomainTheme, getLocalizedDomainName, getLocalizedRoleName } from "@/constants/domainThemes";
import { UserPagination, SimpleUserSelect, UserTooltip } from "@/components/user-component/common";
import {
  ShoppingBasket,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";
import { QuestionBasket } from "./QuestionBasket";
import { CuratedQuestionSetsView } from "@/components/user-component/questions/CuratedQuestionSetsView";
import { FolderKanban } from "lucide-react";
import basketStyles from "./QuestionBasket.module.css";
import styles from "./questions.module.css";



export default function QuestionExplorerClient() {
  const [activeTab, setActiveTab] = useState<"sets" | "individual">("sets");
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination State (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Data State
  const [domains, setDomains] = useState<DomainOut[]>([]);
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [questionSetsCount, setQuestionSetsCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);

  // Question Basket State ("Giỏ bốc câu hỏi nằm ngổn ngang")
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionOut[]>([]);
  const [lockedDomainId, setLockedDomainId] = useState<number | null>(null);
  const [lockedDomainName, setLockedDomainName] = useState<string | null>(null);
  const [isBasketActive, setIsBasketActive] = useState<boolean>(false);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const rejectTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const isQuestionInBasket = (questionId: number) => {
    return selectedQuestions.some((q) => q.question_id === questionId);
  };

  const handleToggleQuestionInBasket = (question: QuestionOut) => {
    const isAlreadyIn = isQuestionInBasket(question.question_id);

    if (isAlreadyIn) {
      const updated = selectedQuestions.filter((q) => q.question_id !== question.question_id);
      setSelectedQuestions(updated);
      if (updated.length === 0) {
        setLockedDomainId(null);
        setLockedDomainName(null);
      }
      return;
    }

    // Domain check: If basket has a locked domain, reject questions from other domains
    if (lockedDomainId !== null && question.domain_id !== lockedDomainId) {
      if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
      setIsRejected(true);
      const curDomain = lockedDomainName || "Ngành đã khóa";
      const qDomain = question.domain_name || `Ngành #${question.domain_id}`;
      setRejectionMessage(
        `Từ chối bốc câu hỏi! Giỏ đang khóa chủ đề "${curDomain}". Câu hỏi này thuộc "${qDomain}". Vui lòng chỉ bốc câu hỏi cùng ngành!`
      );
      setIsBasketActive(true);

      rejectTimerRef.current = setTimeout(() => {
        setIsRejected(false);
        setRejectionMessage(null);
      }, 2400);
      return;
    }

    const resolvedName =
      question.domain_name ||
      domains.find((d) => d.domain_id === question.domain_id)?.domain_name ||
      `Ngành #${question.domain_id}`;

    // First question locks the domain
    if (lockedDomainId === null) {
      setLockedDomainId(question.domain_id);
      setLockedDomainName(resolvedName);
    }

    setSelectedQuestions((prev) => [...prev, question]);
    setIsBasketActive(true);
  };

  const handleRemoveFromBasket = (questionId: number) => {
    const updated = selectedQuestions.filter((q) => q.question_id !== questionId);
    setSelectedQuestions(updated);
    if (updated.length === 0) {
      setLockedDomainId(null);
      setLockedDomainName(null);
    }
  };

  const handleClearBasket = () => {
    setSelectedQuestions([]);
    setLockedDomainId(null);
    setLockedDomainName(null);
    setIsBasketActive(false);
    setIsRejected(false);
    setRejectionMessage(null);
  };

  const handleConfirmBasketPractice = () => {
    if (selectedQuestions.length === 0) {
      if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
      setIsRejected(true);
      setRejectionMessage("Giỏ đang trống! Hãy cuộn trang và bốc ít nhất 1 câu hỏi vào giỏ.");
      rejectTimerRef.current = setTimeout(() => {
        setIsRejected(false);
        setRejectionMessage(null);
      }, 2000);
      return;
    }

    try {
      sessionStorage.setItem("basket_questions", JSON.stringify(selectedQuestions));
      sessionStorage.setItem("active_question_set_title", `Giỏ đề tự chọn (${selectedQuestions.length} câu)`);
    } catch {
      // ignore
    }

    const qids = selectedQuestions.map((q) => q.question_id).join(",");
    router.push(`/questions/practice?q=${qids}&source=basket`);
  };


  // Load Domains & Initial Questions on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [domainList, roleList, questionPage, setsPage] = await Promise.all([
          catalogApi.getDomains(),
          catalogApi.getRoles(null),
          catalogApi.getQuestions({ limit: 100 }),
          catalogApi.getQuestionSets(),
        ]);

        if (setsPage && typeof setsPage.total === "number") {
          setQuestionSetsCount(setsPage.total || setsPage.items.length);
        }

        if (!isMounted) return;
        setDomains(domainList);
        setRoles(roleList);
        const enriched = (questionPage.items || []).map((q) => ({
          ...q,
          domain_name: q.domain_name || domainList.find((d) => d.domain_id === q.domain_id)?.domain_name || `Ngành #${q.domain_id}`,
          role_name: q.role_name || roleList.find((r) => r.role_id === q.role_id)?.role_name,
        }));
        setQuestions(enriched);
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
      {/* Floating Tilted Question Basket ("Nút hình cái giỏ nằm ngổn ngang") */}
      {/* Giỏ đề chỉ hiển thị khi ở tab câu hỏi lẻ */}
      {activeTab === "individual" && (
      <QuestionBasket
        selectedQuestions={selectedQuestions}
        lockedDomainId={lockedDomainId}
        lockedDomainName={lockedDomainName}
        isBasketActive={isBasketActive}
        setIsBasketActive={setIsBasketActive}
        isRejected={isRejected}
        rejectionMessage={rejectionMessage}
        onRemoveQuestion={handleRemoveFromBasket}
        onClearBasket={handleClearBasket}
        onConfirmPractice={handleConfirmBasketPractice}
      />
      )}
      {/* Header Eyebrow */}
      <div className={styles.eyebrow}>{t.questions.eyebrow}</div>

      {/* Main Header */}
      <div className={styles.headerRow} style={{ marginBottom: 20 }}>
        <div>
          <h1 className={styles.title}>
            {locale === "vi" ? (
              <>Ngân hàng <em>câu hỏi tuyển dụng</em></>
            ) : (
              <>Interview <em>Question Bank</em></>
            )}
          </h1>
        </div>
      </div>

      {activeTab === "sets" ? (
        <CuratedQuestionSetsView activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <>
      {/* Search & Filter Panel */}
      <div className={`${styles.filterCard} space-y-3`}>
        {/* Integrated Compact Tab Switcher */}
        <div className="flex items-center justify-between gap-3">
          <div className={styles.tabGroup}>
            <button
              type="button"
              onClick={() => setActiveTab("sets")}
              className={styles.tabBtn}
            >
              <FolderKanban size={13} />
              <span>Bộ Đề Tuyển Dụng ({questionSetsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("individual")}
              className={`${styles.tabBtn} ${activeTab === "individual" ? styles.tabBtnActive : ""}`}
            >
              <HelpCircle size={13} />
              <span>Khám Phá Câu Hỏi Lẻ & Bốc Đề</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Row: chung hàng, con mèo absolute ở góc phải không chiếm flow */}
        <div className="relative flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] flex-wrap xl:flex-nowrap">
          {/* Con mèo absolute bên phải, đứng trên đường gạch ngang */}
          <div className="absolute -top-[48px] right-6 sm:right-10 pointer-events-none select-none">
            <PageMascot size={52} />
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative flex items-center w-full sm:w-[220px] lg:w-[240px] shrink-0">
            <Search size={15} className="absolute left-3 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              className="w-full h-9 pl-9 pr-8 text-[13px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-paper)] text-[var(--ink)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-deep)] focus:bg-[var(--surface-card)] transition-colors"
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
                className="absolute right-2.5 p-1 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ngành nghề: icon trong select */}
          <SimpleUserSelect
            id="domain-select"
            value={String(selectedDomain)}
            onChange={(val) => {
              setSelectedDomain(val === "all" ? "all" : Number(val));
              setCurrentPage(1);
            }}
            icon={<Briefcase size={14} />}
            options={[
              { value: "all", label: t.questions.allDomains },
              ...domains.map((d) => ({
                value: String(d.domain_id),
                label: getLocalizedDomainName(d, locale),
              })),
            ]}
            aria-label="Chọn ngành nghề"
            className="w-[165px] shrink-0"
          />

          {/* Vị trí: icon trong select */}
          <SimpleUserSelect
            id="role-select"
            value={String(selectedRole)}
            onChange={(val) => {
              setSelectedRole(val === "all" ? "all" : Number(val));
              setCurrentPage(1);
            }}
            icon={<Filter size={14} />}
            options={[
              { value: "all", label: t.questions.allRoles },
              ...roles.map((r) => ({
                value: String(r.role_id),
                label: getLocalizedRoleName(r, locale),
              })),
            ]}
            aria-label="Chọn vị trí ứng tuyển"
            className="w-[145px] shrink-0"
          />

          {/* Cấp độ: icon trong select */}
          <SimpleUserSelect
            id="level-select"
            value={selectedLevel}
            onChange={(val) => {
              setSelectedLevel(val);
              setCurrentPage(1);
            }}
            icon={<Layers size={14} />}
            options={levelOptions.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            aria-label="Chọn cấp độ"
            className="w-[125px] shrink-0"
          />

          {/* Dạng câu hỏi: icon trong select */}
          <SimpleUserSelect
            id="type-select"
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val);
              setCurrentPage(1);
            }}
            icon={<HelpCircle size={14} />}
            options={typeOptions.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            aria-label="Chọn dạng câu hỏi"
            className="w-[130px] shrink-0"
          />

          {/* Ngôn ngữ: icon trong select */}
          <SimpleUserSelect
            id="lang-select"
            value={selectedLanguage}
            onChange={(val) => {
              setSelectedLanguage(val);
              setCurrentPage(1);
            }}
            icon={<Languages size={14} />}
            options={langOptions.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            aria-label="Chọn ngôn ngữ"
            className="w-[115px] shrink-0"
          />

          {/* Nút đặt lại */}
          {hasActiveFilters && (
            <button
              type="button"
              className={`${styles.chipBtn} h-9 shrink-0`}
              onClick={handleResetFilters}
              title={t.questions.clearFilter}
            >
              <RotateCcw size={12} />
              <span>{t.questions.clearFilter}</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <>
        <div className={styles.questionsGrid}>
          {paginatedQuestions.map((q) => {
            const actualDomainName = q.domain_name || domains.find((d) => d.domain_id === q.domain_id)?.domain_name || `Ngành #${q.domain_id}`;
            const theme = getDomainTheme(q.domain_id, actualDomainName, q.category);
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
                  <Button asChild variant="home-outline" size="home-compact">
                    <Link href={`/questions/${q.question_id}`}>
                      <BookOpen size={14} aria-hidden="true" />
                      <span>{t.questions.viewStarBtn}</span>
                    </Link>
                  </Button>

                                    {/* Nút Thêm vào giỏ đề (icon +, không chữ) */}
                  <UserTooltip
                    content={
                      isQuestionInBasket(q.question_id)
                        ? "Đã có trong giỏ (Bấm để bỏ)"
                        : lockedDomainId !== null && q.domain_id !== lockedDomainId
                        ? `Khác ngành (${lockedDomainName}) - Bấm sẽ bị từ chối!`
                        : "Thêm vào giỏ đề"
                    }
                    side="top"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleQuestionInBasket(q)}
                      className={`${basketStyles.btnPickToBasket} ${
                        isQuestionInBasket(q.question_id) ? basketStyles.btnPickToBasketActive : ""
                      } ${
                        lockedDomainId !== null && q.domain_id !== lockedDomainId && !isQuestionInBasket(q.question_id)
                          ? basketStyles.btnPickToBasketRejected
                          : ""
                      }`}
                      aria-label={isQuestionInBasket(q.question_id) ? "Đã trong giỏ đề" : "Thêm vào giỏ đề"}
                    >
                      {isQuestionInBasket(q.question_id) ? (
                        <Check size={16} />
                      ) : lockedDomainId !== null && q.domain_id !== lockedDomainId ? (
                        <AlertTriangle size={15} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  </UserTooltip>

                  <Button asChild variant="home-primary" size="home-compact">
                    <Link href={`/questions/practice?q=${q.question_id}&source=single`}>
                      <Sparkles size={14} aria-hidden="true" />
                      <span>{t.questions.practiceBtn}</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </Button>
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
          <Button
            type="button"
            variant="home-primary"
            size="home-compact"
            onClick={handleResetFilters}
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>{t.questions.resetFiltersBtn}</span>
          </Button>
        </div>
      )}

              </>
      )}

          </div>
  );
}




