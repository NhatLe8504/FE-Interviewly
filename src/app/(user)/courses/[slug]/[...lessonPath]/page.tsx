import { Suspense } from "react";
import type { Metadata } from "next";
import LessonViewerClient from "./LessonViewerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonPath: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Bài học | ${slug} | Interviewly`,
    description: "Nội dung bài học chuẩn hóa thực chiến cùng Interviewly.",
  };
}

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonPath: string[] }>;
}) {
  const { slug, lessonPath } = await params;

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
          Đang tải bài học...
        </div>
      }
    >
      <LessonViewerClient slug={slug} lessonPath={lessonPath} />
    </Suspense>
  );
}
