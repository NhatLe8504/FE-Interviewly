import type { Metadata } from "next";
import { AdminStarTemplatesClient } from "./AdminStarTemplatesClient";

export const metadata: Metadata = {
  title: "Khung Hướng Dẫn STAR | Interviewly Admin",
  description: "Quản trị các khung mẫu trả lời STAR (Situation, Task, Action, Result).",
};

export default function AdminStarTemplatesPage() {
  return <AdminStarTemplatesClient />;
}
