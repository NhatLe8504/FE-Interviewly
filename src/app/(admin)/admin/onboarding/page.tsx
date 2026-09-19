import type { Metadata } from "next";
import { OnboardingAdminClient } from "./OnboardingAdminClient";

export const metadata: Metadata = {
  title: "Quản lý Onboarding & Thống kê Ứng viên | Quản trị Interviewly",
  description: "Cấu hình sự kiện onboarding, thu thập tỉ lệ ngành nghề, chức danh vị trí và tính toán chỉ số hành vi ứng viên.",
};

export default function AdminOnboardingPage() {
  return <OnboardingAdminClient />;
}