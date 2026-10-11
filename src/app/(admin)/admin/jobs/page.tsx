import type { Metadata } from "next";
import { AdminJobsClient } from "./AdminJobsClient";

export const metadata: Metadata = {
  title: "Quản Lý Tin Tuyển Dụng & Crawler | Interviewly Admin",
  description: "Điều phối bot cào dữ liệu tuyển dụng và quản lý kho việc làm JD phỏng vấn.",
};

export default function AdminJobsPage() {
  return <AdminJobsClient />;
}
