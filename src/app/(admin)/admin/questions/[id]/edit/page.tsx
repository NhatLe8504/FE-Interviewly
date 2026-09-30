import type { Metadata } from "next";
import AdminQuestionEditClient from "./AdminQuestionEditClient";

export const metadata: Metadata = {
  title: "Chỉnh Sửa Câu Hỏi | Interviewly Admin",
  description: "Cập nhật nội dung câu hỏi, định hướng STAR và đáp án benchmark.",
};

export default async function AdminQuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
      <AdminQuestionEditClient questionId={id} />
    </div>
  );
}
