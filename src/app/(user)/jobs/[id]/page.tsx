"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jobsApi } from "@/services/jobsApi";
import { JobDetail } from "@/types/job";
import { Button } from "@/components/ui/button";
import { JobQuickActionPanel } from "@/components/user-component/jobs/JobQuickActionPanel";
import { JobThumbnail } from "@/components/user-component/jobs/JobThumbnail";
import { ArrowLeft, Loader2, MapPin, Briefcase } from "lucide-react";
import { toast } from "@/components/user-component/toast";
import styles from "./jobDetail.module.css";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let mounted = true;
    jobsApi
      .getJobDetail(jobId)
      .then((data) => {
        if (mounted) setJob(data);
      })
      .catch(() => {
        toast.error("Không tìm thấy thông tin tin tuyển dụng này.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId]);

  const handleStartPractice = async () => {
    if (!job) return;
    setIsStarting(true);
    try {
      const res = await jobsApi.startPractice(job.job_id);
      toast.success(`Đã chuẩn bị kịch bản phỏng vấn cho vị trí: ${job.title}!`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("target_job_title", job.title);
        sessionStorage.setItem("target_company_name", job.company?.company_name || "");
      }
      router.push(res.redirect_url);
    } catch (err) {
      toast.error("Không thể khởi tạo buổi phỏng vấn. Vui lòng thử lại!");
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center py-28">
          <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-3" />
          <p className="text-sm font-medium text-stone-600">Đang tải thông tin chi tiết công việc...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.container}>
        <div className="text-center py-24 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-2">Không tìm thấy tin tuyển dụng</h2>
          <p className="text-sm text-stone-500 mb-4">Tin tuyển dụng này có thể đã hết hạn hoặc bị xóa.</p>
          <Link href="/jobs">
            <Button variant="home-primary">Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link href="/jobs">
          <Button variant="home-secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại danh sách việc làm
          </Button>
        </Link>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {/* Top Wide Banner */}
          <JobThumbnail job={job} aspectRatio="wide" />

          <div className={styles.detailBody}>
            <div className={styles.header}>
              <h1 className={styles.title}>{job.title}</h1>
              <div className={styles.companyInfo}>
                {job.company?.company_name || "Nhà tuyển dụng"}
              </div>
              <div className={styles.badges}>
                <span className={styles.salaryHighlight}>{job.salary_display}</span>
                <span className={styles.metaBadge}>
                  <MapPin className="inline-block w-3.5 h-3.5 mr-1 text-stone-400" />
                  {job.location || "Việt Nam"}
                </span>
                <span className={styles.metaBadge}>
                  <Briefcase className="inline-block w-3.5 h-3.5 mr-1 text-stone-400" />
                  {job.seniority.toUpperCase()} ({job.workplace_type})
                </span>
                {job.via_source && (
                  <span className={styles.metaBadge}>
                    {job.via_source}
                  </span>
                )}
              </div>
            </div>

            <h2 className={styles.sectionTitle}>Mô tả công việc & Yêu cầu chi tiết</h2>
            <div className={styles.descriptionText}>
              {job.cleaned_jd_text || job.raw_description}
            </div>

            {job.skills_required && job.skills_required.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Kỹ năng trọng tâm</h2>
                <div className={styles.tagsGrid}>
                  {job.skills_required.map((skill) => (
                    <span key={skill} className={styles.tag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {job.technologies && job.technologies.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Công nghệ liên quan</h2>
                <div className={styles.tagsGrid}>
                  {job.technologies.map((tech) => (
                    <span key={tech} className={styles.tag}>
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <JobQuickActionPanel
            job={job}
            onStartPractice={handleStartPractice}
            isStarting={isStarting}
          />
        </div>
      </div>
    </div>
  );
}
