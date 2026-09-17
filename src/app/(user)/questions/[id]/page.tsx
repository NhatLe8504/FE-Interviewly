import type { Metadata } from "next";
import QuestionDetailClient from "./QuestionDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Chi tiết câu hỏi #${id} & Hướng dẫn STAR | Interviewly`,
    description:
      "Xem hướng dẫn cấu trúc trả lời mẫu theo khung STAR và tiêu chuẩn chấm điểm Rubric cho câu hỏi phỏng vấn.",
  };
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionDetailClient questionId={id} />;
}
