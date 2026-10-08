"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { jobsApi } from "@/services/jobsApi";
import { JobItem, JobListResponse, JobFilterMetadata } from "@/types/job";
import { JobsHero } from "@/components/user-component/jobs/JobsHero";
import { JobFilters } from "@/components/user-component/jobs/JobFilters";
import { JobCard } from "@/components/user-component/jobs/JobCard";
import { Loader2, Briefcase, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { toast } from "@/components/user-component/toast";
import styles from "@/components/user-component/jobs/jobs.module.css";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [keyword, setKeyword] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [technology, setTechnology] = useState("");
  const [location, setLocation] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Metadata from backend API
  const [metadata, setMetadata] = useState<JobFilterMetadata | null>(null);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch metadata once on mount
  useEffect(() => {
    let mounted = true;
    jobsApi
      .getFilterMetadata()
      .then((data) => {
        if (mounted && data) {
          setMetadata(data);
        }
      })
      .catch(() => {
        // Fallbacks in JobFilters will be used gracefully
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadJobs = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      try {
        const res: JobListResponse = await jobsApi.getJobs({
          keyword,
          seniority,
          workplace_type: workplaceType,
          technology,
          location,
          source_id: sourceId,
          sort_by: sortBy,
          page: targetPage,
          limit: 12,
        });
        setJobs(res.items || []);
        setTotal(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.total_pages || 1);
      } catch (err) {
        toast.error("Không thể tải danh sách việc làm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    },
    [keyword, seniority, workplaceType, technology, location, sourceId, sortBy]
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      loadJobs(1);
    }, 250);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [loadJobs]);

  const hasActiveFilters = Boolean(
    keyword ||
      seniority ||
      workplaceType ||
      technology ||
      location ||
      sourceId ||
      (sortBy && sortBy !== "recent")
  );

  const handleResetFilters = () => {
    setKeyword("");
    setSeniority("");
    setWorkplaceType("");
    setTechnology("");
    setLocation("");
    setSourceId("");
    setSortBy("recent");
  };

  const handleStartPractice = async (job: JobItem) => {
    setStartingJobId(job.job_id);
    try {
      const res = await jobsApi.startPractice(job.job_id);
      toast.success(`Đã chuẩn bị kịch bản phỏng vấn cho vị trí: ${job.title}!`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("target_job_title", job.title);
        sessionStorage.setItem("target_company_name", job.company?.company_name || "");
      }
      router.push(res.redirect_url);
    } catch (err) {
      toast.error("Khởi tạo buổi phỏng vấn thất bại. Vui lòng thử lại!");
      setStartingJobId(null);
    }
  };

  return (
    <div className={styles.container}>
      <JobsHero />

      <JobFilters
        keyword={keyword}
        onKeywordChange={(v) => setKeyword(v)}
        seniority={seniority}
        onSeniorityChange={(v) => setSeniority(v)}
        workplaceType={workplaceType}
        onWorkplaceTypeChange={(v) => setWorkplaceType(v)}
        technology={technology}
        onTechnologyChange={(v) => setTechnology(v)}
        location={location}
        onLocationChange={(v) => setLocation(v)}
        sourceId={sourceId}
        onSourceIdChange={(v) => setSourceId(v)}
        sortBy={sortBy}
        onSortByChange={(v) => setSortBy(v)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalCount={total}
        topTechnologies={metadata?.top_technologies}
        locations={metadata?.locations}
        sources={metadata?.sources}
        sortOptions={metadata?.sort_options}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#d98236] mb-3" />
          <p className="text-sm font-semibold text-[rgba(84,58,42,0.7)]">
            Đang tìm kiếm cơ hội việc làm phù hợp...
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-[rgba(84,58,42,0.4)]" />
          <h3 className="text-base font-bold text-[#211914] mb-1">
            Không tìm thấy tin tuyển dụng phù hợp
          </h3>
          <p className="text-sm text-[rgba(84,58,42,0.7)] max-w-md mx-auto mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc để xem thêm nhiều cơ hội khác.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleResetFilters}
              style={{ maxWidth: "200px", margin: "0 auto" }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#d98236]" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onStartPractice={handleStartPractice}
                isStarting={startingJobId === job.job_id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={page <= 1}
                onClick={() => loadJobs(page - 1)}
                style={{
                  opacity: page <= 1 ? 0.5 : 1,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  maxWidth: "140px",
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trang trước
              </button>

              <span className="text-xs font-bold px-3 text-[#211914]">
                Trang {page} / {totalPages} ({total} vị trí)
              </span>

              <button
                type="button"
                className={styles.btnSecondary}
                disabled={page >= totalPages}
                onClick={() => loadJobs(page + 1)}
                style={{
                  opacity: page >= totalPages ? 0.5 : 1,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  maxWidth: "140px",
                }}
              >
                Trang sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
