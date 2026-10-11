import type { Metadata } from "next";
import { AdminModerationClient } from "./AdminModerationClient";

export const metadata: Metadata = {
  title: "Kiểm Duyệt Nội Dung | Interviewly Admin",
  description: "Hàng đợi kiểm duyệt và xử lý vi phạm nội dung người dùng.",
};

export default function AdminModerationPage() {
  return <AdminModerationClient />;
}
