"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jobsApi } from "@/services/jobsApi";
import { JobDetail } from "@/types/job";
import { Button } from "@/components/ui/button";
import { JobQuickActionPanel } from "@/components/user-component/jobs/JobQuickActionPanel";
import { JobThumbnail } from "@/components/user-component/jobs/JobThumbnail";
import { JobSourceMark } from "@/components/user-component/jobs/JobSourceMark";
import { JobDescription } from "@/components/user-component/jobs/JobDescription";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { formatJobTimestamp, getJobTechnologies, SENIORITY_LABELS, WORKPLACE_LABELS } from "@/lib/job-presentation";
import { getBrandLabel } from "@/lib/brand-icons";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/user-component/toast";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuth } from "@/context/AuthContext";
import { ProUpgradeJobModal } from "@/components/user-component/jobs/ProUpgradeJobModal";
import styles from "./jobDetail.module.css";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();

  const { isSubscribed } = useUserSubscription();
  const { isAuthenticated } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [jobResponse, setJobResponse] = useState<{ jobId: string; retryAttempt: number; job: JobDetail | null } | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const loading = jobResponse?.jobId !== jobId || jobResponse?.retryAttempt !== retryAttempt;
  const job = loading ? null : jobResponse?.job;

  useEffect(() => {
    let mounted = true;
    jobsApi
      .getJobDetail(jobId)
      .then((data) => {
        if (mounted) setJobResponse({ jobId, retryAttempt, job: data });
      })
      .catch(() => {
        if (mounted) setJobResponse({ jobId, retryAttempt, job: null });
      });

    return () => {
      mounted = false;
    };
  }, [jobId, retryAttempt]);

  const handleStartPractice = async () => {
    if (!job) return;

    // Nếu chưa có buổi luyện và tài khoản là Free -> mở modal nâng cấp Pro ngay
    if (!job.has_practice_session && !isSubscribed) {
      setUpgradeModalOpen(true);
      return;
    }

    setIsStarting(true);
    try {
      const res = await jobsApi.startPractice(job.job_id);
      if (res.has_existing_session) {
        toast.success("Buổi luyện đã sẵn sàng! Đang chuyển đến phòng luyện tập...");
      } else {
        toast.success(`Đã chuẩn bị kịch bản phỏng vấn cho vị trí: ${job.title}!`);
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("target_job_title", job.title);
        sessionStorage.setItem("target_company_name", job.company?.company_name || "");
      }
      router.push(res.redirect_url);
    } catch (err: any) {
      setIsStarting(false);
      const errMsg = err?.message || err?.data?.detail || "";
      if (err?.status === 403 || errMsg.toLowerCase().includes("pro")) {
        setUpgradeModalOpen(true);
      } else if (err?.status === 401 || !isAuthenticated) {
        toast.error("Vui lòng đăng nhập để bắt đầu buổi luyện phỏng vấn!");
        router.push(`/auth/login?redirect=/jobs/${job.job_id}`);
      } else {
        toast.error("Không thể khởi tạo buổi phỏng vấn. Vui lòng thử lại!");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container} role="status" aria-label="Đang tải chi tiết việc làm">
        <span className="sr-only">Đang tải thông tin công việc…</span>
        <div className={styles.loadingHeader} aria-hidden="true" /><div className={styles.loadingBody} aria-hidden="true" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.container}>
        <section className={styles.unavailable}>
          <h1>Chưa mở được tin tuyển dụng</h1>
          <p>Tin có thể đã hết hạn, bị gỡ hoặc máy chủ chưa phản hồi. Thử lại hoặc khám phá một cơ hội khác.</p>
          <div className={styles.unavailableActions}>
            <Button type="button" variant="home-primary" onClick={() => setRetryAttempt((previous) => previous + 1)}>Thử lại</Button>
            <Button asChild variant="home-secondary"><Link href="/jobs">Danh sách việc làm</Link></Button>
          </div>
        </section>
      </div>
    );
  }

  const postedTime = formatJobTimestamp(job.posted_at, "posted");
  const syncedTime = formatJobTimestamp(job.last_synced_at, "synced");
  const technologies = getJobTechnologies(job);
  const employmentLabels: Record<string, string> = { full_time: "Toàn thời gian", part_time: "Bán thời gian", contract: "Hợp đồng", internship: "Thực tập" };

  return (
    <div className={styles.container}>
      <nav className={styles.backButton} aria-label="Điều hướng việc làm">
        <Button asChild variant="home-quiet" size="home-compact"><Link href="/jobs"><ArrowLeft className="size-4" aria-hidden="true" />Tất cả việc làm</Link></Button>
      </nav>
      <div className={styles.layout}>
        <section className={styles.headerCard} aria-labelledby="job-detail-title">
          <JobThumbnail job={job} aspectRatio="wide" />
          <div className={styles.headerBody}>
            <div className={styles.sourceRow}>
              <JobSourceMark job={job} />
              {postedTime ? <time dateTime={postedTime.dateTime} title={postedTime.title}>{postedTime.label}</time> : <span>Nguồn chưa cung cấp ngày đăng</span>}
            </div>
            <h1 id="job-detail-title" className={styles.title}>{job.title}</h1>
            <dl className={styles.factsGrid}>
              <div><dt>Địa điểm</dt><dd>{job.location || "Chưa công bố"}</dd></div>
              {SENIORITY_LABELS[job.seniority] && <div><dt>Cấp bậc</dt><dd>{SENIORITY_LABELS[job.seniority]}</dd></div>}
              {WORKPLACE_LABELS[job.workplace_type] && <div><dt>Hình thức</dt><dd>{WORKPLACE_LABELS[job.workplace_type]}</dd></div>}
              {employmentLabels[job.employment_type] && <div><dt>Loại công việc</dt><dd>{employmentLabels[job.employment_type]}</dd></div>}
              <div><dt>Mức lương</dt><dd>{job.salary_display}</dd></div>
            </dl>
            {syncedTime && <p className={styles.dataNote}><time dateTime={syncedTime.dateTime} title={syncedTime.title}>{syncedTime.label}</time><span>Đây là thời điểm Interviewly đồng bộ dữ liệu, không phải ngày đăng tuyển.</span></p>}
          </div>
        </section>

        <aside className={styles.sidebar} aria-label="Luyện phỏng vấn và ứng tuyển">
          <JobQuickActionPanel job={job} onStartPractice={handleStartPractice} isStarting={isStarting} />
        </aside>

        <section className={styles.descriptionCard} aria-labelledby="job-description-title">
          <div className={styles.sectionHeader}><p>Nội dung từ nguồn tuyển dụng</p><h2 id="job-description-title">Mô tả công việc</h2></div>
          <div className={styles.descriptionText}>
            {job.cleaned_jd_text || job.raw_description ? <JobDescription text={job.cleaned_jd_text || job.raw_description} /> : <p>Nguồn chưa cung cấp nội dung chi tiết. Vui lòng xem tin tuyển dụng gốc.</p>}
          </div>
          {technologies.length > 0 && (
            <section className={styles.technologySection} id="technologies" aria-labelledby="job-technologies-title">
              <h2 id="job-technologies-title">Công nghệ & kỹ năng</h2>
              <ul className={styles.technologyList}>
                {technologies.map((technology) => <li key={technology}><BrandIcon name={technology} size={22} /><span>{getBrandLabel(technology)}</span></li>)}
              </ul>
            </section>
          )}
          {job.company?.branding_reuse_allowed && job.company.branding_source_url && (
            <p className={styles.brandingAttribution}>Tư liệu doanh nghiệp từ <a href={job.company.branding_source_url} target="_blank" rel="noopener noreferrer">nguồn tuyển dụng</a>{job.company.branding_license_url && <> · <a href={job.company.branding_license_url} target="_blank" rel="noopener noreferrer">Quyền sử dụng</a></>}</p>
          )}
        </section>
      </div>

      <ProUpgradeJobModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        jobTitle={job?.title}
      />
    </div>
  );
}
