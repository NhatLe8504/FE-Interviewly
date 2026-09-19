import type { Metadata } from "next";
import { QuestionCreateForm } from "@/components/admin/questions";

export const metadata: Metadata = {
  title: "Tạo Câu Hỏi Mới | Interviewly Admin",
  description: "Tạo câu hỏi phỏng vấn chuẩn STAR, đáp án mẫu và tiêu chí Rubric AI.",
};

export default function AdminQuestionCreatePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
      <QuestionCreateForm />
    </div>
  );
}
