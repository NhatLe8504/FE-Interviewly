import type { Metadata } from "next";
import { SingleQuestionForm } from "@/components/admin/questions";

export const metadata: Metadata = {
  title: "Tạo Câu Hỏi Lẻ Mới | Interviewly Admin",
  description: "Tạo câu hỏi phỏng vấn chuẩn hóa đơn lẻ với cấu trúc STAR và đáp án benchmark.",
};

export default function AdminSingleQuestionCreatePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
      <SingleQuestionForm />
    </div>
  );
}
