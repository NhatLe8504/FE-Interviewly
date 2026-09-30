import type { Metadata } from "next";
import AdminCoursesClient from "./AdminCoursesClient";

export const metadata: Metadata = {
  title: "Quản Lý Khóa Học & Lộ Trình | Interviewly Admin",
  description:
    "Quản trị khóa học, bài học, thiết lập giáo trình và tích hợp giả lập phỏng vấn thực chiến chuẩn STAR.",
};

export default function AdminCoursesPage() {
  return <AdminCoursesClient />;
}
