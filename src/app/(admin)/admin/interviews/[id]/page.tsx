import type { Metadata } from "next";
import { AdminInterviewDetailClient } from "./AdminInterviewDetailClient";

export const metadata: Metadata = {
  title: "Chi Tiết Phiên Phỏng Vấn | Interviewly Admin",
  description: "Kiểm tra chi tiết lời thoại, file ghi âm và điểm đánh giá STAR của ứng viên.",
};

export default function AdminInterviewDetailPage() {
  return <AdminInterviewDetailClient />;
}
