"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { jobsApi } from "@/services/jobsApi";
import { JobItem, JobListResponse } from "@/types/job";
import { JobsHero } from "@/components/user-component/jobs/JobsHero";
import { JobFilters } from "@/components/user-component/jobs/JobFilters";
import { JobCard } from "@/components/user-component/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/user-component/toast";
import styles from "@/components/user-component/jobs/jobs.module.css";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [technology, setTechnology] = useState("");
  const [startingJobId, setStartingJobId] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const loadJobs = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      try {
        const res: JobListResponse = await jobsApi.getJobs({
          keyword,
          seniority,
          workplace_type: workplaceType,
          technology,
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
    [keyword, seniority, workplaceType, technology]
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      loadJobs(1);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [loadJobs]);

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
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Đang tải danh sách cơ hội việc làm...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Không tìm thấy tin tuyển dụng phù hợp
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để khám phá thêm nhiều cơ hội khác.
          </p>
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
              <Button
                variant="home-secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => loadJobs(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trang trước
              </Button>

              <span className="text-xs font-semibold px-3 text-slate-600">
                Trang {page} / {totalPages} (Tổng {total} vị trí)
              </span>

              <Button
                variant="home-secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => loadJobs(page + 1)}
              >
                Trang sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
