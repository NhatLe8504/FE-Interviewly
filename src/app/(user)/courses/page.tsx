import { Suspense } from "react";
import type { Metadata } from "next";
import CourseLibraryClient from "./CourseLibraryClient";

export const metadata: Metadata = {
  title: "Thư Viện Khóa Học Ôn Luyện Phỏng Vấn (Course Library) | Interviewly",
  description:
    "Lộ trình ôn luyện phỏng vấn chuẩn hóa quốc tế thiết kế bởi chuyên gia Google, Meta, OpenAI và Goldman Sachs. Học lý thuyết, phân tích STAR và mock interview cùng AI Coach.",
};

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          Đang tải thư viện khóa học...
        </div>
      }
    >
      <CourseLibraryClient />
    </Suspense>
  );
}
