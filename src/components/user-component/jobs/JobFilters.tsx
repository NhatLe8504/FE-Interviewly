"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { SimpleUserSelect } from "@/components/user-component/common";
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
          <SimpleUserSelect
            id="jobs-country"
            value={countryCode}
            onChange={onCountryCodeChange}
            options={[
              { value: "VN", label: "Việt Nam & remote toàn cầu" },
              { value: "", label: "Tất cả quốc gia" },
              ...countries.filter((country) => country.id !== "VN").map((country) => ({ value: country.id, label: country.name })),
            ]}
            aria-label="Thị trường tuyển dụng"
          />
        </div>
        <div className={styles.filterControl}>
          <label id="jobs-source-label" className={styles.controlLabel}>Nguồn tuyển dụng</label>
          <SimpleUserSelect
            id="jobs-source"
            value={sourceId || "all"}
            onChange={(value) => onSourceIdChange(value === "all" ? "" : value)}
            disabled={metadataLoading}
            options={[
              { value: "all", label: "Tất cả nguồn" },
              ...sources.map((source) => ({
                value: source.id,
                label: (
                  <span className={styles.sourceOption}>
                    <BrandIcon name={source.id} size={16} />
                    <span>{source.name}</span>
                  </span>
                ),
              })),
            ]}
            aria-label="Nguồn tuyển dụng"
          />
        </div>
        <div className={styles.filterControl}>
          <label className={styles.controlLabel} htmlFor="jobs-sort">Sắp xếp theo</label>
          <SimpleUserSelect
            id="jobs-sort"
            value={sortBy}
            onChange={onSortByChange}
            options={(sortOptions.length ? sortOptions : SORT_OPTIONS).map((option) => ({
              value: option.id,
              label: option.name,
            }))}
            aria-label="Sắp xếp theo"
          />
        </div>
      </div>

      <details className={styles.moreFilters}>
        <summary>Thêm bộ lọc{advancedCount > 0 && <span> · {advancedCount} đang chọn</span>}</summary>
        <div className={styles.advancedFilters}>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-location">Địa điểm cụ thể</label>
            <SimpleUserSelect
              id="jobs-location"
              value={location}
              onChange={onLocationChange}
              disabled={metadataLoading}
              options={[
                { value: "", label: "Mọi địa điểm" },
                ...locations.map((place) => ({ value: place, label: place })),
              ]}
              aria-label="Địa điểm cụ thể"
            />
          </div>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-seniority">Cấp bậc</label>
            <SimpleUserSelect
              id="jobs-seniority"
              value={seniority}
              onChange={onSeniorityChange}
              options={[
                { value: "", label: "Mọi cấp bậc" },
                ...Object.entries(SENIORITY_LABELS).map(([val, lbl]) => ({ value: val, label: lbl })),
              ]}
              aria-label="Cấp bậc"
            />
          </div>
          <div className={styles.filterControl}>
            <label className={styles.controlLabel} htmlFor="jobs-workplace">Hình thức làm việc</label>
            <SimpleUserSelect
              id="jobs-workplace"
              value={workplaceType}
              onChange={onWorkplaceTypeChange}
              options={[
                { value: "", label: "Mọi hình thức" },
                ...Object.entries(WORKPLACE_LABELS).map(([val, lbl]) => ({ value: val, label: lbl })),
              ]}
              aria-label="Hình thức làm việc"
            />
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
