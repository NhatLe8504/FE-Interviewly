import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SingleQuestionForm } from "@/components/admin/questions";
import { Skeleton } from "@/components/admin/ui/skeleton";

export const metadata: Metadata = {
  title: "Tạo Câu Hỏi Lẻ Mới - Interviewly Admin",
  description: "Tạo câu hỏi phỏng vấn chuẩn hóa đơn lẻ với cấu trúc STAR và đáp án benchmark.",
};

export default function AdminSingleQuestionCreatePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 py-4 md:py-6">
      <Suspense fallback={<div className="p-6"><Skeleton className="h-96 w-full rounded-2xl" /></div>}>
        <SingleQuestionForm />
      </Suspense>
    </div>
  );
}
