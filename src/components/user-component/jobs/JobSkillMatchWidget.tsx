"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { jobsApi } from "@/services/jobsApi";
import { getBrandLabel } from "@/lib/brand-icons";
import type { JobSkillMatch } from "@/types/job";
import styles from "./jobs.module.css";

export function JobSkillMatchWidget({ jobId }: { jobId: string }) {
  const [response, setResponse] = useState<{ jobId: string; retryAttempt: number; data: JobSkillMatch | null } | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const loading = response?.jobId !== jobId || response?.retryAttempt !== retryAttempt;
  const matchData = loading ? null : response?.data;
  const failed = !loading && !matchData;

  useEffect(() => {
    let mounted = true;
    jobsApi.getSkillMatch(jobId)
      .then((data) => { if (mounted) setResponse({ jobId, retryAttempt, data }); })
      .catch(() => { if (mounted) setResponse({ jobId, retryAttempt, data: null }); });
    return () => { mounted = false; };
  }, [jobId, retryAttempt]);

  return (
    <section className={styles.matchPanel} aria-label="Đối chiếu kỹ năng trong hồ sơ">
      <h2 className={styles.panelSubtitle}>Đối chiếu hồ sơ</h2>
      {loading ? (
        <p className={styles.panelCopy} role="status">Đang đọc kỹ năng trong hồ sơ…</p>
      ) : failed ? (
        <>
          <p className={styles.panelCopy}>Chưa tải được dữ liệu đối chiếu. Không có điểm đánh giá nào được tạo khi thiếu dữ liệu.</p>
          <Button type="button" variant="home-quiet" size="home-compact" className={styles.panelLink} onClick={() => setRetryAttempt((previous) => previous + 1)}>Thử lại</Button>
        </>
      ) : !matchData?.has_candidate_skills ? (
        <>
          <p className={styles.panelCopy}>Bổ sung kỹ năng trong hồ sơ để đối chiếu với yêu cầu của công việc. Bạn vẫn có thể luyện phỏng vấn ngay.</p>
          <Button asChild variant="home-outline" size="home-compact" className={styles.panelLink}><Link href="/profile">Cập nhật hồ sơ</Link></Button>
        </>
      ) : matchData.matched_skills.length + matchData.missing_skills.length === 0 ? (
        <p className={styles.panelCopy}>Nguồn tuyển dụng chưa cung cấp đủ dữ liệu kỹ năng để đối chiếu.</p>
      ) : (
        <>
          <div className={styles.matchScore}><strong>{matchData.match_score_pct}%</strong><span>kỹ năng khớp với yêu cầu</span></div>
          <div className={styles.matchTrack} role="progressbar" aria-label="Tỷ lệ kỹ năng khớp JD" aria-valuenow={matchData.match_score_pct} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.matchFill} style={{ width: matchData.match_score_pct + "%" }} />
          </div>
          <p className={styles.panelCopy}>{matchData.recommendation}</p>
          {matchData.missing_skills.length > 0 && (
            <div className={styles.panelSkillList} aria-label="Kỹ năng cần bổ sung">
              {matchData.missing_skills.slice(0, 5).map((skill) => <span className={styles.skillTag} key={skill}><BrandIcon name={skill} size={16} />{getBrandLabel(skill)}</span>)}
            </div>
          )}
        </>
      )}
    </section>
  );
}
