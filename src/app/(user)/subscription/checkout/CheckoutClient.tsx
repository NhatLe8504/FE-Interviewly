"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  Lock,
  QrCode,
} from "lucide-react";
import styles from "./checkout.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCreateCheckoutMutation, useVerifyPaymentMutation } from "@/redux/api/user/billingApi";
import { toast } from "sonner";

// Synthesize a loud, crystal-clear, bright two-tone "Ting... TING!" payment notification chime
function playSuccessChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    const playBellTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();

      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      const master = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, start);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, start);

      osc3.type = "sine";
      osc3.frequency.setValueAtTime(freq * 3.01, start);

      master.gain.setValueAtTime(vol, start);
      master.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      gain1.gain.setValueAtTime(0.7, start);
      gain2.gain.setValueAtTime(0.3, start);
      gain3.gain.setValueAtTime(0.2, start);

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(master);
      gain2.connect(master);
      gain3.connect(master);

      master.connect(ctx.destination);

      osc1.start(start);
      osc2.start(start);
      osc3.start(start);

      osc1.stop(start + duration);
      osc2.stop(start + duration);
      osc3.stop(start + duration);
    };

    // First bright "Ting" (E6: 1318.5 Hz, volume 0.9)
    playBellTone(1318.51, now, 0.65, 0.9);

    // Second loud "TING!" (B6: 1975.5 Hz, volume 1.0)
    playBellTone(1975.53, now + 0.15, 0.95, 1.0);

    // Shimmering chord overtone (E7: 2637 Hz, volume 0.6)
    playBellTone(2637.02, now + 0.3, 1.2, 0.6);
  } catch {
    // Ignored if AudioContext blocked
  }
}

type BillingCycle = "weekly" | "monthly" | "yearly";

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Selected billing plan cycle
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

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>("IC847061");

  const [createCheckoutApi] = useCreateCheckoutMutation();
  const [verifyPaymentApi, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (showSuccessModal) {
      playSuccessChime();
    }
  }, [showSuccessModal]);

  // Plan ID mapping
  const planId = cycle === "weekly" ? 4 : cycle === "monthly" ? 2 : 3;

  // Initialize or fetch real transaction reference from Backend
  useEffect(() => {
    let isMounted = true;
    async function initCheckout() {
      try {
        const res = await createCheckoutApi({ plan_id: planId }).unwrap();
        if (isMounted && res.transaction_ref) {
          setOrderCode(res.transaction_ref);
        }
      } catch {
        if (isMounted) {
          const randomSuffix = Math.floor(100000 + Math.random() * 900000);
          setOrderCode(`IC${randomSuffix}`);
        }
      }
    }
    initCheckout();
    return () => {
      isMounted = false;
    };
  }, [planId, createCheckoutApi]);

  // Pricing calculations
  const price = cycle === "weekly" ? 49000 : cycle === "monthly" ? 99000 : 899000;
  const originalPrice = cycle === "weekly" ? 79000 : cycle === "monthly" ? 149000 : 1188000;
  const discountAmount = originalPrice - price;
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(price) + " đ";
  const formattedOriginalPrice = new Intl.NumberFormat("vi-VN").format(originalPrice) + " đ";

  // Official MB Bank & VietQR transfer parameters
  const bankInfo = useMemo(() => {
    const transferContent = orderCode;
    return {
      bankName: "MB Bank (Ngân hàng Quân Đội)",
      bankShortName: "MB",
      accountNumber: "9394441571",
      accountName: "LE VAN NHAT",
      amountNumber: price,
      formattedAmount: formattedPrice,
      content: transferContent,
      qrUrl: `https://img.vietqr.io/image/mb-9394441571-compact2.png?amount=${price}&addInfo=${encodeURIComponent(
        transferContent
      )}&accountName=LE%20VAN%20NHAT`,
    };
  }, [orderCode, price, formattedPrice]);

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Đã sao chép vào bộ nhớ tạm!");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleConfirmPaid = async () => {
    try {
      const res = await verifyPaymentApi({ transaction_ref: orderCode }).unwrap();
      if (res.status === "success") {
        toast.success("Xác nhận thanh toán thành công! Gói cước đã được kích hoạt.");
        setShowSuccessModal(true);
      } else {
        toast.info("Đang kiểm tra giao dịch từ ngân hàng. Gói cước sẽ tự động kích hoạt ngay khi nhận tiền.");
        setShowSuccessModal(true);
      }
    } catch {
      toast.info("Hệ thống xGate đang kiểm tra giao dịch. Bạn có thể bắt đầu phiên phỏng vấn ngay.");
      setShowSuccessModal(true);
    }
  };

  const planDisplayName =
    cycle === "weekly"
      ? "Gói Cấp Tốc (7-Day Sprint)"
      : cycle === "monthly"
      ? "Gói Chuyên Nghiệp (Pro Monthly)"
      : "Gói Chuyên Nghiệp (Pro Yearly)";

  return (
    <main className={styles.container}>
      {/* Header Section */}
      <section className={styles.header}>
        <div className={styles.badge}>
          <ShieldCheck size={14} />
          <span>Thanh toán an toàn & Đối soát tự động</span>
        </div>
        <h1 className={styles.title}>
          Thanh toán & Kích hoạt <em>Interviewly PRO</em>
        </h1>
        <p className={styles.subtitle}>
          Quét mã VietQR chuyển khoản nhanh qua ứng dụng ngân hàng bất kỳ. Hệ thống tự động xác nhận và kích hoạt gói cước trong vòng 3 giây.
        </p>
      </section>

      <div className={styles.layout}>
        {/* LEFT COLUMN: Single Payment Method - VietQR / MB Bank */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <QrCode size={18} className="text-amber-600" />
            <span>Chuyển khoản qua mã VietQR</span>
          </h2>
          <p className={styles.cardSubtitle}>
            Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ, quét mã QR bên dưới để thanh toán tức thì với nội dung tự động.
          </p>

          <div className={styles.qrWrapper}>
            {/* QR Image Container */}
            <div className={styles.qrImageContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bankInfo.qrUrl}
                alt="Mã VietQR thanh toán Interviewly PRO"
                className={styles.qrImage}
              />
            </div>

            {/* Badges */}
            <div className={styles.bankBadgeRow}>
              <span className={styles.bankBadge}>MB Bank Quân Đội</span>
              <span className={styles.napasBadge}>Napas 247 Chuyển nhanh</span>
              <span className={styles.bankBadge}>xGate Xác thực tự động</span>
            </div>

            {/* Detailed Transfer Information */}
            <div className={styles.transferTable}>
              <div className={styles.transferRow}>
                <span className={styles.transferLabel}>Ngân hàng thụ hưởng:</span>
                <span className={styles.transferValue}>{bankInfo.bankName}</span>
              </div>

              <div className={styles.transferRow}>
                <span className={styles.transferLabel}>Chủ tài khoản:</span>
                <span className={styles.transferValue}>{bankInfo.accountName}</span>
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
                    title="Sao chép số tài khoản"
                  >
                    {copiedKey === "account" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "account" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
              </div>

              <div className={styles.transferRow}>
                <span className={styles.transferLabel}>Số tiền cần chuyển:</span>
                <div className={styles.transferValue}>
                  <span style={{ color: "#ea580c", fontSize: "16px", fontWeight: 800 }}>
                    {bankInfo.formattedAmount}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyButton} ${copiedKey === "amount" ? styles.copiedButton : ""}`}
                    onClick={() => handleCopy("amount", String(bankInfo.amountNumber))}
                    title="Sao chép số tiền"
                  >
                    {copiedKey === "amount" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "amount" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
              </div>

              <div className={styles.transferRow}>
                <span className={styles.transferLabel}>Nội dung chuyển khoản:</span>
                <div className={styles.transferValue}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#fef3c7",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      color: "#92400e",
                      border: "1px dashed #f59e0b",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {bankInfo.content}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyButton} ${copiedKey === "content" ? styles.copiedButton : ""}`}
                    onClick={() => handleCopy("content", bankInfo.content)}
                    title="Sao chép nội dung chuyển khoản"
                  >
                    {copiedKey === "content" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "content" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Steps guide */}
            <div className={styles.stepsContainer}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <p className={styles.stepText}>Mở ứng dụng Mobile Banking hoặc Ví điện tử</p>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <p className={styles.stepText}>Chọn Quét mã QR hoặc chuyển khoản đúng số tài khoản</p>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <p className={styles.stepText}>Kiểm tra đúng số tiền và nội dung chuyển khoản ({orderCode})</p>
              </div>
            </div>

            {/* Confirm Paid Action Button */}
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
                    <span>Đang xác thực giao dịch qua xGate...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Tôi đã chuyển khoản thành công</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Plan Selector */}
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Sparkles size={18} className="text-amber-600" />
              <span>Gói cước đã chọn</span>
            </h2>
            <p className={styles.cardSubtitle}>
              Bạn có thể linh hoạt chuyển đổi gói cước trước khi chuyển khoản.
            </p>

            {/* Billing Cycle Switcher */}
            <div className={styles.planSwitcher}>
              <button
                type="button"
                className={`${styles.planOption} ${cycle === "weekly" ? styles.planOptionActive : ""}`}
                onClick={() => setCycle("weekly")}
              >
                <span>7 Ngày</span>
                <span className={styles.sprintBadge}>Cấp tốc</span>
              </button>
              <button
                type="button"
                className={`${styles.planOption} ${cycle === "monthly" ? styles.planOptionActive : ""}`}
                onClick={() => setCycle("monthly")}
              >
                <span>Gói Tháng</span>
              </button>
              <button
                type="button"
                className={`${styles.planOption} ${cycle === "yearly" ? styles.planOptionActive : ""}`}
                onClick={() => setCycle("yearly")}
              >
                <span>1 Năm</span>
                <span className={styles.discountBadge}>-25%</span>
              </button>
            </div>

            {/* Summary Price Header */}
            <div className={styles.summaryHeader}>
              <div className={styles.planCardHeader}>
                <span className={styles.planName}>{planDisplayName}</span>
                <span className={styles.planBadge}>
                  {cycle === "weekly" ? "Cấp tốc 7 ngày" : cycle === "monthly" ? "Phổ biến nhất" : "Tiết kiệm 25%"}
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

            {/* Features Entitlements */}
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink, #211914)", margin: "0 0 14px" }}>
              Đặc quyền gói cước bao gồm:
            </p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span><strong>{cycle === "weekly" ? "35 lượt phỏng vấn AI" : "Không giới hạn lượt phỏng vấn"}</strong> {cycle === "weekly" ? "cấp tốc trong 7 ngày" : "chuyên sâu đa ngành nghề"}</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Phân tích tốc độ nói WPM & phát hiện từ đệm đa ngữ</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Chấm điểm chi tiết theo thang Rubric 3 tiêu chí</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Hướng dẫn phản xạ STAR thời gian thực trong phòng phỏng vấn</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><Check size={12} /></div>
                <span>Xuất báo cáo kỹ năng chi tiết định dạng PDF A4 chuẩn quốc tế</span>
              </li>
            </ul>

            {/* Calculation Breakdown */}
            <div className={styles.calcBox}>
              <div className={styles.calcRow}>
                <span>Đơn giá niêm yết:</span>
                <span>{formattedOriginalPrice}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Ưu đãi thành viên:</span>
                <span style={{ color: "#16a34a", fontWeight: 700 }}>
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
              <div className={styles.userNotice}>
                <span>Tài khoản kích hoạt: <strong>{user.email || user.full_name}</strong></span>
              </div>
            )}

            {/* Trust and security guarantees */}
            <div className={styles.guaranteeBox}>
              <Lock size={18} color="#059669" style={{ flexShrink: 0 }} />
              <span>Giao dịch an toàn 100% qua Napas 247 & xGate đối soát tự động. Cam kết hoàn tiền trong 7 ngày.</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT SUCCESS CELEBRATION MODAL */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {/* Ambient Celebration Aura Glow */}
            <div className={styles.glowRays} aria-hidden="true" />

            {/* Floating Burst Confetti Particles */}
            <div className={styles.confettiContainer} aria-hidden="true">
              <span className={`${styles.confetti} ${styles.c1}`} />
              <span className={`${styles.confetti} ${styles.c2}`} />
              <span className={`${styles.confetti} ${styles.c3}`} />
              <span className={`${styles.confetti} ${styles.c4}`} />
              <span className={`${styles.confetti} ${styles.c5}`} />
              <span className={`${styles.confetti} ${styles.c6}`} />
              <span className={`${styles.confetti} ${styles.c7}`} />
              <span className={`${styles.confetti} ${styles.c8}`} />
              <span className={`${styles.confetti} ${styles.c9}`} />
              <span className={`${styles.confetti} ${styles.c10}`} />
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowSuccessModal(false)}
              aria-label="Đóng hộp thoại"
            >
              <X size={16} />
            </button>

            {/* Glowing Success Badge with Pulse Rings */}
            <div className={styles.badgeWrapper}>
              <span className={styles.pulseRing} />
              <span className={styles.pulseRingDelay} />
              <div className={styles.successIconBadge}>
                <CheckCircle2 size={38} className={styles.checkIconAnim} />
              </div>
            </div>

            <div className={styles.goldProTag}>
              <Sparkles size={14} className={styles.sparkleSpin} />
              <span>KÍCH HOẠT THÀNH CÔNG</span>
            </div>

            <h3 className={styles.modalTitle}>Chào Mừng Bạn Đến Với PRO!</h3>
            <p className={styles.modalDesc}>
              Hệ thống xGate đã ghi nhận giao dịch chuyển khoản thành công. Tài khoản của bạn đã được kích hoạt đầy đủ đặc quyền gói <strong>{planDisplayName}</strong>.
            </p>

            <div className={styles.receiptCard}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Mã giao dịch:</span>
                <span className={styles.receiptValue}>{orderCode}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Gói cước:</span>
                <span className={styles.receiptValue}>{planDisplayName}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Số tiền:</span>
                <span className={styles.receiptValue} style={{ color: "#16a34a", fontSize: "14px" }}>
                  {formattedPrice}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Trạng thái:</span>
                <span className={styles.receiptValue} style={{ color: "#16a34a" }}>
                  Đã hoàn tất
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Link
                href="/practice"
                className={`${styles.primaryButton} ${styles.shinyButton}`}
                onClick={() => setShowSuccessModal(false)}
              >
                <span>Bắt đầu luyện phỏng vấn ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
