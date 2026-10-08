"use client";

import React from "react";
import { Search, X, RotateCcw, MapPin, Briefcase, Globe, Layers, ArrowUpDown, Sparkles } from "lucide-react";
import styles from "./jobs.module.css";

interface JobFiltersProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  seniority: string;
  onSeniorityChange: (val: string) => void;
  workplaceType: string;
  onWorkplaceTypeChange: (val: string) => void;
  technology: string;
  onTechnologyChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  sourceId: string;
  onSourceIdChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
  topTechnologies?: string[];
  locations?: string[];
  sources?: { id: string; name: string }[];
  sortOptions?: { id: string; name: string }[];
}

const DEFAULT_TECHS = [
  "Java", "React", "Golang", "Python", "TypeScript", "Node.js", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "AWS"
];

const DEFAULT_LOCATIONS = [
  "Việt Nam",
  "Hà Nội",
  "Hồ Chí Minh City",
  "Đà Nẵng",
  "Remote",
  "Bắc Mỹ",
  "Châu Âu",
  "Châu Á",
];

const DEFAULT_SOURCES = [
  { id: "topcv", name: "TopCV" },
  { id: "itviec", name: "ITviec" },
  { id: "vietnamworks", name: "VietnamWorks" },
  { id: "vng", name: "VNG Careers" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "greenhouse", name: "Greenhouse" },
  { id: "lever", name: "Lever" },
];

const DEFAULT_SORT_OPTIONS = [
  { id: "recent", name: "Mới cập nhật nhất" },
  { id: "posted", name: "Mới đăng gần đây" },
  { id: "salary_desc", name: "Lương cao nhất" },
  { id: "title_asc", name: "Tiêu đề A - Z" },
];

const SENIORITY_LABELS: Record<string, string> = {
  "": "Tất cả cấp bậc",
  intern: "Intern (Thực tập)",
  fresher: "Fresher (Mới tốt nghiệp)",
  junior: "Junior (1-2 năm)",
  mid: "Middle (2-4 năm)",
  senior: "Senior (4+ năm)",
  lead: "Lead / Trưởng nhóm",
};

const WORKPLACE_LABELS: Record<string, string> = {
  "": "Tất cả hình thức",
  remote: "Remote (Làm từ xa)",
  hybrid: "Hybrid (Linh hoạt)",
  on_site: "Tại văn phòng (On-site)",
};

export function JobFilters({
  keyword,
  onKeywordChange,
  seniority,
  onSeniorityChange,
  workplaceType,
  onWorkplaceTypeChange,
  technology,
  onTechnologyChange,
  location,
  onLocationChange,
  sourceId,
  onSourceIdChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
  totalCount,
  topTechnologies = DEFAULT_TECHS,
  locations = DEFAULT_LOCATIONS,
  sources = DEFAULT_SOURCES,
  sortOptions = DEFAULT_SORT_OPTIONS,
}: JobFiltersProps) {
  return (
    <div className={styles.filterPanel}>
      {/* Primary Row: Sleek Search Bar */}
      <div className={styles.searchBarRow}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo vị trí, công ty hoặc từ khóa công nghệ..."
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
          {keyword && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onKeywordChange("")}
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4 text-stone-400 hover:text-stone-700" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#d98236]" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Secondary Row: Compact Dropdown Filters */}
      <div className={styles.dropdownsGrid}>
        {/* Địa điểm / Quốc gia */}
        <div className={styles.filterControl}>
          <label className={styles.controlLabel}>
            <MapPin className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Địa điểm</span>
          </label>
          <select
            className={styles.selectBox}
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">Tất cả địa điểm</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Cấp bậc */}
        <div className={styles.filterControl}>
          <label className={styles.controlLabel}>
            <Briefcase className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Cấp bậc</span>
          </label>
          <select
            className={styles.selectBox}
            value={seniority}
            onChange={(e) => onSeniorityChange(e.target.value)}
          >
            {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Hình thức */}
        <div className={styles.filterControl}>
          <label className={styles.controlLabel}>
            <Globe className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Hình thức</span>
          </label>
          <select
            className={styles.selectBox}
            value={workplaceType}
            onChange={(e) => onWorkplaceTypeChange(e.target.value)}
          >
            {Object.entries(WORKPLACE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Nguồn tuyển */}
        <div className={styles.filterControl}>
          <label className={styles.controlLabel}>
            <Layers className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Nguồn tin</span>
          </label>
          <select
            className={styles.selectBox}
            value={sourceId}
            onChange={(e) => onSourceIdChange(e.target.value)}
          >
            <option value="">Tất cả nguồn tin</option>
            {sources.map((src) => (
              <option key={src.id} value={src.id}>
                {src.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sắp xếp */}
        <div className={styles.filterControl}>
          <label className={styles.controlLabel}>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Sắp xếp</span>
          </label>
          <select
            className={styles.selectBox}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tertiary Row: Quick Tech Tags & Result Count */}
      <div className={styles.tagsRow}>
        <div className={styles.techList}>
          <span className={styles.tagsLabel}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[#d98236]" />
            Công nghệ:
          </span>
          {topTechnologies.map((tech) => {
            const active = technology.toLowerCase() === tech.toLowerCase();
            return (
              <button
                key={tech}
                type="button"
                className={`${styles.tagPill} ${active ? styles.tagPillActive : ""}`}
                onClick={() => onTechnologyChange(active ? "" : tech)}
              >
                {tech}
              </button>
            );
          })}
        </div>

        <div className={styles.resultCounter}>
          <span>Tìm thấy <strong>{totalCount}</strong> việc làm</span>
        </div>
      </div>
    </div>
  );
}
