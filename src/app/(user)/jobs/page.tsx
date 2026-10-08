"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { jobsApi } from "@/services/jobsApi";
import { JobItem, JobListResponse, JobFilterMetadata } from "@/types/job";
import { JobsHero } from "@/components/user-component/jobs/JobsHero";
import { JobFilters } from "@/components/user-component/jobs/JobFilters";
import { JobCard } from "@/components/user-component/jobs/JobCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/user-component/toast";
import styles from "@/components/user-component/jobs/jobs.module.css";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [pending, setLoading] = useState(true);
  const [resultFilterKey, setResultFilterKey] = useState<string | null>(null);
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
  const [countryCode, setCountryCode] = useState("VN");
  const [error, setError] = useState<string | null>(null);

  // Metadata from backend API
  const [metadataResult, setMetadataResult] = useState<{ countryCode: string; data: JobFilterMetadata | null } | null>(null);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);

  const filterKey = JSON.stringify([keyword, seniority, workplaceType, technology, location, sourceId, sortBy, countryCode]);
  const loading = pending || resultFilterKey !== filterKey;
  const metadataLoading = metadataResult?.countryCode !== countryCode;
  const metadata = metadataLoading ? null : metadataResult?.data;
  const metadataError = !metadataLoading && !metadata;

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const requestSequence = useRef(0);

  useEffect(() => {
    let mounted = true;
    jobsApi
      .getFilterMetadata(countryCode)
      .then((data) => {
        if (mounted && data) {
          setMetadataResult({ countryCode, data });
        }
      })
      .catch(() => {
        if (mounted) setMetadataResult({ countryCode, data: null });
      });
    return () => {
      mounted = false;
    };
  }, [countryCode]);

  const loadJobs = useCallback(
    async (targetPage = 1) => {
      const sequence = ++requestSequence.current;
      setLoading(true);
      setError(null);
      try {
        const res: JobListResponse = await jobsApi.getJobs({
          keyword,
          seniority,
          workplace_type: workplaceType,
          technology,
          location,
          source_id: sourceId,
          country_code: countryCode,
          sort_by: sortBy,
          page: targetPage,
          limit: 12,
        });
        if (sequence !== requestSequence.current) return;
        setJobs(res.items || []);
        setTotal(res.total || 0);
        setPage(res.page || targetPage);
        setTotalPages(res.total_pages || 1);
      } catch {
        if (sequence === requestSequence.current) {
          setPage(targetPage);
          setError("Không thể tải danh sách việc làm. Vui lòng thử lại.");
        }
      } finally {
        if (sequence === requestSequence.current) {
          setResultFilterKey(filterKey);
          setLoading(false);
        }
      }
    },
    [keyword, seniority, workplaceType, technology, location, sourceId, sortBy, countryCode, filterKey]
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      loadJobs(1);
    }, 250);

    return () => {
      requestSequence.current += 1;
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
      countryCode !== "VN" ||
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
    setCountryCode("VN");
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
        countryCode={countryCode}
        onCountryCodeChange={(value) => { setCountryCode(value); setLocation(""); setSourceId(""); setTechnology(""); }}
        sourceId={sourceId}
        onSourceIdChange={(v) => setSourceId(v)}
        sortBy={sortBy}
        onSortByChange={(v) => setSortBy(v)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalCount={total}
        loading={loading}
        resultsError={Boolean(error)}
        metadataLoading={metadataLoading}
        metadataError={metadataError}
        topTechnologies={metadata?.top_technologies}
        locations={metadata?.locations}
        countries={metadata?.countries}
        sources={metadata?.sources}
        sortOptions={metadata?.sort_options}
      />

      {loading ? (
        <section role="status" aria-label="Đang tải danh sách việc làm">
          <span className="sr-only">Đang tải danh sách việc làm…</span>
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: 6 }, (_, placeholderIndex) => (
              <div key={placeholderIndex} className={styles.card + " " + styles.skeletonCard}>
                <div className={styles.skeletonBanner} />
                <div className={styles.skeletonBody}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div>
              </div>
            ))}
          </div>
        </section>
      ) : error ? (
        <section className={styles.emptyState} role="alert">
          <h2>Chưa tải được việc làm</h2>
          <p>{error}</p>
          <Button type="button" variant="home-primary" size="home-compact" onClick={() => loadJobs(page)}>Thử lại</Button>
        </section>
      ) : jobs.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>Chưa có vị trí phù hợp với lựa chọn này</h2>
          <p>Thử một từ khóa rộng hơn hoặc bỏ bớt bộ lọc. Các cơ hội ở quốc gia khác vẫn có trong lựa chọn thị trường tuyển dụng.</p>
          {hasActiveFilters && <Button type="button" variant="home-secondary" size="home-compact" onClick={handleResetFilters}>Đặt lại bộ lọc</Button>}
        </section>
      ) : (
        <>
          <div className={styles.grid}>
            {jobs.map((job) => <JobCard key={job.job_id} job={job} onStartPractice={handleStartPractice} isStarting={startingJobId === job.job_id} />)}
          </div>
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Phân trang việc làm">
              <Button type="button" variant="home-secondary" size="home-compact" disabled={page <= 1} onClick={() => loadJobs(page - 1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />Trang trước
              </Button>
              <span className={styles.paginationInfo}>Trang {page} / {totalPages}</span>
              <Button type="button" variant="home-secondary" size="home-compact" disabled={page >= totalPages} onClick={() => loadJobs(page + 1)}>
                Trang sau<ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
