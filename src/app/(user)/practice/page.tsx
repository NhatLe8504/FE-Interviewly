"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/apiClient";
import { jdInterviewApi, type JDJobSummary } from "@/services/jdInterviewApi";
import { PracticeHero } from "./components/PracticeHero";
import styles from "./practice.module.css";

const PAGE_SIZE = 30;
const INTERVIEWS_PER_PAGE = 6;
const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "ready", label: "Sẵn sàng luyện" },
  { value: "processing", label: "Đang chuẩn bị" },
  { value: "failed", label: "Cần kiểm tra" },
] as const;
const LEVELS = [
  { value: "all", label: "Mọi cấp độ" },
  { value: "intern", label: "Intern" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
];
const JOB_STATUSES: Record<JDJobSummary["status"], string> = {
  PENDING: "Chờ xử lý",
  INGESTING: "Đang đọc JD",
  NORMALIZED: "Đang phân tích JD",
  ANALYZING: "Đang phân tích JD",
  PLANNING: "Đang lên nội dung",
  GENERATING: "Đang tạo câu hỏi",
  VALIDATING: "Đang kiểm tra câu hỏi",
  COMPLETED: "Sẵn sàng luyện",
  FAILED: "Tạo câu hỏi chưa thành công",
  RETRYING: "Đang thử lại",
};
const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
});

type StatusFilter = typeof STATUS_FILTERS[number]["value"];
type LoadError = { message: string; authenticationRequired: boolean };

function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

function normalizeLevel(value: string) {
  const level = normalizeSearch(value);
  if (["middle", "mid-level", "mid level"].includes(level)) return "mid";
  if (["staff", "principal", "team lead", "tech lead"].includes(level)) return "lead";
  return level;
}

function getJobThumbnail(role: string) {
  const normalizedRole = normalizeSearch(role);
  if (/\b(data|ai|ml|machine learning|analytics|cloud|security|du lieu)\b/.test(normalizedRole)) {
    return "/images/practice/technology.webp";
  }
  if (/\b(product|manager|management|business|marketing|san pham|quan ly)\b/.test(normalizedRole)) {
    return "/images/practice/product.webp";
  }
  return "/images/practice/engineering.webp";
}

function JobRow({ job }: { job: JDJobSummary }) {
  const isReady = job.status === "COMPLETED";
  const isFailed = job.status === "FAILED";
  const jobId = encodeURIComponent(job.job_id);
  const href = isReady ? `/practice/setup/${jobId}` : `/practice/new?job_id=${jobId}`;
  const level = LEVELS.find((item) => item.value === normalizeLevel(job.seniority))?.label || job.seniority;
  const createdAt = job.created_at ? new Date(job.created_at) : null;
  const dateLabel = createdAt && !Number.isNaN(createdAt.getTime()) ? DATE_FORMAT.format(createdAt) : null;
  const progress = !isReady && !isFailed && Number.isFinite(job.progress_pct) && job.progress_pct > 0
    ? ` · ${Math.round(Math.min(100, Math.max(0, job.progress_pct)))}%`
    : "";

  return (
    <li>
      <Link href={href} className={styles.jobRow}>
        <div className={styles.jobThumbnail}>
          <Image
            src={getJobThumbnail(job.role)}
            alt=""
            fill
            sizes="(max-width: 480px) 92px, (max-width: 767px) 112px, (max-width: 900px) 128px, 160px"
            className={styles.thumbnailImage}
          />
        </div>
        <div className={styles.jobContent}>
          <p className={styles.jobCompany}>{job.company_name || "Phỏng vấn theo JD"}</p>
          <h3 className={styles.jobTitle}>{job.role || "Buổi phỏng vấn theo mô tả công việc"}</h3>
          <div className={styles.jobMeta}>
            {level && <span>{level}</span>}
            {job.total_questions > 0 && <span>{job.total_questions} câu hỏi</span>}
            {job.estimated_minutes > 0 && <span>Dự kiến {job.estimated_minutes} phút</span>}
          </div>
          {job.focus_areas?.length > 0 && <p className={styles.jobTopics}>{job.focus_areas.join(" · ")}</p>}
        </div>
        <div className={styles.jobDetails}>
          <p className={`${styles.jobStatus} ${isReady ? styles.statusReady : isFailed ? styles.statusFailed : ""}`}>
            {JOB_STATUSES[job.status]}{progress}
          </p>
          {dateLabel && <time dateTime={job.created_at ?? undefined} className={styles.jobDate}>Tạo ngày {dateLabel}</time>}
          <span className={styles.jobAction}>{isReady ? "Thiết lập buổi luyện" : isFailed ? "Xem chi tiết lỗi" : "Xem tiến độ"}</span>
        </div>
      </Link>
    </li>
  );
}

function LoadingJobs() {
  return (
    <div className={styles.loadingState}>
      <p role="status">Đang tải các buổi luyện…</p>
      <div className={styles.skeletonList} aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.skeletonRow}>
            <span className={styles.skeletonThumbnail} />
            <div className={styles.skeletonContent}><span /><span /><span /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeJobs() {
  const [jobs, setJobs] = useState<JDJobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    jdInterviewApi.getMyJobs(PAGE_SIZE, pageIndex * PAGE_SIZE)
      .then((result) => {
        if (!mounted) return;
        setJobs((previous) => pageIndex === 0
          ? result
          : Array.from(new Map([...previous, ...result].map((job) => [job.job_id, job])).values()));
        setHasMore(result.length === PAGE_SIZE);
      })
      .catch((cause: unknown) => {
        if (!mounted) return;
        const authenticationRequired = cause instanceof ApiError && cause.status === 401;
        setLoadError({
          authenticationRequired,
          message: authenticationRequired
            ? "Phiên đăng nhập đã hết hạn. Đăng nhập lại để xem các buổi luyện."
            : "Chưa tải được các buổi luyện. Vui lòng thử lại sau ít phút.",
        });
      })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [pageIndex, reloadKey]);

  const filteredJobs = useMemo(() => {
    const search = normalizeSearch(query);
    return jobs.filter((job) => {
      if (statusFilter === "ready" && job.status !== "COMPLETED") return false;
      if (statusFilter === "failed" && job.status !== "FAILED") return false;
      if (statusFilter === "processing" && ["COMPLETED", "FAILED"].includes(job.status)) return false;
      if (levelFilter !== "all" && normalizeLevel(job.seniority) !== levelFilter) return false;
      const searchable = [job.role, job.company_name, job.seniority, ...(job.focus_areas || [])].join(" ");
      return !search || normalizeSearch(searchable).includes(search);
    });
  }, [jobs, query, statusFilter, levelFilter]);
  const hasFilters = Boolean(query.trim()) || statusFilter !== "all" || levelFilter !== "all";
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / INTERVIEWS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const firstJobIndex = (visiblePage - 1) * INTERVIEWS_PER_PAGE;
  const pageJobs = filteredJobs.slice(firstJobIndex, firstJobIndex + INTERVIEWS_PER_PAGE);
  const firstPageNumber = Math.max(1, Math.min(visiblePage - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPageNumber + index);

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setLevelFilter("all");
    setCurrentPage(1);
  }

  function refreshJobs() {
    setIsLoading(true);
    setLoadError(null);
    setPageIndex(0);
    setCurrentPage(1);
    setReloadKey((previous) => previous + 1);
  }

  function retryRequest() {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((previous) => previous + 1);
  }

  function loadMore() {
    setIsLoading(true);
    setLoadError(null);
    setPageIndex((previous) => previous + 1);
  }

  return (
    <div className={styles.workspace} aria-busy={isLoading}>
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <label htmlFor="practice-search">Tìm buổi luyện</label>
          <input id="practice-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} placeholder="Vị trí, công ty hoặc kỹ năng" autoComplete="off" />
        </div>
        <div className={styles.levelField}>
          <label htmlFor="practice-level">Cấp độ</label>
          <select id="practice-level" value={levelFilter} onChange={(event) => { setLevelFilter(event.target.value); setCurrentPage(1); }}>
            {LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
          </select>
        </div>
        <button type="button" className={styles.refreshButton} onClick={refreshJobs} disabled={isLoading}>
          {isLoading && jobs.length > 0 && pageIndex === 0 ? "Đang cập nhật…" : "Cập nhật danh sách"}
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.statusFilters} role="group" aria-label="Lọc theo trạng thái">
          {STATUS_FILTERS.map((filter) => (
            <button key={filter.value} type="button" className={styles.filterButton} aria-pressed={statusFilter === filter.value} onClick={() => { setStatusFilter(filter.value); setCurrentPage(1); }}>{filter.label}</button>
          ))}
        </div>
        {hasFilters && <button type="button" className={styles.textButton} onClick={resetFilters}>Bỏ bộ lọc</button>}
      </div>

      {loadError && (
        <div className={styles.errorState} role="alert">
          <p>{loadError.message}</p>
          {loadError.authenticationRequired
            ? <Link href="/login" className={styles.textButton}>Đăng nhập lại</Link>
            : <button type="button" className={styles.textButton} onClick={retryRequest} disabled={isLoading}>{isLoading ? "Đang thử lại…" : "Thử lại"}</button>}
        </div>
      )}

      {isLoading && jobs.length === 0 ? <LoadingJobs /> : !loadError?.authenticationRequired && (
        <>
          {jobs.length > 0 && (
            <p className={styles.resultCount} role="status">
              {hasFilters ? `${filteredJobs.length} trên ${jobs.length} buổi đã tải` : `${jobs.length} buổi đã tải`}<span>Mới nhất trước</span>
            </p>
          )}
          {filteredJobs.length > 0 ? (
            <ul id="practice-job-list" className={styles.jobList}>{pageJobs.map((job) => <JobRow key={job.job_id} job={job} />)}</ul>
          ) : !loadError && (
            <div className={styles.emptyState}>
              <p className={styles.emptyEyebrow}>{jobs.length > 0 ? "CHƯA CÓ KẾT QUẢ PHÙ HỢP" : "BẮT ĐẦU TỪ CÔNG VIỆC BẠN MUỐN"}</p>
              <h3>{jobs.length > 0 ? "Thử tìm theo một cách khác." : "Buổi luyện đầu tiên đang chờ bạn."}</h3>
              <p>{jobs.length > 0 ? "Đổi từ khóa hoặc bỏ bộ lọc để xem lại các buổi đã tải." : "Thêm mô tả công việc để tạo câu hỏi theo vị trí bạn đang ứng tuyển. Các buổi đã tạo sẽ xuất hiện tại đây."}</p>
              {jobs.length > 0
                ? <button type="button" className={styles.outlineButton} onClick={resetFilters}>Xem tất cả buổi đã tải</button>
                : <Link href="/practice/new" className={styles.outlineButton}>Tạo buổi luyện đầu tiên</Link>}
            </div>
          )}
          {filteredJobs.length > 0 && (
            <div className={styles.pagination}>
              <p className={styles.paginationSummary} role="status">
                Hiển thị {firstJobIndex + 1}–{firstJobIndex + pageJobs.length} / {filteredJobs.length} buổi đã tải
              </p>
              <nav className={styles.paginationNav} aria-label="Phân trang buổi luyện">
                <button type="button" className={styles.pageButton} onClick={() => setCurrentPage(visiblePage - 1)} disabled={visiblePage === 1 || isLoading} aria-controls="practice-job-list">Trước</button>
                {pageNumbers.map((page) => (
                  <button key={page} type="button" className={styles.pageButton} aria-label={`Trang ${page}`} aria-current={page === visiblePage ? "page" : undefined} aria-controls="practice-job-list" disabled={isLoading} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button type="button" className={styles.pageButton} onClick={() => setCurrentPage(visiblePage + 1)} disabled={visiblePage === totalPages || isLoading} aria-controls="practice-job-list">Sau</button>
              </nav>
            </div>
          )}
          {hasMore && (
            <div className={styles.loadMore}>
              <button type="button" className={styles.outlineButton} onClick={loadMore} disabled={isLoading || Boolean(loadError)}>{isLoading ? "Đang tải thêm…" : "Tải thêm buổi luyện"}</button>
              <p>Tìm kiếm và bộ lọc áp dụng cho các buổi đã tải.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PracticeOverviewPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className={styles.pageShell}>
      <PracticeHero />
      <section id="practice-sessions" className={styles.sessions} aria-labelledby="sessions-title">
        <div className={styles.sectionHeader}>
          <div><p className={styles.sectionEyebrow}>TIẾP TỤC TỪ ĐÂY</p><h2 id="sessions-title">Buổi luyện đã tạo</h2></div>
          <p>Chọn một buổi để thiết lập và bắt đầu.<br />Giọng nói hay văn bản, bạn quyết định.</p>
        </div>
        {isLoading ? <LoadingJobs /> : user ? <PracticeJobs key={user.user_id} /> : (
          <div className={styles.emptyState}>
            <p className={styles.emptyEyebrow}>KHÔNG GIAN LUYỆN TẬP CỦA BẠN</p>
            <h3>Đăng nhập để tiếp tục.</h3>
            <p>Xem lại các buổi đã tạo và chuẩn bị cho lần phỏng vấn tiếp theo.</p>
            <Link href="/login" className={styles.outlineButton}>Đăng nhập</Link>
          </div>
        )}
      </section>
    </div>
  );
}
