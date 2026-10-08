"use client";

import React from "react";
import { Search } from "lucide-react";
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
  topTechnologies?: string[];
}

const DEFAULT_TECHS = [
  "Java", "React", "Golang", "Python", "TypeScript", "Node.js", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "AWS"
];

const SENIORITY_LABELS: Record<string, string> = {
  "": "Tất cả cấp bậc",
  intern: "Thực tập sinh (Intern)",
  fresher: "Mới tốt nghiệp (Fresher)",
  junior: "Junior (1-2 năm)",
  mid: "Middle (2-4 năm)",
  senior: "Senior (4+ năm)",
  lead: "Team Lead / Trưởng nhóm",
};

const WORKPLACE_LABELS: Record<string, string> = {
  "": "Mọi hình thức",
  hybrid: "Hybrid (Linh hoạt)",
  remote: "Remote (Làm từ xa)",
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
  topTechnologies = DEFAULT_TECHS,
}: JobFiltersProps) {
  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo vị trí, công ty hoặc từ khóa..."
            className={`portal-input ${styles.searchInput}`}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        <select
          className={`portal-input ${styles.selectBox}`}
          value={seniority}
          onChange={(e) => onSeniorityChange(e.target.value)}
        >
          {Object.entries(SENIORITY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <select
          className={`portal-input ${styles.selectBox}`}
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

      <div className={styles.tagsRow}>
        <span className={styles.tagsLabel}>Công nghệ hot:</span>
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
    </div>
  );
}
