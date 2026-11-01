import React, { Suspense } from "react";
import CvBuilderClient from "./CvBuilderClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Tạo CV với AI | AI CV Builder - Interviewly",
  description:
    "Công cụ thiết kế CV chuyên nghiệp tích hợp AI: chỉnh sửa trực tiếp, cải thiện câu chữ bằng AI, điều chỉnh theo JD và đánh giá mức độ phù hợp ATS.",
};

export default function CvBuilderPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f4ee",
          }}
        >
          <Loader2
            style={{ width: 32, height: 32, color: "#d98236" }}
            className="animate-spin"
          />
          <p
            style={{
              fontSize: 14,
              color: "#5e5d59",
              fontWeight: 500,
              marginTop: 12,
            }}
          >
            Đang khởi tạo không gian thiết kế CV...
          </p>
        </div>
      }
    >
      <CvBuilderClient />
    </Suspense>
  );
}
