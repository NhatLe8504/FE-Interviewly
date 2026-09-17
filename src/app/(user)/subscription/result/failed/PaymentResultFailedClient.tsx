"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RotateCcw, ArrowRight, HelpCircle } from "lucide-react";

export function PaymentResultFailedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const responseCode = searchParams.get("vnp_ResponseCode") || searchParams.get("error");
  const errorMessage =
    responseCode === "24"
      ? "Giao dịch đã bị người dùng hủy bỏ."
      : responseCode === "11"
      ? "Giao dịch quá thời gian chờ thanh toán."
      : responseCode === "51"
      ? "Tài khoản của bạn không đủ số dư để thực hiện giao dịch."
      : "Giao dịch chưa thể hoàn tất hoặc bị gián đoạn từ cổng thanh toán.";

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "60px auto 80px",
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "28px",
          padding: "48px 36px 40px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Red Warning Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.15)",
          }}
        >
          <AlertCircle size={44} />
        </div>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: "900",
            color: "#111827",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
          }}
        >
          Thanh toán chưa hoàn tất
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 24px", lineHeight: "1.5" }}>
          {errorMessage}
        </p>

        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            marginBottom: "28px",
            fontSize: "13px",
            color: "#991b1b",
          }}
        >
          Tài khoản của bạn chưa bị trừ tiền. Bạn có thể thực hiện lại giao dịch hoặc đổi sang phương thức thanh toán khác (Quét mã VietQR / Thẻ quốc tế).
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            onClick={() => router.push("/subscription/checkout")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(255, 77, 79, 0.35)",
            }}
          >
            <RotateCcw size={16} />
            <span>Thử thanh toán lại</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pricing")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <span>Quay lại bảng giá</span>
          </button>
        </div>
      </div>
    </div>
  );
}