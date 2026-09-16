import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản | Interviewly",
  description:
    "Tùy chỉnh giao diện hiển thị, ngôn ngữ mặc định, cấu hình phòng phỏng vấn AI và kiểm soát bảo mật.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
