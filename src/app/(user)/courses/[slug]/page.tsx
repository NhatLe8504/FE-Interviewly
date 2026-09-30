import { Suspense } from "react";
import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import { COURSES_DATA } from "@/data/coursesData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = COURSES_DATA.find((c) => c.slug === slug);
  return {
    title: course
      ? `${course.title} | Lộ Trình Ôn Luyện Phỏng Vấn | Interviewly`
      : "Chi Tiết Khóa Học Phỏng Vấn | Interviewly",
    description: course?.description || "Lộ trình ôn luyện phỏng vấn chuẩn hóa quốc tế.",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          Đang tải lộ trình khóa học...
        </div>
      }
    >
      <CourseDetailClient slug={slug} />
    </Suspense>
  );
}
