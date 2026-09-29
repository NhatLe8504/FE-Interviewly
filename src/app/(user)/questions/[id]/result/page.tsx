import { Suspense } from "react";
import type { Metadata } from "next";
import QuestionResultClient from "./QuestionResultClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Kết Quả Đánh Giá & Báo Cáo Chấm Điểm #${id} | Interviewly`,
    description:
      "Báo cáo chi tiết điểm số Rubric, bài tự luận STAR và phân tích phát biểu giọng nói.",
  };
}

export default async function QuestionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          Đang tải kết quả đánh giá...
        </div>
      }
    >
      <QuestionResultClient questionId={id} />
    </Suspense>
  );
}
