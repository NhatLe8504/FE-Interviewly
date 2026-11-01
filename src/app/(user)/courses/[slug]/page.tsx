import { Suspense } from "react";
import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Khóa học ${slug} | Lộ Trình Ôn Luyện Phỏng Vấn | Interviewly`,
    description: "Lộ trình ôn luyện phỏng vấn chuẩn hóa thực chiến cùng AI Coach.",
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
