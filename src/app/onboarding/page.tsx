import type { Metadata } from "next";
import { UserOnboardingClient } from "./UserOnboardingClient";

export const metadata: Metadata = {
  title: "Khởi tạo Hồ sơ & Định hướng Luyện tập | Interviewly",
  description: "Thiết lập ngôn ngữ, khảo sát định hướng nghề nghiệp, vị trí mục tiêu và bắt đầu hành trình luyện phỏng vấn AI.",
};

export default function OnboardingPage() {
  return <UserOnboardingClient />;
}