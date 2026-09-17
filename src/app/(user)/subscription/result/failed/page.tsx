import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResultFailedClient } from "./PaymentResultFailedClient";

export const metadata: Metadata = {
  title: "Thanh toán không thành công | Interviewly",
  description: "Thông báo lỗi giao dịch thanh toán gói cước Interviewly.",
};

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>Đang tải trạng thái giao dịch...</p>
        </div>
      }
    >
      <PaymentResultFailedClient />
    </Suspense>
  );
}