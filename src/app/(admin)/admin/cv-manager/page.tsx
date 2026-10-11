import type { Metadata } from "next";
import { AdminCvManagerClient } from "./AdminCvManagerClient";

export const metadata: Metadata = {
  title: "Quản Lý Hồ Sơ CV & ATS | Interviewly Admin",
  description: "Giám sát hồ sơ CV ứng viên, phân tích tỷ lệ điểm ATS.",
};

export default function AdminCvManagerPage() {
  return <AdminCvManagerClient />;
}
