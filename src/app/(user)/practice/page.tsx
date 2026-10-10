"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/apiClient";
import { jdInterviewApi, type JDJobSummary } from "@/services/jdInterviewApi";
import { PracticeHero } from "./components/PracticeHero";
import { Button } from "@/components/ui/button";
import { SimpleUserSelect } from "@/components/user-component/common";
import { UserPagination } from "@/components/user-component/common/Pagination";
import { Layers, Globe, Lock, User, Users, Briefcase } from "lucide-react";
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
type PracticeScope = "my" | "community";

function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").trim();
}

function normalizeLevel(value: string) {
  const level = normalizeSearch(value);
  if (["middle", "mid-level", "mid level"].includes(level)) return "mid";
  if (["staff", "principal", "team lead", "tech lead"].includes(level)) return "lead";
  return level;
}

function JobRow({ job, isCommunity = false }: { job: JDJobSummary; isCommunity?: boolean }) {
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

  const skillsList = (job.skills && job.skills.length > 0) ? job.skills : job.focus_areas;

  return (
    <li>
      <Link href={href} className={styles.jobRow}>
        <div className={styles.jobThumbnail}>
          {job.company_logo_url ? (
            <div className={styles.companyLogoContainer}>
              <img
                src={job.company_logo_url}
                alt={job.company_name || ""}
                className={styles.companyLogoImg}
              />
            </div>
          ) : job.company_banner_url ? (
            <img
              src={job.company_banner_url}
              alt={job.company_name || ""}
              className={styles.thumbnailImage}
            />
          ) : (
            <div className={styles.defaultThumbnail}>
              <Briefcase size={26} className={styles.defaultThumbnailIcon} />
              <span className={styles.defaultThumbnailTag}>JD Tự do</span>
            </div>
          )}
        </div>
        <div className={styles.jobContent}>
          <div className={styles.companyRow}>
            <p className={styles.jobCompany}>{job.company_name || "Phỏng vấn theo JD"}</p>
            {isCommunity ? (
              <span className={styles.publicBadge} title="Bộ đề được chia sẻ từ cộng đồng">
                <Globe size={11} /> Cộng đồng
              </span>
            ) : job.is_public ? (
              <span className={styles.publicBadge} title="Bộ đề đang công khai">
                <Globe size={11} /> Công khai
              </span>
            ) : (
              <span className={styles.privateBadge} title="Bộ đề riêng tư">
                <Lock size={11} /> Riêng tư
              </span>
            )}
            {job.origin_job_id && (
              <span
                className={styles.publicBadge}
                style={{ background: "rgba(217, 130, 54, 0.08)", color: "#d98236", borderColor: "rgba(217, 130, 54, 0.25)" }}
              >
                Việc làm hệ thống
              </span>
            )}
          </div>
          <h3 className={styles.jobTitle}>{job.role || "Buổi phỏng vấn theo mô tả công việc"}</h3>
          <div className={styles.jobMeta}>
            {level && <span>{level}</span>}
            {job.total_questions > 0 && <span>{job.total_questions} câu hỏi</span>}
            {job.estimated_minutes > 0 && <span>Dự kiến {job.estimated_minutes} phút</span>}
          </div>
          {skillsList && skillsList.length > 0 && (
            <div className={styles.jobSkillsRow}>
              {skillsList.slice(0, 4).map((skill, sIdx) => {
                const cleanSkill = skill.length > 28 ? skill.slice(0, 27) + "…" : skill;
                return (
                  <span key={sIdx} className={styles.skillPill} title={skill}>
                    {cleanSkill}
                  </span>
                );
              })}
              {skillsList.length > 4 && (
                <span className={styles.skillMorePill}>+{skillsList.length - 4}</span>
              )}
            </div>
          )}
        </div>
        <div className={styles.jobDetails}>
          <p className={`${styles.jobStatus} ${isReady ? styles.statusReady : isFailed ? styles.statusFailed : ""}`}>
            {JOB_STATUSES[job.status]}{progress}
          </p>
          {dateLabel && <time dateTime={job.created_at ?? undefined} className={styles.jobDate}>{dateLabel}</time>}
          <span className={styles.jobAction}>{isReady ? "Bắt đầu luyện tập →" : "Tiếp tục chuẩn bị →"}</span>
          {job.origin_job_id && (
            <span
              className={styles.jobOriginSubLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`/jobs/${job.origin_job_id}`, "_blank", "noopener,noreferrer");
              }}
              title="Xem tin tuyển dụng gốc"
            >
              Xem tin tuyển dụng ↗
            </span>
          )}
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

interface PracticeJobsProps {
  scope: PracticeScope;
  isLoggedIn: boolean;
}

function PracticeJobs({ scope, isLoggedIn }: PracticeJobsProps) {
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
    setIsLoading(true);
    setLoadError(null);

    const fetchPromise = scope === "community"
      ? jdInterviewApi.getCommunityJobs(PAGE_SIZE, pageIndex * PAGE_SIZE)
      : jdInterviewApi.getMyJobs(PAGE_SIZE, pageIndex * PAGE_SIZE);

    fetchPromise
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
  }, [scope, pageIndex, reloadKey]);

  const filteredJobs = useMemo(() => {
    const search = normalizeSearch(query);
    return jobs.filter((job) => {
      if (scope === "my") {
        if (statusFilter === "ready" && job.status !== "COMPLETED") return false;
        if (statusFilter === "failed" && job.status !== "FAILED") return false;
        if (statusFilter === "processing" && ["COMPLETED", "FAILED"].includes(job.status)) return false;
      }
      if (levelFilter !== "all" && normalizeLevel(job.seniority) !== levelFilter) return false;
      const searchable = [job.role, job.company_name, job.seniority, ...(job.focus_areas || [])].join(" ");
      return !search || normalizeSearch(searchable).includes(search);
    });
  }, [jobs, query, statusFilter, levelFilter, scope]);

  const hasFilters = Boolean(query.trim()) || (scope === "my" && statusFilter !== "all") || levelFilter !== "all";
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / INTERVIEWS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const firstJobIndex = (visiblePage - 1) * INTERVIEWS_PER_PAGE;
  const pageJobs = filteredJobs.slice(firstJobIndex, firstJobIndex + INTERVIEWS_PER_PAGE);

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

  if (scope === "my" && !isLoggedIn) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyEyebrow}>KHÔNG GIAN LUYỆN TẬP CỦA BẠN</p>
        <h3>Đăng nhập để xem buổi luyện cá nhân.</h3>
        <p>Xem lại các buổi bạn đã tạo hoặc chuyển sang tab Bộ đề cộng đồng để luyện tập ngay các đề mở.</p>
        <Button asChild variant="home-outline"><Link href="/login">Đăng nhập</Link></Button>
      </div>
    );
  }

  return (
    <div className={styles.workspace} aria-busy={isLoading}>
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <input
            id="practice-search"
            className="portal-input"
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }}
            placeholder="Vị trí, công ty hoặc kỹ năng…"
            aria-label="Tìm kiếm theo vị trí, công ty hoặc kỹ năng"
            autoComplete="off"
          />
        </div>
        <div className={styles.levelField}>
          <SimpleUserSelect
            id="practice-level"
            value={levelFilter}
            onChange={(value) => { setLevelFilter(value); setCurrentPage(1); }}
            options={LEVELS}
            icon={<Layers size={14} className="text-[#8b4513]" />}
            aria-label="Cấp độ"
          />
        </div>
        <Button type="button" variant="home-quiet" onClick={refreshJobs} disabled={isLoading}>
          {isLoading && jobs.length > 0 && pageIndex === 0 ? "Đang cập nhật…" : "Cập nhật danh sách"}
        </Button>
      </div>

      {scope === "my" && (
        <div className={styles.filterBar}>
          <div className={styles.statusFilters} role="group" aria-label="Lọc theo trạng thái">
            {STATUS_FILTERS.map((filter) => (
              <Button key={filter.value} type="button" variant="home-tab" aria-pressed={statusFilter === filter.value} onClick={() => { setStatusFilter(filter.value); setCurrentPage(1); }}>{filter.label}</Button>
            ))}
          </div>
          {hasFilters && <Button type="button" variant="home-quiet" size="home-compact" onClick={resetFilters}>Bỏ bộ lọc</Button>}
        </div>
      )}

      {loadError && (
        <div className={styles.errorState} role="alert">
          <p>{loadError.message}</p>
          {loadError.authenticationRequired
            ? <Button asChild variant="home-quiet" size="home-compact"><Link href="/login">Đăng nhập lại</Link></Button>
            : <Button type="button" variant="home-quiet" size="home-compact" onClick={retryRequest} disabled={isLoading}>{isLoading ? "Đang thử lại…" : "Thử lại"}</Button>}
        </div>
      )}

      {isLoading && jobs.length === 0 ? <LoadingJobs /> : !loadError?.authenticationRequired && (
        <>
          {jobs.length > 0 && (
            <p className={styles.resultCount} role="status">
              {hasFilters ? `${filteredJobs.length} trên ${jobs.length} buổi đã tải` : `${jobs.length} buổi đã tải`}
              <span>{scope === "community" ? "Đề chuẩn hóa cộng đồng" : "Mới nhất trước"}</span>
            </p>
          )}
          {filteredJobs.length > 0 ? (
            <ul id="practice-job-list" className={styles.jobList}>
              {pageJobs.map((job) => <JobRow key={job.job_id} job={job} isCommunity={scope === "community"} />)}
            </ul>
          ) : !loadError && (
            <div className={styles.emptyState}>
              <p className={styles.emptyEyebrow}>
                {jobs.length > 0
                  ? "CHƯA CÓ KẾT QUẢ PHÙ HỢP"
                  : scope === "community"
                  ? "BỘ ĐỀ CỘNG ĐỒNG"
                  : "BẮT ĐẦU TỪ CÔNG VIỆC BẠN MUỐN"}
              </p>
              <h3>
                {jobs.length > 0
                  ? "Thử tìm theo một cách khác."
                  : scope === "community"
                  ? "Chưa có bộ đề nào được chia sẻ."
                  : "Buổi luyện đầu tiên đang chờ bạn."}
              </h3>
              <p>
                {jobs.length > 0
                  ? "Đổi từ khóa hoặc bộ lọc để xem lại các bộ đề đã tải."
                  : scope === "community"
                  ? "Hãy là người đầu tiên tạo buổi luyện theo JD và bật chế độ chia sẻ công khai!"
                  : "Thêm mô tả công việc để tạo câu hỏi theo vị trí bạn đang ứng tuyển. Các buổi đã tạo sẽ xuất hiện tại đây."}
              </p>
              {jobs.length > 0 ? (
                <Button type="button" variant="home-outline" onClick={resetFilters}>Xem tất cả bộ đề</Button>
              ) : (
                <Button asChild variant="home-primary"><Link href="/practice/new">Tạo buổi luyện từ JD</Link></Button>
              )}
            </div>
          )}
          {filteredJobs.length > 0 && (
            <UserPagination
              currentPage={visiblePage}
              totalPages={totalPages}
              totalItems={filteredJobs.length}
              pageSize={INTERVIEWS_PER_PAGE}
              itemLabel="buổi đã tải"
              onPageChange={setCurrentPage}
              disabled={isLoading}
              controlsId="practice-job-list"
              ariaLabel="Phân trang buổi luyện"
            />
          )}
          {hasMore && (
            <div className={styles.loadMore}>
              <Button type="button" variant="home-outline" onClick={loadMore} disabled={isLoading || Boolean(loadError)}>{isLoading ? "Đang tải thêm…" : "Tải thêm bộ đề"}</Button>
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
  const [scope, setScope] = useState<PracticeScope>("my");

  // Nếu chưa login khi load xong thì mặc định sang tab cộng đồng để người dùng có thể xem được nội dung
  useEffect(() => {
    if (!isLoading && !user) {
      setScope("community");
    }
  }, [isLoading, user]);

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.pageShell}>
        <PracticeHero />
        <section id="practice-sessions" className={styles.sessions} aria-labelledby="sessions-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>
                {scope === "my" ? "TIẾP TỤC TỪ ĐÂY" : "KHÁM PHÁ CỘNG ĐỒNG"}
              </p>
              <h2 id="sessions-title">
                {scope === "my" ? "Buổi luyện đã tạo" : "Bộ đề từ cộng đồng"}
              </h2>
            </div>
            <p>
              {scope === "my"
                ? <>Chọn một buổi để thiết lập và bắt đầu.<br />Giọng nói hay văn bản, bạn quyết định.</>
                : <>Luyện tập với các bộ câu hỏi thực tế được tạo từ JD do cộng đồng chia sẻ.<br />Đầy đủ tiêu chí đánh giá và thời lượng chuẩn hóa.</>}
            </p>
          </div>

          {/* Tab switch giữa Buổi luyện của tôi và Bộ đề cộng đồng */}
          <div className={styles.scopeTabs} role="tablist" aria-label="Phạm vi hiển thị bộ đề">
            <button
              type="button"
              role="tab"
              aria-selected={scope === "my"}
              className={`${styles.scopeTab} ${scope === "my" ? styles.scopeTabActive : ""}`}
              onClick={() => setScope("my")}
            >
              <User size={14} />
              <span>Buổi luyện của tôi</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === "community"}
              className={`${styles.scopeTab} ${scope === "community" ? styles.scopeTabActive : ""}`}
              onClick={() => setScope("community")}
            >
              <Users size={14} />
              <span>Bộ đề từ cộng đồng</span>
            </button>
          </div>

          {isLoading ? (
            <LoadingJobs />
          ) : (
            <PracticeJobs scope={scope} isLoggedIn={Boolean(user)} />
          )}
        </section>
      </div>
    </main>
  );
}
