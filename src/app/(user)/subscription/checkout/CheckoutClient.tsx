"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  Mic,
  FileText,
  RotateCw,
  AlertCircle,
  LogIn,
  Zap,
} from "lucide-react";
import styles from "./checkout.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCreateCheckoutMutation, useVerifyPaymentMutation, useGetPlansQuery } from "@/redux/api/user/billingApi";
import { DEFAULT_PLANS } from "@/services/billingApi";
import { toast } from "@/components/user-component/toast";
import type { SubscriptionPlan } from "@/types/billing";

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


function getPaymentWsUrl(orderCode: string, token?: string | null): string {
  const cleanCode = encodeURIComponent(orderCode.trim().toUpperCase());
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const base = process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
    return `${base}/api/v1/billing/ws/${cleanCode}${tokenParam}`;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/+$/, "");
    return `${wsBase}/api/v1/billing/ws/${cleanCode}${tokenParam}`;
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/api/v1/billing/ws/${cleanCode}${tokenParam}`;
  }
  return `ws://localhost:8000/api/v1/billing/ws/${cleanCode}${tokenParam}`;
}

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Read URL parameters
  const planIdParam = searchParams.get("plan_id");
  const planNameParam = searchParams.get("plan");

  // Determine initial plan
  const [selectedPlanId, setSelectedPlanId] = useState<number>(() => {
    if (planIdParam) {
      const parsed = parseInt(planIdParam, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (
      planNameParam === "sprint_7days" ||
      planNameParam === "pro_weekly" ||
      planNameParam === "weekly" ||
      planNameParam === "7days"
    ) {
      return 4; // Sprint 7 days
    }
    if (planNameParam === "pro_yearly" || planNameParam === "yearly") {
      return 3; // Pro Yearly
    }
    return 2; // Pro Monthly default
  });

  // Cycle switcher for subscription plans
  const [cycle, setCycle] = useState<BillingCycle>(() => {
    if (selectedPlanId === 4) return "weekly";
    if (selectedPlanId === 3) return "yearly";
    return "monthly";
  });

  const handleCycleChange = (newCycle: BillingCycle) => {
    setCycle(newCycle);
    const newId = newCycle === "weekly" ? 4 : newCycle === "yearly" ? 3 : 2;
    setSelectedPlanId(newId);
  };

  const { data: remotePlans } = useGetPlansQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const allPlans = useMemo(() => {
    if (remotePlans && remotePlans.length > 0) {
      return remotePlans.map((p) => ({
        ...p,
        price: Number(p.price) || 0,
      }));
    }
    return DEFAULT_PLANS;
  }, [remotePlans]);

  // Find active plan details dynamically
  const activePlan: SubscriptionPlan = useMemo(() => {
    const found = allPlans.find((p) => p.plan_id === selectedPlanId);
    if (found) return found;
    return DEFAULT_PLANS[2];
  }, [allPlans, selectedPlanId]);

  const isAddon = Boolean(activePlan.plan_type === "addon" || selectedPlanId >= 100);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<boolean>(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [createCheckoutApi] = useCreateCheckoutMutation();
  const [verifyPaymentApi] = useVerifyPaymentMutation();
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    if (showSuccessModal) {
      playSuccessChime();
    }
  }, [showSuccessModal]);

  // Initialize checkout with backend to obtain real transaction reference
  const initCheckout = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsCreatingCheckout(true);
    setCheckoutError(null);
    try {
      const res = await createCheckoutApi({ plan_id: selectedPlanId }).unwrap();
      if (res && res.transaction_ref) {
        setOrderCode(res.transaction_ref);
      } else {
        setCheckoutError("Không nhận được mã giao dịch từ hệ thống. Vui lòng thử lại.");
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.data?.detail === "missing bearer token") {
        setCheckoutError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục thanh toán.");
      } else if (err?.status === "FETCH_ERROR") {
        setCheckoutError("Không thể kết nối đến máy chủ thanh toán (Backend). Vui lòng thử lại sau giây lát.");
      } else {
        setCheckoutError(err?.data?.detail || "Không thể khởi tạo phiên thanh toán. Vui lòng bấm thử lại.");
      }
    } finally {
      setIsCreatingCheckout(false);
    }
  }, [selectedPlanId, isAuthenticated, createCheckoutApi]);

  useEffect(() => {
    if (isAuthenticated) {
      initCheckout();
    } else if (!isAuthLoading) {
      setIsCreatingCheckout(false);
    }
  }, [isAuthenticated, isAuthLoading, initCheckout]);

  // 1. PRIMARY REAL-TIME: Ultra-fast WebSocket instant payment notification (<50ms)
  useEffect(() => {
    if (!orderCode || showSuccessModal || typeof window === "undefined") return;

    let isDisposed = false;
    let ws: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    try {
      const wsUrl = getPaymentWsUrl(orderCode, token);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isDisposed) {
          setIsSocketConnected(true);
        }
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: "ping" }));
            } catch {
              // Ignore ping error
            }
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        if (isDisposed) return;
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data?.type === "payment_success" || data?.status === "success") {
            toast.success(data?.message || "Thanh toán thành công! Gói cước đã được kích hoạt.");
            setShowSuccessModal(true);
            try {
              ws?.close(1000, "Payment completed");
            } catch {}
          }
        } catch {
          // Ignore parse error
        }
      };

      ws.onerror = () => {
        if (!isDisposed) {
          setIsSocketConnected(false);
        }
      };

      ws.onclose = () => {
        if (!isDisposed) {
          setIsSocketConnected(false);
        }
        if (pingInterval) clearInterval(pingInterval);
      };
    } catch {
      setIsSocketConnected(false);
    }

    return () => {
      isDisposed = true;
      if (pingInterval) clearInterval(pingInterval);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1000, "Component unmounted");
          }
        } catch {}
      }
    };
  }, [orderCode, token, showSuccessModal]);

  // 2. BACKUP POLLING: Continues in parallel (every 2.5s) to guarantee zero missed transactions
  useEffect(() => {
    if (!orderCode || showSuccessModal) return;
    let isCancelled = false;

    const intervalId = setInterval(async () => {
      try {
        const res = await verifyPaymentApi({ transaction_ref: orderCode }).unwrap();
        if (!isCancelled && res.status === "success") {
          toast.success("Thanh toán thành công! Gói cước đã được kích hoạt.");
          setShowSuccessModal(true);
          clearInterval(intervalId);
        }
      } catch {
        // Continue polling silently as backup
      }
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [orderCode, showSuccessModal, verifyPaymentApi]);

  // Pricing calculations
  const price = activePlan.price;
  const originalPrice = isAddon
    ? price
    : cycle === "weekly"
    ? 79000
    : cycle === "monthly"
    ? 149000
    : 1188000;
  const discountAmount = Math.max(0, originalPrice - price);
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(price) + " đ";
  const formattedOriginalPrice = new Intl.NumberFormat("vi-VN").format(originalPrice) + " đ";

  // Official MB Bank & VietQR transfer parameters
  const bankInfo = useMemo(() => {
    const transferContent = orderCode || "DANG_KHOI_TAO";
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


  const planDisplayName = activePlan.plan_name;
  const redirectTarget = `/subscription/checkout?plan_id=${selectedPlanId}`;

  // Case 1: Still checking auth state
  if (isAuthLoading) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <RotateCw size={36} className="animate-spin text-amber-600 mx-auto mb-3" />
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink, #211914)" }}>
            Đang kiểm tra thông tin tài khoản...
          </p>
        </div>
      </main>
    );
  }

  // Case 2: Not authenticated - Display clear Sign In prompt
  if (!isAuthenticated) {
    return (
      <main className={styles.container}>
        <section className={styles.header}>
          <div className={styles.badge}>
            <ShieldCheck size={14} />
            <span>Thanh toán an toàn & Đối soát tự động VietQR Napas 247</span>
          </div>
          <h1 className={styles.title}>
            Thanh toán & Kích hoạt <em>{isAddon ? "Gói Nạp Thêm" : "Interviewly PRO"}</em>
          </h1>
          <p className={styles.subtitle}>
            Quét mã VietQR chuyển khoản nhanh qua ứng dụng ngân hàng bất kỳ. Hệ thống đối soát xGate tự động xác nhận và kích hoạt trong vòng 3 giây.
          </p>
        </section>

        <div
          style={{
            maxWidth: 480,
            margin: "24px auto 60px",
            background: "#ffffff",
            borderRadius: 24,
            padding: "36px 28px",
            textAlign: "center",
            border: "1.5px solid rgba(217, 130, 54, 0.25)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(217, 130, 54, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <Lock size={32} color="#d98236" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink, #211914)", marginBottom: 8 }}>
            Vui lòng đăng nhập để tiếp tục
          </h2>
          <p style={{ fontSize: 14, color: "rgba(45, 31, 23, 0.75)", lineHeight: 1.6, marginBottom: 24 }}>
            Gói cước cần được liên kết với tài khoản của bạn để hệ thống tự động cộng số phút phỏng vấn và kích hoạt quyền lợi ngay sau khi nhận được chuyển khoản.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className={styles.primaryButton}
              style={{ justifyContent: "center", padding: "12px 24px", textDecoration: "none" }}
            >
              <LogIn size={16} />
              <span>Đăng nhập để thanh toán</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              style={{
                fontSize: 13,
                color: "rgba(45, 31, 23, 0.65)",
                textDecoration: "underline",
                fontWeight: 600,
                padding: 8,
              }}
            >
              Quay lại xem bảng giá
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Case 3: Authenticated
  return (
    <main className={styles.container}>
      {/* Header Section */}
      <section className={styles.header}>
        <div className={styles.badge}>
          <ShieldCheck size={14} />
          <span>Thanh toán an toàn & Đối soát tự động VietQR Napas 247</span>
        </div>
        <h1 className={styles.title}>
          Thanh toán & Kích hoạt <em>{isAddon ? "Gói Nạp Thêm" : "Interviewly PRO"}</em>
        </h1>
        <p className={styles.subtitle}>
          Quét mã VietQR chuyển khoản nhanh qua ứng dụng ngân hàng bất kỳ. Hệ thống đối soát xGate tự động xác nhận và kích hoạt trong vòng 3 giây.
        </p>
      </section>

      {/* Loading or Error State */}
      {isCreatingCheckout ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <RotateCw size={36} className="animate-spin text-amber-600 mx-auto mb-3" />
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink, #211914)" }}>
            Đang khởi tạo mã giao dịch xGate VietQR...
          </p>
        </div>
      ) : checkoutError ? (
        <div
          style={{
            maxWidth: 500,
            margin: "40px auto",
            textAlign: "center",
            padding: 28,
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #ef4444",
            boxShadow: "0 8px 30px rgba(239, 68, 68, 0.08)",
          }}
        >
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>
            Khởi tạo thanh toán không thành công
          </h3>
          <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 20, lineHeight: 1.5 }}>
            {checkoutError}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {checkoutError.includes("đăng nhập") ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                className={styles.primaryButton}
                style={{ padding: "10px 24px", textDecoration: "none" }}
              >
                <LogIn size={15} /> Đăng nhập lại
              </Link>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={initCheckout}
                style={{ padding: "10px 24px" }}
              >
                <RotateCw size={14} /> Thử lại
              </button>
            )}
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: 12,
                border: "1px solid rgba(106, 72, 49, 0.2)",
                color: "#211914",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Về trang giá
            </Link>
          </div>
        </div>
      ) : (
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
                  alt={`Mã VietQR thanh toán ${planDisplayName}`}
                  className={styles.qrImage}
                />
              </div>

              {/* Badges */}
              <div className={styles.bankBadgeRow}>
                <span className={styles.bankBadge}>MB Bank Quân Đội</span>
                <span className={styles.napasBadge}>Napas 247 Chuyển nhanh</span>
                <span className={styles.bankBadge}>xGate Tự động kích hoạt</span>
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

              {/* Automated Real-Time Webhook & WebSocket Listener Status Card */}
              <div className={styles.autoListenerCard}>
                <div className={styles.autoListenerHeader}>
                  <span className={styles.liveIndicatorDot} />
                  <span className={styles.autoListenerTitle}>
                    {isSocketConnected
                      ? "Kết nối trực tiếp thời gian thực (WebSocket)..."
                      : "Hệ thống đang tự động lắng nghe giao dịch..."}
                  </span>
                  {isSocketConnected && (
                    <span className={styles.socketBadge}>
                      <Zap size={11} className="text-amber-500 fill-amber-500" />
                      Realtime Socket
                    </span>
                  )}
                </div>
                <p className={styles.autoListenerDesc}>
                  Ngay khi bạn chuyển khoản thành công trên app ngân hàng, hệ thống sẽ tự động kích hoạt tức thì qua <strong>WebSocket thời gian thực</strong> (kèm cơ chế dự phòng Napas 24/7).
                </p>
                <div className={styles.autoListenerFooter}>
                  <RotateCw size={13} className="animate-spin text-emerald-600" />
                  <span>
                    {isSocketConnected
                      ? "⚡ WebSocket kết nối trực tiếp (0ms delay) + Dự phòng Napas 24/7"
                      : "Đối soát tự động VietQR Napas 24/7 thời gian thực"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Plan Selector */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Sparkles size={18} className="text-amber-600" />
                <span>{isAddon ? "Gói nạp bổ sung" : "Gói cước đã chọn"}</span>
              </h2>
              <p className={styles.cardSubtitle}>
                {isAddon
                  ? "Phút hoặc lượt tạo CV sẽ được cộng dồn trực tiếp vào tài khoản của bạn ngay khi giao dịch hoàn tất."
                  : "Bạn có thể linh hoạt chuyển đổi gói cước trước khi chuyển khoản."}
              </p>

              {/* Billing Cycle Switcher (hidden for Addons) */}
              {!isAddon && (
                <div className={styles.planSwitcher}>
                  <button
                    type="button"
                    className={`${styles.planOption} ${cycle === "weekly" ? styles.planOptionActive : ""}`}
                    onClick={() => handleCycleChange("weekly")}
                  >
                    <span>7 Ngày</span>
                    <span className={styles.sprintBadge}>Cấp tốc</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.planOption} ${cycle === "monthly" ? styles.planOptionActive : ""}`}
                    onClick={() => handleCycleChange("monthly")}
                  >
                    <span>Gói Tháng</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.planOption} ${cycle === "yearly" ? styles.planOptionActive : ""}`}
                    onClick={() => handleCycleChange("yearly")}
                  >
                    <span>1 Năm</span>
                    <span className={styles.discountBadge}>-25%</span>
                  </button>
                </div>
              )}

              {/* Summary Price Header */}
              <div className={styles.summaryHeader}>
                <div className={styles.planCardHeader}>
                  <span className={styles.planName}>{planDisplayName}</span>
                  <span className={styles.planBadge}>
                    {isAddon
                      ? "Nạp dùng ngay"
                      : cycle === "weekly"
                      ? "Cấp tốc 7 ngày"
                      : cycle === "monthly"
                      ? "Phổ biến nhất"
                      : "Tiết kiệm 25%"}
                  </span>
                </div>

                <div className={styles.priceDisplay}>
                  {!isAddon && <span className={styles.originalPrice}>{formattedOriginalPrice}</span>}
                  <span className={styles.priceAmount}>{formattedPrice}</span>
                  <span className={styles.pricePeriod}>
                    {isAddon
                      ? " (một lần)"
                      : cycle === "weekly"
                      ? "/ 7 ngày"
                      : cycle === "monthly"
                      ? "/ tháng"
                      : "/ năm"}
                  </span>
                </div>
              </div>

              {/* Features Entitlements */}
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink, #211914)", margin: "0 0 14px" }}>
                Đặc quyền gói bao gồm:
              </p>
              <ul className={styles.featureList}>
                {isAddon ? (
                  <>
                    {activePlan.feature_limits.voice_minutes ? (
                      <li className={styles.featureItem}>
                        <div className={styles.featureIcon}><Mic size={12} /></div>
                        <span>Cộng thêm <strong>{activePlan.feature_limits.voice_minutes} phút</strong> phỏng vấn giọng nói AI</span>
                      </li>
                    ) : null}
                    {activePlan.feature_limits.cv_generations ? (
                      <li className={styles.featureItem}>
                        <div className={styles.featureIcon}><FileText size={12} /></div>
                        <span>Cộng thêm <strong>{activePlan.feature_limits.cv_generations} lượt</strong> tạo CV chuẩn ATS theo JD</span>
                      </li>
                    ) : null}
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span>Không giới hạn hạn dùng • Dùng song song với gói hiện tại</span>
                    </li>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span>Xem lại kết quả & báo cáo phiên đã tạo <strong>miễn phí vĩnh viễn</strong></span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span><strong>{cycle === "weekly" ? "60 phút (~2-3 phiên)" : cycle === "yearly" ? "4.000 phút (~130 phiên)" : "300 phút (~10 phiên)"}</strong> phỏng vấn giọng nói AI</span>
                    </li>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span><strong>{cycle === "weekly" ? "3 lượt" : cycle === "yearly" ? "200 lượt" : "15 lượt"}</strong> tạo CV AI chuyên sâu theo JD</span>
                    </li>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span>Phân tích tốc độ nói WPM & phát hiện từ đệm đa ngữ</span>
                    </li>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span>Chấm điểm chi tiết theo thang Rubric 3 tiêu chí & STAR</span>
                    </li>
                    <li className={styles.featureItem}>
                      <div className={styles.featureIcon}><Check size={12} /></div>
                      <span>Xuất báo cáo kỹ năng chi tiết định dạng PDF A4 chuẩn quốc tế</span>
                    </li>
                  </>
                )}
              </ul>

              {/* Calculation Breakdown */}
              <div className={styles.calcBox}>
                <div className={styles.calcRow}>
                  <span>Đơn giá niêm yết:</span>
                  <span>{formattedOriginalPrice}</span>
                </div>
                {!isAddon && discountAmount > 0 && (
                  <div className={styles.calcRow}>
                    <span>Ưu đãi thành viên:</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>
                      - {new Intl.NumberFormat("vi-VN").format(discountAmount)} đ
                    </span>
                  </div>
                )}
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

              {/* Switch to main plans link if currently viewing addon */}
              {isAddon && (
                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <Link href="/pricing" style={{ fontSize: 13, color: "#8b4513", textDecoration: "underline", fontWeight: 600 }}>
                    ← Xem lại các gói thành viên Sprint / Pro
                  </Link>
                </div>
              )}

              {/* Trust and security guarantees */}
              <div className={styles.guaranteeBox}>
                <Lock size={18} color="#059669" style={{ flexShrink: 0 }} />
                <span>Giao dịch an toàn 100% qua Napas 247 & xGate đối soát tự động. Cam kết bảo lưu kết quả miễn phí.</span>
              </div>
            </div>
          </div>
        </div>
      )}

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

            <h3 className={styles.modalTitle}>Chào Mừng Bạn Đến Với Interviewly PRO!</h3>
            <p className={styles.modalDesc}>
              Hệ thống xGate đã ghi nhận giao dịch chuyển khoản thành công. Tài khoản của bạn đã được kích hoạt đầy đủ quyền lợi của <strong>{planDisplayName}</strong>.
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
                <span className={styles.receiptValue} style={{ color: "#16a34a", fontSize: "14px", fontWeight: 700 }}>
                  {formattedPrice}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Trạng thái:</span>
                <span className={styles.receiptValue} style={{ color: "#16a34a", fontWeight: 700 }}>
                  Đã hoàn tất (Active)
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
