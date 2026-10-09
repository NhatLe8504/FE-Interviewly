"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  X,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Code2,
  FolderKanban,
  HelpCircle,
  Award,
  Users,
  Trophy,
  Crown,
  Send,
  ThumbsUp,
} from "lucide-react";
import type { QuestionSetItem, LeaderboardItem, QuestionSetReviewsPage } from "@/types/catalog";
import { catalogApi } from "@/services/catalogApi";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import type { DomainOut } from "@/types/catalog";
import { getDomainTheme } from "@/constants/domainThemes";
import { Button } from "@/components/ui/button";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { SimpleUserSelect } from "@/components/user-component/common";
import { Briefcase } from "lucide-react";
import pageStyles from "@/app/(user)/questions/questions.module.css";

export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num)) return "0";
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "T";
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}


interface CuratedQuestionSetsViewProps {
  activeTab?: "sets" | "individual";
  setActiveTab?: (tab: "sets" | "individual") => void;
}

export function CuratedQuestionSetsView({
  activeTab = "sets",
  setActiveTab,
}: CuratedQuestionSetsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [domainsList, setDomainsList] = useState<DomainOut[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSetItem[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(false);
  const [detailSet, setDetailSet] = useState<QuestionSetItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  React.useEffect(() => {
    setIsLoadingSets(true);
    // 1. Fetch real domains from DB
    catalogApi.getDomains().then((doms) => {
      if (Array.isArray(doms) && doms.length > 0) {
        setDomainsList(doms);
      }
    });

    // 2. Fetch real question sets from DB
    catalogApi.getQuestionSets().then((res) => {
      if (res && res.items && res.items.length > 0) {
        setQuestionSets(res.items);
      } else {
        setQuestionSets(MOCK_QUESTION_SETS);
      }
      setIsLoadingSets(false);
    });
  }, []);

  const handleOpenDetailSet = async (s: QuestionSetItem, initialTab: "questions" | "leaderboard" | "reviews" = "questions") => {
    setModalTab(initialTab);
    setDetailSet(s);
    setIsLoadingDetail(true);

    try {
      const detailed = await catalogApi.getQuestionSetDetail(s.set_id);
      if (detailed && detailed.set_id) {
        setDetailSet(detailed);
      }
    } catch (err) {
      console.warn("Failed to load real set detail:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };
  const [modalTab, setModalTab] = useState<"questions" | "leaderboard" | "reviews">("questions");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [reviewsData, setReviewsData] = useState<QuestionSetReviewsPage | null>(null);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Review submit form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  React.useEffect(() => {
    if (!detailSet) return;
    if (modalTab === "leaderboard") {
      setIsLoadingTab(true);
      catalogApi.getQuestionSetLeaderboard(detailSet.set_id).then((res) => {
        setLeaderboard(res);
        setIsLoadingTab(false);
      });
    } else if (modalTab === "reviews") {
      setIsLoadingTab(true);
      catalogApi.getQuestionSetReviews(detailSet.set_id).then((res) => {
        setReviewsData(res);
        setIsLoadingTab(false);
      });
    }
  }, [modalTab, detailSet]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailSet || !newComment.trim()) return;
    setIsSubmittingReview(true);
    const created = await catalogApi.submitQuestionSetReview(detailSet.set_id, {
      rating: newRating,
      comment: newComment.trim(),
    });
    if (created && reviewsData) {
      setReviewsData({
        ...reviewsData,
        total_reviews: reviewsData.total_reviews + 1,
        reviews: [created, ...reviewsData.reviews],
      });
      setNewComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    }
    setIsSubmittingReview(false);
  };

  // Filter logic
  const filteredSets = useMemo(() => {
    return questionSets.filter((s) => {
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(kw);
        const matchDomain = s.domain_name?.toLowerCase().includes(kw) ?? false;
        const matchRole = s.role_name?.toLowerCase().includes(kw) ?? false;
        const matchTech = s.tech_stack.some((t) => t.toLowerCase().includes(kw));
        if (!matchTitle && !matchDomain && !matchRole && !matchTech) {
          return false;
        }
      }

      if (selectedDomain !== "all" && String(s.domain_id) !== selectedDomain) {
        return false;
      }

      if (selectedLevel !== "all" && s.experience_level !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [search, selectedDomain, selectedLevel, questionSets]);

  // 1-Click Practice Start (Question Set Workspace)
  const handleStartSetPractice = (set: QuestionSetItem) => {
    const qids = (set.questions || []).map((q) => q.question_id).join(",");
    try {
      sessionStorage.setItem("basket_questions", JSON.stringify(set.questions || []));
      sessionStorage.setItem("active_question_set_title", set.title);
    } catch {
      // ignore
    }

    router.push(`/questions/practice?set=${set.set_id}${qids ? `&q=${qids}` : ""}&source=set`);
  };

  // Mock Interview Simulation with this Set
  const handleStartMockInterview = (set: QuestionSetItem) => {
    const sid = `set-${set.set_id}-${Date.now().toString(36)}`;
    try {
      sessionStorage.setItem("active_custom_questions", JSON.stringify(set.questions));
      sessionStorage.setItem(`custom_questions_${sid}`, JSON.stringify(set.questions));
      sessionStorage.setItem("active_question_set_title", set.title);
    } catch {
      // ignore
    }

    router.push(
      `/practice/${sid}?custom=1&domain=${set.domain_id}&role=${set.role_id}&level=${set.experience_level}`
    );
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Search & Quick Filter Toolbar with Integrated Compact Tab Switcher */}
      <div className={`${pageStyles.filterCard} space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          {/* Integrated Compact Tab Switcher */}
          {setActiveTab && (
            <div className={pageStyles.tabGroup}>
              <button
                type="button"
                onClick={() => setActiveTab("sets")}
                className={`${pageStyles.tabBtn} ${activeTab === "sets" ? pageStyles.tabBtnActive : ""}`}
              >
                <FolderKanban size={13} />
                <span>Bộ Đề Tuyển Dụng ({questionSets.length || MOCK_QUESTION_SETS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("individual")}
                className={`${pageStyles.tabBtn} ${activeTab === "individual" ? pageStyles.tabBtnActive : ""}`}
              >
                <HelpCircle size={13} />
                <span>Khám Phá Câu Hỏi Lẻ & Bốc Đề</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Controls Row: chung hàng, con mèo absolute ở góc phải không chiếm flow */}
        <div className="relative flex flex-wrap items-center gap-3.5 pt-3 border-t border-[var(--border-subtle)]">
          {/* Con mèo absolute bên phải, đứng trên đường gạch ngang */}
          <div className="absolute -top-[48px] right-6 sm:right-10 pointer-events-none select-none">
            <PageMascot size={52} />
          </div>
          {/* Thanh tìm kiếm dài hơn nằm bên trái */}
          <div className="relative flex items-center w-full sm:w-[330px] shrink-0">
            <Search size={15} className="absolute left-3 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo công nghệ, từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-[13px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-paper)] text-[var(--ink)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-deep)] focus:bg-[var(--surface-card)] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 p-1 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ngành nghề: icon lồng trong select, không cần title ngoài */}
          <SimpleUserSelect
            id="sets-domain-select"
            value={selectedDomain}
            onChange={(val) => setSelectedDomain(val)}
            icon={<Briefcase size={14} />}
            options={[
              { value: "all", label: "Tất cả ngành nghề" },
              ...(domainsList.length > 0 ? domainsList : [
                { domain_id: 19, domain_name: "Công nghệ thông tin (IT)" },
                { domain_id: 20, domain_name: "Marketing & Truyền thông" },
                { domain_id: 21, domain_name: "Kinh doanh & Phát triển thị trường" },
                { domain_id: 22, domain_name: "Quản trị Nhân sự (HR)" },
                { domain_id: 23, domain_name: "Tài chính & Kế toán" },
              ]).map((d: any) => ({
                value: String(d.domain_id),
                label: d.domain_name,
              })),
            ]}
            aria-label="Chọn ngành nghề"
            className="w-[190px]"
          />

          {/* Cấp độ: icon lồng trong select, không cần title ngoài */}
          <SimpleUserSelect
            id="sets-level-select"
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            icon={<Layers size={14} />}
            options={[
              { value: "all", label: "Tất cả cấp độ" },
              { value: "intern", label: "Intern" },
              { value: "fresher", label: "Fresher" },
              { value: "junior", label: "Junior" },
              { value: "mid", label: "Middle" },
              { value: "senior", label: "Senior" },
              { value: "lead", label: "Lead / Architect" },
            ]}
            aria-label="Chọn cấp độ"
            className="w-[150px]"
          />

          {(search || selectedDomain !== "all" || selectedLevel !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedDomain("all");
                setSelectedLevel("all");
              }}
              className={`${pageStyles.chipBtn} h-9 shrink-0`}
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Question Set Cards */}
      {filteredSets.length === 0 ? (
        <div className={pageStyles.emptyState}>
          <div className={pageStyles.emptyIcon}>
            <FolderKanban size={30} />
          </div>
          <h3 className={pageStyles.emptyTitle}>Không tìm thấy bộ đề nào phù hợp</h3>
          <p className={pageStyles.emptyDesc}>
            Hãy thử tìm kiếm với từ khóa khác như &quot;Java&quot;, &quot;React&quot;, &quot;DevOps&quot; hoặc xóa bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSets.map((s) => {
            const theme = getDomainTheme(s.domain_id, s.domain_name ?? undefined);

            return (
              <div
                key={s.set_id}
                className="rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-[0_4px_18px_rgba(45,31,23,0.025)] hover:border-[var(--line)] hover:shadow-[0_14px_32px_-14px_rgba(45,31,23,0.16)] transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Thumbnail Banner */}
                <div className="relative h-36 w-full overflow-hidden bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.imageUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = theme.localFallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/5 flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-white/95 text-[var(--ink)] shadow-xs backdrop-blur-xs">
                        {s.domain_name?.split("(")[0].trim()}
                      </span>

                      {s.is_curated && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-950 shadow-xs flex items-center gap-1">
                          <Star className="size-2.5 fill-current" />
                          Tuyển Chọn
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-white text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs capitalize border border-white/20">
                        {s.experience_level}
                      </span>

                      <div className="flex items-center gap-0.5 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/20">
                        {[1, 2, 3, 4, 5].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`size-2.5 ${
                              starIdx <= s.target_difficulty
                                ? "fill-amber-400 text-amber-400"
                                : "text-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-3 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3
                      className="font-extrabold text-sm sm:text-base text-[var(--ink)] hover:text-[var(--accent-deep)] cursor-pointer transition-colors leading-snug line-clamp-2"
                      onClick={() => handleOpenDetailSet(s, "questions")}
                    >
                      {s.title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {s.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium bg-[var(--surface-paper)] text-[var(--accent-deep)] border border-[var(--border-subtle)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="p-3 rounded-2xl bg-[var(--surface-paper)] border border-[var(--border-subtle)] space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--accent-deep)] uppercase tracking-wider block">
                      Câu hỏi tiêu biểu trong bộ đề:
                    </span>
                    {s.questions?.slice(0, 2).map((q, idx) => (
                      <p key={idx} className="text-xs text-[var(--ink)] truncate flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-[var(--accent-warm)] shrink-0" />
                        <span>{q.question_text}</span>
                      </p>
                    ))}
                  </div>

                  {/* Card Footer: Meta Info & Actions (Compact, No Line Wrap) */}
                  <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    {/* Meta stats: Icons & Compact Numbers */}
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-secondary)] shrink-0">
                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[var(--surface-paper)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] cursor-default"
                        title={`Thời lượng ước tính: ~${s.estimated_duration_minutes} phút`}
                      >
                        <Clock className="size-3.5 text-[var(--accent-deep)] shrink-0" />
                        <span>~{s.estimated_duration_minutes}'</span>
                      </span>

                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[var(--surface-paper)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] cursor-default"
                        title={`Số lượng: ${s.question_count} câu hỏi`}
                      >
                        <BookOpen className="size-3.5 text-[var(--accent-deep)] shrink-0" />
                        <span>{s.question_count}</span>
                      </span>

                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[var(--surface-paper)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] cursor-default"
                        title={`Lượt luyện tập: ${s.practice_count.toLocaleString("vi-VN")} lượt`}
                      >
                        <Users className="size-3.5 text-[var(--accent-deep)] shrink-0" />
                        <span>{formatCompactNumber(s.practice_count)}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenDetailSet(s, "leaderboard")}
                        className={pageStyles.chipBtn}
                        title="Bảng xếp hạng Top 10"
                      >
                        <Trophy className="size-3 text-amber-500 shrink-0" />
                        <span>Top 10</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDetailSet(s, "questions")}
                        className={pageStyles.chipBtn}
                        title="Xem chi tiết bộ đề"
                      >
                        Chi tiết
                      </button>

                      <Button
                        type="button"
                        variant="home-primary"
                        size="home-compact"
                        onClick={() => handleStartSetPractice(s)}
                        title="Bắt đầu luyện tập bộ đề ngay"
                      >
                        <Play className="size-3.5 fill-current shrink-0" aria-hidden="true" />
                        <span>Luyện tập</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal / Slide-out Panel */}
      {detailSet && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDetailSet(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[var(--surface-paper)] border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-[var(--border-subtle)] bg-white/70 flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(217,130,54,0.14)] text-[var(--accent-deep)]">
                    {detailSet.domain_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 capitalize">
                    {detailSet.experience_level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {detailSet.questions?.length ?? detailSet.question_count} câu hỏi chuẩn hóa
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-[var(--ink)] leading-snug">
                  {detailSet.title}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {detailSet.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailSet(null)}
                className="size-8 rounded-full bg-white border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-deep)] hover:bg-stone-100 shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-2 border-b border-[var(--border-subtle)] bg-white/40">
              <button
                type="button"
                onClick={() => setModalTab("questions")}
                className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "questions"
                    ? "border-[var(--accent-deep)] text-[var(--accent-deep)]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <BookOpen size={13} />
                <span>Câu hỏi ({detailSet.questions?.length ?? detailSet.question_count})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("leaderboard")}
                className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "leaderboard"
                    ? "border-[var(--accent-deep)] text-[var(--accent-deep)]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Trophy size={13} className="text-amber-500" />
                <span>Bảng xếp hạng (Top 10)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("reviews")}
                className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "reviews"
                    ? "border-[var(--accent-deep)] text-[var(--accent-deep)]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Star size={13} className="text-amber-400" />
                <span>Đánh giá & Nhận xét ({reviewsData?.total_reviews || 3})</span>
              </button>
            </div>

            {/* Modal Body: All Questions */}
            {modalTab === "questions" && (
            <div className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-[var(--accent-deep)] uppercase tracking-wider text-[10.5px] block">
                  Công nghệ & Kỹ năng yêu cầu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailSet.tech_stack.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md font-mono text-[11px] font-medium bg-white text-[var(--accent-deep)] border border-[var(--border-subtle)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
                <span className="font-bold text-[var(--ink)] text-xs block">
                  Danh sách {detailSet.questions?.length ?? detailSet.question_count} câu hỏi trong đề:
                </span>

                {(detailSet.questions ?? []).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--accent-deep)]">
                        Câu #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 capitalize">
                        {q.question_type}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-[var(--ink)] leading-relaxed">
                      {q.question_text}
                    </p>

                    {q.intent && (
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-paper)] p-2 rounded-xl border border-[var(--border-subtle)]">
                        <strong>Mục tiêu:</strong> {q.intent}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Modal Tab: Leaderboard */}
            {modalTab === "leaderboard" && (
              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--ink)] flex items-center gap-1.5">
                      <Trophy className="size-4 text-amber-500" />
                      <span>Bảng Xếp Hạng Ứng Viên Xuất Sắc Nhất</span>
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Xếp hạng dựa trên Điểm tổng hợp (/100đ) và Thời gian làm bài hoàn thành bộ đề.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    Top 10 Danh Dự
                  </span>
                </div>

                {isLoadingTab ? (
                  <div className="py-12 text-center text-[var(--accent-deep)]">
                    <Sparkles className="size-6 animate-spin mx-auto mb-2 text-[var(--accent-deep)]" />
                    <p className="font-semibold text-xs">Đang tải bảng xếp hạng...</p>
                  </div>
                ) : (
                  <>
                    {/* PODIUM TOP 3 */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2 pb-1 items-end">
                      {/* Rank 2 (Silver) */}
                      {leaderboard[1] && (
                        <div className="p-3 rounded-2xl bg-white/90 border border-stone-200 text-center flex flex-col items-center shadow-xs">
                          <span className="text-xl">🥈</span>
                          <span className="font-extrabold text-xs text-[var(--ink)] mt-1 line-clamp-1">{leaderboard[1].user_name}</span>
                          <span className="font-black text-sm text-[var(--accent-deep)]">{leaderboard[1].score}<small className="text-[10px]">đ</small></span>
                          <span className="text-[10px] text-stone-500">{Math.floor(leaderboard[1].duration_seconds / 60)}m {leaderboard[1].duration_seconds % 60}s</span>
                          <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full mt-1">Hạng 2</span>
                        </div>
                      )}

                      {/* Rank 1 (Gold) */}
                      {leaderboard[0] && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 text-center flex flex-col items-center shadow-md -translate-y-1 relative">
                          <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[9px] tracking-wider uppercase flex items-center gap-0.5">
                            Quán Quân
                          </span>
                          <span className="text-2xl mt-1">🥇</span>
                          <span className="font-extrabold text-xs text-[var(--ink)] mt-1 line-clamp-1 flex items-center gap-1">
                            {leaderboard[0].user_name}
                            {leaderboard[0].is_pro && <Crown className="size-3 text-amber-500 fill-amber-400" />}
                          </span>
                          <span className="font-black text-base text-amber-600">{leaderboard[0].score}<small className="text-[10.5px]">đ</small></span>
                          <span className="text-[10px] text-stone-500">{Math.floor(leaderboard[0].duration_seconds / 60)}m {leaderboard[0].duration_seconds % 60}s</span>
                          <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-1">Hạng 1</span>
                        </div>
                      )}

                      {/* Rank 3 (Bronze) */}
                      {leaderboard[2] && (
                        <div className="p-3 rounded-2xl bg-white/90 border border-amber-900/20 text-center flex flex-col items-center shadow-xs">
                          <span className="text-xl">🥉</span>
                          <span className="font-extrabold text-xs text-[var(--ink)] mt-1 line-clamp-1">{leaderboard[2].user_name}</span>
                          <span className="font-black text-sm text-[var(--accent-deep)]">{leaderboard[2].score}<small className="text-[10px]">đ</small></span>
                          <span className="text-[10px] text-stone-500">{Math.floor(leaderboard[2].duration_seconds / 60)}m {leaderboard[2].duration_seconds % 60}s</span>
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-full mt-1">Hạng 3</span>
                        </div>
                      )}
                    </div>

                    {/* RANK 4 - 10 LIST */}
                    <div className="rounded-2xl bg-white border border-[var(--border-subtle)] overflow-hidden shadow-xs">
                      <div className="divide-y divide-stone-100">
                        {leaderboard.slice(3).map((item) => (
                          <div key={item.rank} className="p-2.5 px-3 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className="size-5 rounded-full bg-stone-100 font-extrabold text-[10px] flex items-center justify-center text-stone-600">
                                #{item.rank}
                              </span>
                              <div>
                                <span className="font-bold text-xs text-[var(--ink)] flex items-center gap-1">
                                  {item.user_name}
                                  {item.is_pro && <Crown className="size-2.5 text-amber-500 fill-amber-400" />}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {Math.floor(item.duration_seconds / 60)}m {item.duration_seconds % 60}s
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-xs text-[var(--accent-deep)]">{item.score}đ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Modal Tab: Reviews */}
            {modalTab === "reviews" && (
              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-black text-[var(--accent-deep)]">{reviewsData?.average_rating || 4.9}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Đánh giá trung bình từ {reviewsData?.total_reviews || 3} ứng viên đã hoàn thành đề thi
                    </p>
                  </div>
                </div>

                {/* Form Submit Review */}
                <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-3">
                  <span className="font-bold text-xs text-[var(--ink)] block">Gửi đánh giá của bạn về bộ đề này:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-secondary)] font-semibold">Chất lượng đề:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`size-4 ${star <= newRating ? "fill-current" : "text-stone-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận, độ khó và mức độ sát thực tế của bộ đề..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-paper)] text-xs text-[var(--ink)] outline-none"
                  />
                  {reviewSuccess && (
                    <div className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Cảm ơn bạn! Đánh giá đã được ghi nhận thành công.</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white [background:var(--button-primary-background)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Gửi nhận xét</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-2.5">
                  {reviewsData?.reviews.map((rev) => (
                    <div key={rev.review_id} className="p-3.5 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[var(--ink)]">{rev.user_name}</span>
                          {rev.is_pro && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">PRO</span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`size-2.5 ${s <= rev.rating ? "fill-current" : "text-stone-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-stone-400 block">{rev.created_at || "Gần đây"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-white/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-semibold">
                <Clock size={13} className="text-[var(--accent-deep)]" />
                <span>Thời gian ước tính: ~{detailSet.estimated_duration_minutes} phút</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailSet(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[var(--accent-deep)] hover:bg-stone-100 border border-[var(--border-subtle)] transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => handleStartMockInterview(detailSet)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[var(--accent-deep)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Mô phỏng phỏng vấn thử 1-1 với AI Interviewer"
                >
                  <Sparkles size={13} className="text-[var(--accent-deep)]" />
                  <span>Phỏng vấn thử AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSetPractice(detailSet)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white [background:var(--button-primary-background)] hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer"
                  title="Luyện tập từng câu hỏi trong bộ đề & AI chấm điểm"
                >
                  <Play size={13} className="fill-current" />
                  <span>Luyện tập bộ đề</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


