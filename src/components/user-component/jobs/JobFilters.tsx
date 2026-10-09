"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { getBrandLabel } from "@/lib/brand-icons";
import { SENIORITY_LABELS, WORKPLACE_LABELS } from "@/lib/job-presentation";
import styles from "./jobs.module.css";

interface JobFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  seniority: string;
  onSeniorityChange: (value: string) => void;
  workplaceType: string;
  onWorkplaceTypeChange: (value: string) => void;
  technology: string;
  onTechnologyChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  sourceId: string;
  onSourceIdChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
  loading?: boolean;
  resultsError?: boolean;
  metadataLoading?: boolean;
  metadataError?: boolean;
  topTechnologies?: string[];
  locations?: string[];
  countries?: { id: string; name: string }[];
  sources?: { id: string; name: string }[];
  sortOptions?: { id: string; name: string }[];
}

const SORT_OPTIONS = [
  { id: "recent", name: "Mới cập nhật dữ liệu" },
  { id: "posted", name: "Mới đăng tuyển" },
  { id: "match", name: "Phù hợp với tôi" },
  { id: "salary_desc", name: "Lương cao nhất" },
  { id: "title_asc", name: "Tên công việc A – Z" },
];

export function JobFilters({
  keyword, onKeywordChange, seniority, onSeniorityChange, workplaceType, onWorkplaceTypeChange,
  technology, onTechnologyChange, location, onLocationChange, countryCode, onCountryCodeChange,
  sourceId, onSourceIdChange, sortBy, onSortByChange, onResetFilters, hasActiveFilters, totalCount,
  loading = false, resultsError = false, metadataLoading = false, metadataError = false,
  topTechnologies = [], locations = [], countries = [], sources = [], sortOptions = SORT_OPTIONS,
}: JobFiltersProps) {
  const quickTechnologies = topTechnologies.slice(0, 6);
  if (technology && !quickTechnologies.includes(technology)) quickTechnologies.push(technology);
  const advancedCount = [location, seniority, workplaceType].filter(Boolean).length;

  return (
    <section className={styles.filterPanel} aria-label="Tìm kiếm và lọc việc làm">
      <div className={styles.searchBarRow}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <Input
            id="jobs-search"
            type="search"
            aria-label="Tìm theo vị trí, công ty hoặc công nghệ"
            placeholder="Vị trí, công ty hoặc công nghệ bạn quan tâm"
            className={styles.searchInput}
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
          {keyword && (
            <Button type="button" variant="home-quiet" size="icon-sm" className={styles.clearSearchBtn} onClick={() => onKeywordChange("")} aria-label="Xóa từ khóa tìm kiếm">
              <X className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        {hasActiveFilters && <Button type="button" variant="home-quiet" size="home-compact" onClick={onResetFilters}>Xóa bộ lọc</Button>}
      </div>

      <div className={styles.primaryFilters}>
        <div className={styles.countryControl}>
          <label className={styles.controlLabel} htmlFor="jobs-country">Thị trường tuyển dụng</label>
          <select id="jobs-country" className={styles.selectBox} value={countryCode} onChange={(event) => onCountryCodeChange(event.target.value)}>
            <option value="VN">Việt Nam & remote toàn cầu</option>
            <option value="">Tất cả quốc gia</option>
            {countries.filter((country) => country.id !== "VN").map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
          </select>
        </div>
        <div className={styles.filterControl}>
          <label id="jobs-source-label" className={styles.controlLabel}>Nguồn tuyển dụng</label>
          <Select value={sourceId || "all"} onValueChange={(value) => onSourceIdChange(value === "all" ? "" : value)} disabled={metadataLoading}>
            <SelectTrigger className={styles.sourceTrigger} aria-labelledby="jobs-source-label"><SelectValue /></SelectTrigger>
            <SelectContent className={styles.sourceMenu}>
              <SelectItem value="all" textValue="Tất cả nguồn">Tất cả nguồn</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id} textValue={source.name}>
                  <span className={styles.sourceOption}><BrandIcon name={source.id} size={18} />{source.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={styles.filterControl}>
          <label className={styles.controlLabel} htmlFor="jobs-sort">Sắp xếp theo</label>
          <select id="jobs-sort" className={styles.selectBox} value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
            {(sortOptions.length ? sortOptions : SORT_OPTIONS).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </div>
      </div>

      <details className={styles.moreFilters}>
        <summary>Thêm bộ lọc{advancedCount > 0 && <span> · {advancedCount} đang chọn</span>}</summary>
        <div className={styles.advancedFilters}>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-location">Địa điểm cụ thể</label>
            <select id="jobs-location" className={styles.selectBox} value={location} onChange={(event) => onLocationChange(event.target.value)} disabled={metadataLoading}>
              <option value="">Mọi địa điểm</option>
              {locations.map((place) => <option key={place} value={place}>{place}</option>)}
            </select>
          </div>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-seniority">Cấp bậc</label>
            <select id="jobs-seniority" className={styles.selectBox} value={seniority} onChange={(event) => onSeniorityChange(event.target.value)}>
              <option value="">Mọi cấp bậc</option>
              {Object.entries(SENIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-workplace">Hình thức làm việc</label>
            <select id="jobs-workplace" className={styles.selectBox} value={workplaceType} onChange={(event) => onWorkplaceTypeChange(event.target.value)}>
              <option value="">Mọi hình thức</option>
              {Object.entries(WORKPLACE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      </details>

      {metadataError && <p className={styles.filterNotice}>Chưa tải được các tùy chọn lọc. Bạn vẫn có thể tìm bằng từ khóa hoặc tải lại trang.</p>}
      <div className={styles.filterFooter}>
        <div className={styles.techList}>
          {quickTechnologies.length > 0 && <span className={styles.tagsLabel}>Lọc nhanh</span>}
          {quickTechnologies.map((technologyName) => (
            <Button key={technologyName} type="button" variant="home-choice" size="home-compact" className={styles.tagPill}
              aria-pressed={technology.toLowerCase() === technologyName.toLowerCase()}
              onClick={() => onTechnologyChange(technology.toLowerCase() === technologyName.toLowerCase() ? "" : technologyName)}>
              <BrandIcon name={technologyName} size={19} />{getBrandLabel(technologyName)}
            </Button>
          ))}
        </div>
        <p className={styles.resultCounter} role="status" aria-live="polite">{loading ? "Đang tìm việc làm…" : resultsError ? "Chưa tải được kết quả" : totalCount.toLocaleString("vi-VN") + " vị trí phù hợp"}</p>
      </div>
      {sortBy === "posted" && <p className={styles.filterNotice}>Sắp xếp theo ngày đăng do nguồn cung cấp. Tin chưa có ngày đăng được xếp phía sau.</p>}
    </section>
  );
}
