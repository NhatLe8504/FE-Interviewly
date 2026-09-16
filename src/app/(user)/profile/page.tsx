import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Hồ sơ ứng viên | Interviewly",
  description:
    "Quản lý thông tin cá nhân, định hướng chuyên môn, bảo mật tài khoản và kiểm tra microphone.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
