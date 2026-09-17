import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResultSuccessClient } from "./PaymentResultSuccessClient";

export const metadata: Metadata = {
  title: "Thanh toán thành công | Interviewly",
  description: "Xác nhận kích hoạt thành công gói cước Interviewly PRO.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>Đang tải kết quả thanh toán...</p>
        </div>
      }
    >
      <PaymentResultSuccessClient />
    </Suspense>
  );
}