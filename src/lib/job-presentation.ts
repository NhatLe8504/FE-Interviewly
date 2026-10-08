import { getBrandLabel } from "@/lib/brand-icons";
import type { JobItem } from "@/types/job";

export const SENIORITY_LABELS: Record<string, string> = {
  intern: "Intern", fresher: "Fresher", junior: "Junior", mid: "Middle", senior: "Senior", lead: "Lead",
};

export const WORKPLACE_LABELS: Record<string, string> = {
  remote: "Remote", hybrid: "Hybrid", on_site: "Tại văn phòng",
};

const SOURCE_LABELS: Record<string, string> = {
  topcv: "TopCV", itviec: "ITviec", vietnamworks: "VietnamWorks", vng: "VNG Careers",
  linkedin: "LinkedIn", greenhouse: "Greenhouse", lever: "Lever",
};

export function getSourceLabel(job: JobItem): string {
  return SOURCE_LABELS[job.source_id || ""] || job.via_source?.replace(/^via\s+/i, "") || "Tin tuyển dụng";
}

export function getJobTechnologies(job: JobItem): string[] {
  return Array.from(new Set((job.technologies.length ? job.technologies : job.skills_required).map(getBrandLabel)));
}

export function formatJobTimestamp(value: string | null | undefined, kind: "posted" | "synced" | "updated") {
  if (!value) return null;
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return null;
  const prefix = { posted: "Đăng", synced: "Đồng bộ", updated: "Cập nhật dữ liệu" }[kind];
  const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
  let relative: string;
  if (minutes < 0) relative = timestamp.toLocaleDateString("vi-VN");
  else if (minutes < 1) relative = "vừa xong";
  else if (minutes < 60) relative = minutes + " phút trước";
  else if (minutes < 1440) relative = Math.floor(minutes / 60) + " giờ trước";
  else if (minutes < 43200) relative = Math.floor(minutes / 1440) + " ngày trước";
  else relative = timestamp.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return {
    label: prefix + " " + relative,
    dateTime: timestamp.toISOString(),
    title: prefix + ": " + timestamp.toLocaleString("vi-VN"),
  };
}
