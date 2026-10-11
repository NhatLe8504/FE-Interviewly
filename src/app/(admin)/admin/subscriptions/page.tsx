import type { Metadata } from "next";
import { AdminSubscriptionsClient } from "./AdminSubscriptionsClient";

export const metadata: Metadata = {
  title: "Quản lý Gói đăng ký | Interviewly Admin",
  description: "Cấu hình bảng giá gói cước và quản lý thuê bao người dùng.",
};

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptionsClient />;
}
