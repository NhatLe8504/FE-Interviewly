import { Suspense } from "react";
import type { Metadata } from "next";
import QuestionDetailClient from "../[id]/QuestionDetailClient";

export const metadata: Metadata = {
  title: "Không gian Luyện tập & AI Chấm điểm | Interviewly",
  description:
    "Luyện tập các câu hỏi phỏng vấn theo bộ đề hoặc giỏ đề tự chọn. Hỗ trợ trắc nghiệm, tự luận theo khung STAR và ghi âm giọng nói chấm điểm qua AI.",
};

export default function QuestionPracticeWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          Đang tải không gian luyện tập...
        </div>
      }
    >
      <QuestionDetailClient />
    </Suspense>
  );
}
