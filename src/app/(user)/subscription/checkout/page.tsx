import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Thanh toán Nâng cấp PRO | Interviewly",
  description: "Trang thanh toán gói cước Interviewly PRO qua VietQR, VNPAY, Thẻ nội địa và Quốc tế.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid #ff7a45",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}