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
} from "lucide-react";
import type { QuestionSetItem } from "@/types/catalog";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import { MOCK_DOMAINS_LIST } from "@/mock/adminQuestionsMock";
import { getDomainTheme } from "@/constants/domainThemes";

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
  const [detailSet, setDetailSet] = useState<QuestionSetItem | null>(null);

  // Filter logic
  const filteredSets = useMemo(() => {
    return MOCK_QUESTION_SETS.filter((s) => {
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

  // 1-Click Practice Start
  const handleStartSetPractice = (set: QuestionSetItem) => {
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

                  {/* Card Footer: Meta Info & Actions */}
                  <div className="pt-2 border-t border-[rgba(106,72,49,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#8b4513]/70 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-[#d98236]" />
                        ~{s.estimated_duration_minutes} phút
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3 text-[#d98236]" />
                        {s.question_count} câu hỏi
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-[#8b4513]" />
                        {s.practice_count.toLocaleString("vi-VN")} lượt thi
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailSet(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-[#8b4513] hover:bg-stone-100 border border-[rgba(106,72,49,0.2)] transition-colors"
                      >
                        Xem chi tiết
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartSetPractice(s)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="size-3 fill-current" />
                        <span>Luyện tập ngay</span>
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

            {/* Modal Body: All Questions */}
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
                  onClick={() => handleStartSetPractice(detailSet)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Play size={13} className="fill-current" />
                  <span>Bắt đầu luyện tập bộ đề</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


