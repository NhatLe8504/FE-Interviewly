import type { Metadata } from "next";
import { AdminInterviewsClient } from "./AdminInterviewsClient";

export const metadata: Metadata = {
  title: "Giám Sát Phiên Phỏng Vấn | Interviewly Admin",
  description: "Theo dõi và kiểm tra chi tiết các phiên phỏng vấn thử của ứng viên.",
};

export default function AdminInterviewsPage() {
  return <AdminInterviewsClient />;
}
