import React, { Suspense } from "react";
import CvBuilderClient from "./CvBuilderClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Tạo CV với AI | AI CV Builder - Interviewly",
  description:
    "Công cụ thiết kế CV chuyên nghiệp tích hợp AI: chỉnh sửa trực tiếp, tinh chỉnh văn phong STAR theo thời gian thực và đo lường độ khớp ATS với mô tả công việc.",
};

export default function CvBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CvBuilderClient />
    </Suspense>
  );
}
