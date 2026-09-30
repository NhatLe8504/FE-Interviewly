import { Suspense } from "react";
import type { Metadata } from "next";
import LessonViewerClient from "./LessonViewerClient";
import { resolveLesson } from "@/data/lessonResolver";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonPath: string[] }>;
}): Promise<Metadata> {
  const { slug, lessonPath } = await params;
  const ctx = resolveLesson(slug, lessonPath);
  return {
    title: `${ctx.currentLesson.title} | ${ctx.course.title} | Interviewly`,
    description: `Học bài ${ctx.currentLesson.title} thuộc khóa ${ctx.course.title}. Phân tích STAR và luyện phỏng vấn cùng AI Coach.`,
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
