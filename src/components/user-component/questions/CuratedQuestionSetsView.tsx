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
import { MOCK_DOMAINS_LIST } from "@/mock/adminQuestionsMock";
import { getDomainTheme } from "@/constants/domainThemes";

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
  const [questionSets, setQuestionSets] = useState<QuestionSetItem[]>(MOCK_QUESTION_SETS);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(false);
  const [detailSet, setDetailSet] = useState<QuestionSetItem | null>(null);

  React.useEffect(() => {
    setIsLoadingSets(true);
    catalogApi.getQuestionSets().then((res) => {
      if (res && res.items && res.items.length > 0) {
        setQuestionSets(res.items);
      }
      setIsLoadingSets(false);
    });
  }, []);
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
        const matchDomain = s.domain_name.toLowerCase().includes(kw);
        const matchRole = s.role_name.toLowerCase().includes(kw);
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
  }, [search, selectedDomain, selectedLevel]);

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
      <div className="p-4 rounded-3xl bg-white/80 border border-[rgba(106,72,49,0.18)] shadow-xs backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Integrated Compact Tab Switcher */}
          {setActiveTab && (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#f5efe6] border border-[rgba(106,72,49,0.15)] shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("sets")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "sets"
                    ? "bg-gradient-to-r from-[#d98236] to-[#8b4513] text-white shadow-xs"
                    : "text-[#8b4513]/70 hover:text-[#211914] hover:bg-white/40"
                }`}
              >
                <FolderKanban size={13} />
                <span>Bộ Đề Tuyển Dụng ({MOCK_QUESTION_SETS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("individual")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "individual"
                    ? "bg-gradient-to-r from-[#d98236] to-[#8b4513] text-white shadow-xs"
                    : "text-[#8b4513]/70 hover:text-[#211914] hover:bg-white/40"
                }`}
              >
                <HelpCircle size={13} />
                <span>Khám Phá Câu Hỏi Lẻ & Bốc Đề</span>
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8b4513]/60" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ đề theo công nghệ (Java, React, K8s, Python), vị trí hoặc ngành nghề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs rounded-xl bg-white border border-[rgba(106,72,49,0.18)] focus:outline-none focus:border-[#d98236] text-[#211914]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8b4513]/60 hover:text-[#211914]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(search || selectedDomain !== "all" || selectedLevel !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedDomain("all");
                  setSelectedLevel("all");
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[rgba(106,72,49,0.2)] text-[#8b4513] hover:bg-[#fffaf4] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Đặt lại lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[rgba(106,72,49,0.1)] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8b4513] uppercase tracking-wider">
              Ngành nghề:
            </span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-white border border-[rgba(106,72,49,0.2)] text-xs text-[#211914] focus:outline-none"
            >
              <option value="all">Tất cả ngành nghề</option>
              {MOCK_DOMAINS_LIST.map((d) => (
                <option key={d.domain_id} value={String(d.domain_id)}>
                  {d.domain_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8b4513] uppercase tracking-wider">
              Cấp độ:
            </span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-white border border-[rgba(106,72,49,0.2)] text-xs text-[#211914] focus:outline-none capitalize"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="intern">Intern</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead / Architect</option>
            </select>
          </div>

          <span className="ml-auto text-[11px] text-[#8b4513]/70 font-semibold">
            Tìm thấy <strong>{filteredSets.length}</strong> bộ đề chuẩn hóa
          </span>
        </div>
      </div>

      {/* Grid of Question Set Cards */}
      {filteredSets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 border border-[rgba(106,72,49,0.14)] space-y-3">
          <FolderKanban className="size-10 mx-auto text-stone-400" />
          <p className="font-bold text-[#211914] text-sm">Không tìm thấy bộ đề nào phù hợp</p>
          <p className="text-xs text-[#8b4513]/70">
            Hãy thử tìm kiếm với từ khóa khác như &quot;Java&quot;, &quot;React&quot;, &quot;DevOps&quot; hoặc xóa bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSets.map((s) => {
            const theme = getDomainTheme(s.domain_id, s.domain_name);

            return (
              <div
                key={s.set_id}
                className="rounded-3xl bg-white/85 border border-[rgba(106,72,49,0.16)] shadow-xs hover:shadow-md hover:border-[#d98236]/40 transition-all flex flex-col justify-between overflow-hidden group"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211914] via-[#211914]/40 to-black/20 flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-white/95 text-[#211914] shadow-xs backdrop-blur-xs">
                        {s.domain_name.split("(")[0].trim()}
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
                      className="font-extrabold text-sm sm:text-base text-[#211914] hover:text-[#d98236] cursor-pointer transition-colors leading-snug line-clamp-2"
                      onClick={() => setDetailSet(s)}
                    >
                      {s.title}
                    </h3>

                    <p className="text-xs text-[#8b4513]/80 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium bg-[#fcf8f3] text-[#8b4513] border border-[rgba(106,72,49,0.14)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="p-3 rounded-2xl bg-[#fffaf4] border border-[rgba(106,72,49,0.12)] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#8b4513] uppercase tracking-wider block">
                      Câu hỏi tiêu biểu trong bộ đề:
                    </span>
                    {s.questions.slice(0, 2).map((q, idx) => (
                      <p key={idx} className="text-xs text-[#211914] truncate flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-[#d98236] shrink-0" />
                        <span>{q.question_text}</span>
                      </p>
                    ))}
                  </div>

                  {/* Card Footer: Meta Info & Actions (Compact, No Line Wrap) */}
                  <div className="pt-2.5 border-t border-[rgba(106,72,49,0.1)] flex items-center justify-between gap-2">
                    {/* Meta stats: Icons & Compact Numbers */}
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#8b4513]/75 shrink-0">
                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[#fffaf4] px-2 py-1 rounded-lg border border-[rgba(106,72,49,0.12)] cursor-default"
                        title={`Thời lượng ước tính: ~${s.estimated_duration_minutes} phút`}
                      >
                        <Clock className="size-3.5 text-[#d98236] shrink-0" />
                        <span>~{s.estimated_duration_minutes}'</span>
                      </span>

                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[#fffaf4] px-2 py-1 rounded-lg border border-[rgba(106,72,49,0.12)] cursor-default"
                        title={`Số lượng: ${s.question_count} câu hỏi`}
                      >
                        <BookOpen className="size-3.5 text-[#d98236] shrink-0" />
                        <span>{s.question_count}</span>
                      </span>

                      <span
                        className="flex items-center gap-1 whitespace-nowrap bg-[#fffaf4] px-2 py-1 rounded-lg border border-[rgba(106,72,49,0.12)] cursor-default"
                        title={`Lượt luyện tập: ${s.practice_count.toLocaleString("vi-VN")} lượt`}
                      >
                        <Users className="size-3.5 text-[#8b4513] shrink-0" />
                        <span>{formatCompactNumber(s.practice_count)}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailSet(s);
                          setModalTab("leaderboard");
                        }}
                        className="px-2.5 py-1.5 rounded-full text-xs font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
                        title="Bảng xếp hạng Top 10"
                      >
                        <Trophy className="size-3 text-amber-500 shrink-0" />
                        <span>Top 10</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDetailSet(s);
                          setModalTab("questions");
                        }}
                        className="px-2.5 py-1.5 rounded-full text-xs font-bold text-[#8b4513] hover:bg-stone-100 border border-[rgba(106,72,49,0.2)] transition-colors whitespace-nowrap"
                        title="Xem chi tiết bộ đề"
                      >
                        Chi tiết
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartSetPractice(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        title="Bắt đầu luyện tập bộ đề ngay"
                      >
                        <Play className="size-3 fill-current shrink-0" />
                        <span>Luyện tập</span>
                      </button>
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
            className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#f8f4ee] border border-[rgba(106,72,49,0.2)] shadow-2xl flex flex-col overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-[rgba(106,72,49,0.15)] bg-white/70 flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(217,130,54,0.14)] text-[#8b4513]">
                    {detailSet.domain_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 capitalize">
                    {detailSet.experience_level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {detailSet.questions.length} câu hỏi chuẩn hóa
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-[#211914] leading-snug">
                  {detailSet.title}
                </h2>
                <p className="text-xs text-[#8b4513]/80">
                  {detailSet.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailSet(null)}
                className="size-8 rounded-full bg-white border border-[rgba(106,72,49,0.2)] flex items-center justify-center text-[#8b4513] hover:bg-stone-100 shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-2 border-b border-[rgba(106,72,49,0.15)] bg-white/40">
              <button
                type="button"
                onClick={() => setModalTab("questions")}
                className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "questions"
                    ? "border-[#d98236] text-[#d98236]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <BookOpen size={13} />
                <span>Câu hỏi ({detailSet.questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("leaderboard")}
                className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "leaderboard"
                    ? "border-[#d98236] text-[#d98236]"
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
                    ? "border-[#d98236] text-[#d98236]"
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
                <span className="font-bold text-[#8b4513] uppercase tracking-wider text-[10.5px] block">
                  Công nghệ & Kỹ năng yêu cầu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailSet.tech_stack.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md font-mono text-[11px] font-medium bg-white text-[#8b4513] border border-[rgba(106,72,49,0.15)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[rgba(106,72,49,0.1)] space-y-3">
                <span className="font-bold text-[#211914] text-xs block">
                  Danh sách {detailSet.questions.length} câu hỏi trong đề:
                </span>

                {detailSet.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[rgba(106,72,49,0.14)] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#d98236]">
                        Câu #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 capitalize">
                        {q.question_type}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-[#211914] leading-relaxed">
                      {q.question_text}
                    </p>

                    {q.intent && (
                      <p className="text-[11px] text-[#8b4513]/80 leading-relaxed bg-[#fffaf4] p-2 rounded-xl border border-[rgba(106,72,49,0.1)]">
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
                    <h3 className="font-extrabold text-sm text-[#211914] flex items-center gap-1.5">
                      <Trophy className="size-4 text-amber-500" />
                      <span>Bảng Xếp Hạng Ứng Viên Xuất Sắc Nhất</span>
                    </h3>
                    <p className="text-[11px] text-[#8b4513]/70">
                      Xếp hạng dựa trên Điểm tổng hợp (/100đ) và Thời gian làm bài hoàn thành bộ đề.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    Top 10 Danh Dự
                  </span>
                </div>

                {isLoadingTab ? (
                  <div className="py-12 text-center text-[#8b4513]">
                    <Sparkles className="size-6 animate-spin mx-auto mb-2 text-[#d98236]" />
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
                          <span className="font-extrabold text-xs text-[#211914] mt-1 line-clamp-1">{leaderboard[1].user_name}</span>
                          <span className="font-black text-sm text-[#d98236]">{leaderboard[1].score}<small className="text-[10px]">đ</small></span>
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
                          <span className="font-extrabold text-xs text-[#211914] mt-1 line-clamp-1 flex items-center gap-1">
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
                          <span className="font-extrabold text-xs text-[#211914] mt-1 line-clamp-1">{leaderboard[2].user_name}</span>
                          <span className="font-black text-sm text-[#d98236]">{leaderboard[2].score}<small className="text-[10px]">đ</small></span>
                          <span className="text-[10px] text-stone-500">{Math.floor(leaderboard[2].duration_seconds / 60)}m {leaderboard[2].duration_seconds % 60}s</span>
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-full mt-1">Hạng 3</span>
                        </div>
                      )}
                    </div>

                    {/* RANK 4 - 10 LIST */}
                    <div className="rounded-2xl bg-white border border-[rgba(106,72,49,0.14)] overflow-hidden shadow-xs">
                      <div className="divide-y divide-stone-100">
                        {leaderboard.slice(3).map((item) => (
                          <div key={item.rank} className="p-2.5 px-3 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className="size-5 rounded-full bg-stone-100 font-extrabold text-[10px] flex items-center justify-center text-stone-600">
                                #{item.rank}
                              </span>
                              <div>
                                <span className="font-bold text-xs text-[#211914] flex items-center gap-1">
                                  {item.user_name}
                                  {item.is_pro && <Crown className="size-2.5 text-amber-500 fill-amber-400" />}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {Math.floor(item.duration_seconds / 60)}m {item.duration_seconds % 60}s
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-xs text-[#d98236]">{item.score}đ</span>
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
                <div className="p-4 rounded-2xl bg-white border border-[rgba(106,72,49,0.14)] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-black text-[#d98236]">{reviewsData?.average_rating || 4.9}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#8b4513]/80 mt-0.5">
                      Đánh giá trung bình từ {reviewsData?.total_reviews || 3} ứng viên đã hoàn thành đề thi
                    </p>
                  </div>
                </div>

                {/* Form Submit Review */}
                <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-white border border-[rgba(106,72,49,0.14)] space-y-3">
                  <span className="font-bold text-xs text-[#211914] block">Gửi đánh giá của bạn về bộ đề này:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8b4513]/80 font-semibold">Chất lượng đề:</span>
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
                    className="w-full p-2.5 rounded-xl border border-[rgba(106,72,49,0.2)] bg-[#fdfaf6] text-xs text-[#211914] outline-none"
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
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Gửi nhận xét</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-2.5">
                  {reviewsData?.reviews.map((rev) => (
                    <div key={rev.review_id} className="p-3.5 rounded-2xl bg-white border border-[rgba(106,72,49,0.12)] space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#211914]">{rev.user_name}</span>
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
                      <p className="text-xs text-[#8b4513]/90 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-stone-400 block">{rev.created_at || "Gần đây"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 border-t border-[rgba(106,72,49,0.15)] bg-white/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#8b4513]/80 font-semibold">
                <Clock size={13} className="text-[#d98236]" />
                <span>Thời gian ước tính: ~{detailSet.estimated_duration_minutes} phút</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailSet(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#8b4513] hover:bg-stone-100 border border-[rgba(106,72,49,0.2)] transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => handleStartMockInterview(detailSet)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#8b4513] bg-white hover:bg-amber-50/70 border border-[rgba(106,72,49,0.25)] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Mô phỏng phỏng vấn thử 1-1 với AI Interviewer"
                >
                  <Sparkles size={13} className="text-[#d98236]" />
                  <span>Phỏng vấn thử AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSetPractice(detailSet)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer"
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


