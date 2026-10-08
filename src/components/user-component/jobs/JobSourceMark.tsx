import { BrandIcon } from "@/components/user-component/common/BrandIcon";
import { getSourceLabel } from "@/lib/job-presentation";
import type { JobItem } from "@/types/job";
import styles from "./jobs.module.css";

export function JobSourceMark({ job }: { job: JobItem }) {
  const label = getSourceLabel(job);
  return (
    <span className={styles.sourceBrand} title={"Nguồn: " + label}>
      <BrandIcon name={job.source_id || label} size={18} />
      <span>{label}</span>
    </span>
  );
}
