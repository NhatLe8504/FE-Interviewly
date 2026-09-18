"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  X,
  RotateCcw,
  Zap,
  Lock,
  BadgeCheck,
} from "lucide-react";
import styles from "./checkout.module.css";
import { useAuth } from "@/context/AuthContext";
import { UserTooltip } from "@/components/user-component/common";

type BillingCycle = "weekly" | "monthly" | "yearly";
type PaymentMethod = "qr" | "atm" | "card" | "momo";

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Plan state (monthly vs yearly)
  const initialPlanParam = searchParams.get("plan");
  const [cycle, setCycle] = useState<BillingCycle>(() => {
    if (
      initialPlanParam === "sprint_7days" ||
      initialPlanParam === "pro_weekly" ||
      initialPlanParam === "weekly" ||
      initialPlanParam === "7days"
    ) {
      return "weekly";
    }
    if (initialPlanParam === "pro_yearly" || initialPlanParam === "yearly") {
      return "yearly";
    }
    return "monthly";
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic unique transaction reference
  const [orderCode, setOrderCode] = useState<string>("");
  useEffect(() => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setOrderCode(`IC${randomSuffix}`);
  }, []);

  // 15-minute countdown timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(900);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Pricing calculations
  const price = cycle === "weekly" ? 49000 : cycle === "monthly" ? 99000 : 899000;
  const originalPrice = cycle === "weekly" ? 79000 : cycle === "monthly" ? 149000 : 1188000;
  const discountAmount = originalPrice - price;
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(price) + " đ";
  const formattedOriginalPrice = new Intl.NumberFormat("vi-VN").format(originalPrice) + " đ";

  // Bank transfer info
  const bankInfo = useMemo(() => {
    const transferContent = orderCode;
    return {
      bankName: "MB Bank (Ngân hàng Quân Đội)",
      bankShortName: "MB",
      accountNumber: "085042026888",
      accountName: "CONG TY CO PHAN INTERVIEWLY VIET NAM",
      amountNumber: price,
      formattedAmount: formattedPrice,
      content: transferContent,
      // Dynamic VietQR API endpoint with official Napas 247 format
      qrUrl: `https://img.vietqr.io/image/MB-085042026888-compact2.png?amount=${price}&addInfo=${encodeURIComponent(
        transferContent
      )}&accountName=CONG%20TY%20CO%20PHAN%20INTERVIEWLY%20VIET%20NAM`,
    };
  }, [orderCode, price, formattedPrice]);

  const handleCopy = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Verification & Success Modal state
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleConfirmPaid = () => {
    setIsVerifying(true);
    // Simulate real-time bank webhook checking
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  const handleQuickDemoSuccess = () => {
    setShowSuccessModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <ShieldCheck size={14} />
          <span>Thanh toán an toàn & Bảo mật 100%</span>
        </div>
        <h1 className={styles.title}>Nâng cấp Tài khoản Interviewly PRO</h1>
        <p className={styles.subtitle}>
          Mở khóa toàn bộ tính năng luyện phỏng vấn không giới hạn, phân tích AI Rubric chuyên sâu và hướng dẫn phản xạ STAR thời gian thực.
        </p>
      </div>

      <div className={styles.layout}>
        {/* LEFT COLUMN: Payment Configuration & QR Area */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>1. Chọn chu kỳ thanh toán</span>
          </h2>
          <p className={styles.cardSubtitle}>
            Lựa chọn gói linh hoạt phù hợp với tiến độ ôn luyện của bạn.
          </p>

          {/* Billing Cycle Switcher */}
          <div className={styles.planSwitcher}>
            <button
              type="button"
              className={`${styles.planOption} ${cycle === "weekly" ? styles.planOptionActive : ""}`}
              onClick={() => setCycle("weekly")}
            >
              <span>Gói 7 Ngày (49.000 đ)</span>
              <span className={styles.sprintBadge}>Cấp tốc</span>
            </button>
            <button
              type="button"
              className={`${styles.planOption} ${cycle === "monthly" ? styles.planOptionActive : ""}`}
              onClick={() => setCycle("monthly")}
            >
              <span>Gói Tháng (99.000 đ)</span>
            </button>
            <button
              type="button"
              className={`${styles.planOption} ${cycle === "yearly" ? styles.planOptionActive : ""}`}
              onClick={() => setCycle("yearly")}
            >
              <span>Gói 1 Năm (899.000 đ)</span>
              <span className={styles.discountBadge}>Tiết kiệm 25%</span>
            </button>
          </div>

          <h2 className={styles.cardTitle}>
            <span>2. Chọn phương thức thanh toán</span>
          </h2>
          <p className={styles.cardSubtitle}>
            Hỗ trợ toàn diện các cổng thanh toán ngân hàng và ví điện tử tại Việt Nam.
          </p>

          {/* Payment Methods Grid */}
          <div className={styles.methodGrid}>
            {/* VietQR / VNPAY-QR */}
            <div
              className={`${styles.methodCard} ${paymentMethod === "qr" ? styles.methodCardActive : ""}`}
              onClick={() => setPaymentMethod("qr")}
            >
              <div className={styles.popularTag}>Khuyên dùng</div>
              <div className={styles.methodIcon}>
                <QrCode size={22} />
              </div>
              <div className={styles.methodInfo}>
                <h4 className={styles.methodTitle}>VNPAY-QR / VietQR</h4>
                <p className={styles.methodDesc}>Quét mã bằng app ngân hàng bất kỳ</p>
              </div>
            </div>

            {/* Domestic ATM / Napas */}
            <div
              className={`${styles.methodCard} ${paymentMethod === "atm" ? styles.methodCardActive : ""}`}
              onClick={() => setPaymentMethod("atm")}
            >
              <div className={styles.methodIcon}>
                <Building2 size={22} />
              </div>
              <div className={styles.methodInfo}>
                <h4 className={styles.methodTitle}>Thẻ ATM Nội địa</h4>
                <p className={styles.methodDesc}>Hơn 40 ngân hàng Napas 24/7</p>
              </div>
            </div>

            {/* Visa / Master */}
            <div
              className={`${styles.methodCard} ${paymentMethod === "card" ? styles.methodCardActive : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className={styles.methodIcon}>
                <CreditCard size={22} />
              </div>
              <div className={styles.methodInfo}>
                <h4 className={styles.methodTitle}>Thẻ Quốc Tế</h4>
                <p className={styles.methodDesc}>Visa, MasterCard, JCB</p>
              </div>
            </div>

            {/* MoMo */}
            <div
              className={`${styles.methodCard} ${paymentMethod === "momo" ? styles.methodCardActive : ""}`}
              onClick={() => setPaymentMethod("momo")}
            >
              <div className={styles.methodIcon}>
                <Smartphone size={22} />
              </div>
              <div className={styles.methodInfo}>
                <h4 className={styles.methodTitle}>Ví MoMo</h4>
                <p className={styles.methodDesc}>Thanh toán một chạm tức thì</p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* QR CODE PAYMENT DISPLAY SECTION                          */}
          {/* ======================================================== */}
          {paymentMethod === "qr" && (
            <div className={styles.qrWrapper}>
              {/* Countdown Timer Banner */}
              <div className={styles.timerBox}>
                <span className={styles.pulseDot} />
                <Clock size={16} />
                <span>Mã thanh toán hết hạn sau: {formatTimer(timeLeft)}</span>
              </div>

              {/* QR Image Container with official styling */}
              <div>
                <div className={styles.qrImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bankInfo.qrUrl}
                    alt="Mã VietQR thanh toán Interviewly PRO"
                    className={styles.qrImage}
                  />
                </div>
              </div>

              <div className={styles.bankBadgeRow}>
                <span className={styles.bankBadge}>MB Bank Quân Đội</span>
                <span className={styles.napasBadge}>Napas 247 Chuyển nhanh</span>
                <span className={styles.bankBadge}>VNPAY Đảm bảo</span>
              </div>

              {/* Detailed Bank Transfer Info with Copy Buttons */}
              <div className={styles.transferTable}>
                <div className={styles.transferRow}>
                  <span className={styles.transferLabel}>Ngân hàng thụ hưởng:</span>
                  <span className={styles.transferValue}>
                    <span>{bankInfo.bankName}</span>
                  </span>
                </div>

                <div className={styles.transferRow}>
                  <span className={styles.transferLabel}>Chủ tài khoản:</span>
                  <span className={styles.transferValue}>
                    <span>{bankInfo.accountName}</span>
                  </span>
                </div>

                <div className={styles.transferRow}>
                  <span className={styles.transferLabel}>Số tài khoản:</span>
                  <div className={styles.transferValue}>
                    <span style={{ fontFamily: "monospace", fontSize: "15px", letterSpacing: "0.05em" }}>
                      {bankInfo.accountNumber}
                    </span>
                    <button
                      type="button"
                      className={`${styles.copyButton} ${copiedKey === "account" ? styles.copiedButton : ""}`}
                      onClick={() => handleCopy("account", bankInfo.accountNumber)}
                    >
                      {copiedKey === "account" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === "account" ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.transferRow}>
                  <span className={styles.transferLabel}>Số tiền cần chuyển:</span>
                  <div className={styles.transferValue}>
                    <span style={{ color: "#ea580c", fontSize: "16px" }}>
                      {bankInfo.formattedAmount}
                    </span>
                    <button
                      type="button"
                      className={`${styles.copyButton} ${copiedKey === "amount" ? styles.copiedButton : ""}`}
                      onClick={() => handleCopy("amount", String(bankInfo.amountNumber))}
                    >
                      {copiedKey === "amount" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === "amount" ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.transferRow}>
                  <span className={styles.transferLabel}>Nội dung chuyển khoản (bắt buộc):</span>
                  <div className={styles.transferValue}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        backgroundColor: "#fef3c7",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        color: "#92400e",
                        border: "1px dashed #f59e0b",
                      }}
                    >
                      {bankInfo.content}
                    </span>
                    <button
                      type="button"
                      className={`${styles.copyButton} ${copiedKey === "content" ? styles.copiedButton : ""}`}
                      onClick={() => handleCopy("content", bankInfo.content)}
                    >
                      {copiedKey === "content" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === "content" ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Steps Guide */}
              <div className={styles.stepsList}>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>1</div>
                  <p className={styles.stepText}>Mở ứng dụng Ngân hàng hoặc Ví MoMo</p>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>2</div>
                  <p className={styles.stepText}>Chọn tính năng Quét mã QR</p>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNumber}>3</div>
                  <p className={styles.stepText}>Kiểm tra số tiền & bấm Xác nhận</p>
                </div>
              </div>

              {/* Interactive Confirm Buttons */}
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleConfirmPaid}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #ffffff",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      <span>Đang kiểm tra giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Tôi đã chuyển khoản thành công</span>
                    </>
                  )}
                </button>

                <UserTooltip content="Thử nghiệm popup thành công ngay mà không cần chuyển tiền thực tế">
                  <button
                    type="button"
                    className={styles.demoButton}
                    onClick={handleQuickDemoSuccess}
                  >
                    <Sparkles size={16} />
                    <span>Mô phỏng thanh toán thành công (Bấm để xem Popup)</span>
                  </button>
                </UserTooltip>
              </div>
            </div>
          )}

          {/* ATM / Card / MoMo Fallback Views */}
          {paymentMethod !== "qr" && (
            <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f9fafb", borderRadius: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <ExternalLink size={24} />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700" }}>
                Chuyển hướng cổng {paymentMethod === "card" ? "Thẻ Quốc Tế" : paymentMethod === "atm" ? "VNPay ATM" : "Ví MoMo"}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>
                Bạn sẽ được chuyển hướng an toàn tới cổng đối tác để hoàn tất xác thực OTP ngân hàng.
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleConfirmPaid}
                disabled={isVerifying}
              >
                Tiếp tục đến trang thanh toán {formattedPrice}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order Summary & Entitlements */}
        <div>
          <div className={styles.card}>
            <div className={styles.summaryHeader}>
              <div className={styles.planCardHeader}>
                <span className={styles.planName}>
                  {cycle === "weekly"
                    ? "Interviewly PRO (7 Ngày Cấp Tốc)"
                    : cycle === "monthly"
                    ? "Interviewly PRO (Tháng)"
                    : "Interviewly PRO (1 Năm)"}
                </span>
                <span className={styles.planBadge}>
                  {cycle === "weekly" ? "Gói cấp tốc" : cycle === "monthly" ? "Gói phổ biến" : "Tiết kiệm 25%"}
                </span>
              </div>

              <div className={styles.priceDisplay}>
                <span className={styles.originalPrice}>{formattedOriginalPrice}</span>
                <span className={styles.priceAmount}>{formattedPrice}</span>
                <span className={styles.pricePeriod}>
                  {cycle === "weekly" ? "/ 7 ngày" : cycle === "monthly" ? "/ tháng" : "/ năm"}
                </span>
              </div>
            </div>

            {/* List of Pro Entitlements */}
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#111827", margin: "0 0 12px" }}>
              Đặc quyền gói cước bao gồm:
            </p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span><strong>{cycle === "weekly" ? "35 lượt phỏng vấn AI cấp tốc" : "Không giới hạn"}</strong> {cycle === "weekly" ? "trong 7 ngày phỏng vấn gấp" : "lượt phỏng vấn AI đa ngành nghề"}</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Phân tích giọng nói WPM, phát hiện từ đệm đa ngữ (Vi/En)</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Chấm điểm Rubric 3 tiêu chí kèm Structured JSON</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Gợi ý phản xạ STAR thời gian thực trong phòng phỏng vấn</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Xuất báo cáo năng lực chi tiết định dạng PDF chuẩn A4</span>
              </li>
            </ul>

            {/* Pricing Calculation Summary */}
            <div className={styles.calcBox}>
              <div className={styles.calcRow}>
                <span>Đơn giá niêm yết:</span>
                <span>{formattedOriginalPrice}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Ưu đãi thành viên mới:</span>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>
                  - {new Intl.NumberFormat("vi-VN").format(discountAmount)} đ
                </span>
              </div>
              <div className={styles.calcRow}>
                <span>Thuế VAT:</span>
                <span>0 đ (Đã bao gồm)</span>
              </div>
              <div className={`${styles.calcRow} ${styles.calcRowTotal}`}>
                <span>Tổng thanh toán:</span>
                <span className={styles.totalHighlight}>{formattedPrice}</span>
              </div>
            </div>

            {/* User credentials notice */}
            {user && (
              <div style={{ marginBottom: "18px", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#f3f4f6", fontSize: "12px", color: "#4b5563" }}>
                <span>Tài khoản kích hoạt: <strong>{user.email || user.full_name}</strong></span>
              </div>
            )}

            {/* Trust and security guarantees */}
            <div className={styles.guaranteeBox}>
              <Lock size={18} color="#059669" style={{ flexShrink: 0 }} />
              <span>Giao dịch được mã hóa SSL 256-bit chuẩn PCI-DSS & cam kết hoàn tiền trong 7 ngày.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUCCESS MODAL POPUP                                      */}
      {/* ======================================================== */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowSuccessModal(false)}
            >
              <X size={18} />
            </button>

            {/* Glowing Success Badge */}
            <div className={styles.successIconBadge}>
              <Check size={40} strokeWidth={3} />
            </div>

            <div className={styles.goldProTag}>
              <Sparkles size={14} />
              <span>TÀI KHOẢN ĐÃ NÂNG CẤP: PRO</span>
            </div>

            <h2 className={styles.modalTitle}>Thanh toán thành công!</h2>
            <p className={styles.modalDesc}>
              Chúc mừng bạn đã gia nhập hàng ngàn ứng viên Pro của Interviewly. Toàn bộ đặc quyền AI không giới hạn đã được kích hoạt ngay lập tức!
            </p>

            {/* Transaction Receipt Card */}
            <div className={styles.receiptCard}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Mã giao dịch:</span>
                <span className={styles.receiptValue}>{orderCode}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Gói cước:</span>
                <span className={styles.receiptValue}>
                  {cycle === "monthly" ? "Interviewly PRO (1 Tháng)" : "Interviewly PRO (1 Năm)"}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Số tiền:</span>
                <span className={styles.receiptValue} style={{ color: "#ea580c" }}>
                  {formattedPrice}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Phương thức:</span>
                <span className={styles.receiptValue}>
                  {paymentMethod === "qr" ? "VietQR / VNPAY-QR (Napas 247)" : "Thẻ trực tuyến"}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Trạng thái:</span>
                <span className={styles.receiptValue} style={{ color: "#16a34a" }}>
                  Đã hoàn tất (Active)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => router.push("/practice")}
              >
                <span>Bắt đầu luyện phỏng vấn ngay</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className={styles.demoButton}
                onClick={() => router.push("/subscription/my")}
              >
                <span>Xem chi tiết gói cước của tôi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}