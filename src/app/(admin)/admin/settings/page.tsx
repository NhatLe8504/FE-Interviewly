import type { Metadata } from "next";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata: Metadata = {
  title: "Cài Đặt Hệ Thống & AI | Interviewly Admin",
  description: "Cấu hình AI LLM, Voice TTS/STT, email hạ tầng và theo dõi trạng thái hệ thống.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
