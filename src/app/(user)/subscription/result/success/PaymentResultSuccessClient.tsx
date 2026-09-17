"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Home, FileText } from "lucide-react";

export function PaymentResultSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const txnRef = searchParams.get("vnp_TxnRef") || searchParams.get("orderCode") || `ITVLY-${Date.now().toString().slice(-6)}`;
  const rawAmount = searchParams.get("vnp_Amount");
  const amountNumber = rawAmount ? Number(rawAmount) / 100 : 99000;
  const formattedAmount = new Intl.NumberFormat("vi-VN").format(amountNumber) + " đ";
  const bankCode = searchParams.get("vnp_BankCode") || "VNPAY-QR / VietQR";

  return (
    <div
      style={{
        maxWidth: "640px",
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
        {/* Animated Green Badge */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.35)",
          }}
        >
          <Check size={44} strokeWidth={3} />
        </div>

        {/* Gold PRO Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 18px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "800",
            marginBottom: "16px",
            boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
          }}
        >
          <Sparkles size={14} />
          <span>TÀI KHOẢN ĐÃ NÂNG CẤP: PRO</span>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "900",
            color: "#111827",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
          }}
        >
          Thanh toán thành công!
        </h1>
        <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 28px", lineHeight: "1.5" }}>
          Cảm ơn bạn đã tin tưởng lựa chọn Interviewly. Toàn bộ tính năng phỏng vấn AI không giới hạn và phân tích chuyên sâu đã được kích hoạt ngay lập tức!
        </p>

        {/* Receipt card */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "18px",
            padding: "20px 24px",
            textAlign: "left",
            border: "1px solid #f3f4f6",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Mã tham chiếu giao dịch:</span>
            <span style={{ fontWeight: "700", fontFamily: "monospace", color: "#111827" }}>{txnRef}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Gói dịch vụ:</span>
            <span style={{ fontWeight: "700", color: "#111827" }}>Interviewly PRO Member</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Số tiền thanh toán:</span>
            <span style={{ fontWeight: "800", color: "#ea580c", fontSize: "15px" }}>{formattedAmount}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Phương thức:</span>
            <span style={{ fontWeight: "600", color: "#111827" }}>{bankCode}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Trạng thái:</span>
            <span style={{ fontWeight: "700", color: "#16a34a" }}>Đã kích hoạt (Active)</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            onClick={() => router.push("/practice")}
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
            <span>Bắt đầu luyện phỏng vấn ngay</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/subscription/my")}
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
            <FileText size={16} />
            <span>Xem thông tin gói của tôi</span>
          </button>
        </div>
      </div>
    </div>
  );
}