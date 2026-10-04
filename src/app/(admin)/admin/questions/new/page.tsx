import React, { Suspense } from "react";
import type { Metadata } from "next";
import { QuestionCreateForm } from "@/components/admin/questions";
import { Skeleton } from "@/components/admin/ui/skeleton";

export const metadata: Metadata = {
  title: "Tạo Bộ Đề Mới - Interviewly Admin",
  description: "Tạo câu hỏi phỏng vấn chuẩn STAR, đáp án mẫu và tiêu chí Rubric AI.",
};

export default function AdminQuestionCreatePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
      <Suspense fallback={<div className="p-6"><Skeleton className="h-96 w-full rounded-2xl" /></div>}>
        <QuestionCreateForm />
      </Suspense>
    </div>
  );
}
