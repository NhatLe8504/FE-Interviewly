"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Award,
  Clock,
  Zap,
  Flame,
  FileText,
  Mic,
  RotateCcw,
} from "lucide-react";
import styles from "./pricing.module.css";
import { billingApi, DEFAULT_PLANS } from "@/services/billingApi";
import { useI18n } from "@/context/I18nContext";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import type { SubscriptionPlan } from "@/types/billing";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: "Gói Cấp Tốc 7 Ngày (7-Day Sprint) có gì đặc biệt?",
    answer:
      "Gói Cấp Tốc 7 Ngày cung cấp 60 phút phỏng vấn giọng nói AI thích ứng theo thời gian thực (~2 đến 3 buổi phỏng vấn trọn vẹn) và 3 lượt tạo CV AI chuyên sâu, cùng toàn bộ quyền Pro trong 7 ngày. Đây là lựa chọn hoàn hảo khi bạn có lịch phỏng vấn sát nút trong tuần tới.",
  },
  {
    question: "Khi hết phút phỏng vấn hoặc lượt tạo CV, tôi phải làm sao?",
    answer:
      "Bạn không cần phải mua lại toàn bộ gói lớn. Bạn có thể nạp thêm gói phút phỏng vấn (30p, 60p, 120p) hoặc gói lượt tạo CV AI (3 lượt, 10 lượt) bất cứ lúc nào trong mục Gói Mua Thêm (Add-ons). Phút và lượt mua thêm sẽ được cộng dồn và không bị hết hạn.",
  },
  {
    question: "Xem lại kết quả phỏng vấn và tải báo cáo cũ có bị trừ phí hay trừ phút không?",
    answer:
      "Hoàn toàn KHÔNG! Bất kỳ phiên phỏng vấn nào bạn đã hoàn thành, hệ thống sẽ lưu trữ và cho phép bạn xem lại lịch sử câu hỏi, phân tích rubric STAR, nghe lại âm thanh và tải báo cáo PDF hoàn toàn MIỄN PHÍ vĩnh viễn.",
  },
  {
    question: "Cổng thanh toán xGate / VietQR hoạt động như thế nào?",
    answer:
      "Hệ thống tạo mã VietQR chuẩn Napas 247 với nội dung chuyển khoản tự động. Bạn quét mã bằng bất kỳ app ngân hàng nào (MB, Vietcombank, Techcombank, Momo...), hệ thống tự động đối soát và kích hoạt gói ngay trong 3 giây.",
  },
  {
    question: "Chính sách hoàn tiền của Interviewly như thế nào?",
    answer:
      "Chúng tôi cam kết hỗ trợ hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn gặp lỗi kỹ thuật không thể thực hiện phiên phỏng vấn và chưa sử dụng quá 15 phút.",
  },
];

interface FeatureComparisonGroup {
  category: string;
  features: {
    name: string;
    free: string | boolean;
    sprint: string | boolean;
    pro: string | boolean;
  }[];
}

const COMPARISON_GROUPS: FeatureComparisonGroup[] = [
  {
    category: "Hạn Mức & Luyện Tập Thực Chiến",
    features: [
      {
        name: "Thời lượng phỏng vấn giọng nói AI",
        free: "15 phút trải nghiệm",
        sprint: "60 phút (~2-3 phiên)",
        pro: "300 phút/tháng (4.000p/năm)",
      },
      {
        name: "Lượt tạo CV AI chuẩn ATS theo JD",
        free: "1 lượt tạo mẫu",
        sprint: "3 lượt chuyên sâu",
        pro: "15 lượt/tháng (200 lượt/năm)",
      },
      {
        name: "Tùy chọn nạp thêm phút & lượt (Add-ons)",
        free: true,
        sprint: true,
        pro: true,
      },
      {
        name: "Chọn cấp bậc (Fresher, Junior, Mid, Senior)",
        free: "Fresher & Junior",
        sprint: "Toàn bộ cấp bậc",
        pro: "Toàn bộ cấp bậc",
      },
      {
        name: "Phỏng vấn thích ứng Adaptive Voice Flow",
        free: "Cơ bản",
        sprint: "Đa tầng thời gian thực",
        pro: "Đa tầng thời gian thực",
      },
    ],
  },
  {
    category: "Đánh Giá & Phân Tích",
    features: [
      {
        name: "Chấm điểm Rubric & cấu trúc STAR",
        free: "Điểm tổng quan",
        sprint: "Chi tiết từng câu hỏi",
        pro: "Chi tiết từng câu hỏi",
      },
      {
        name: "Phân tích tốc độ nói (WPM) & từ đệm",
        free: false,
        sprint: true,
        pro: true,
      },
      {
        name: "Gợi ý câu trả lời mẫu tối ưu",
        free: false,
        sprint: true,
        pro: true,
      },
    ],
  },
  {
    category: "Báo Cáo & Lưu Trữ",
    features: [
      {
        name: "Xuất báo cáo kỹ năng PDF A4 (có mã QR)",
        free: false,
        sprint: true,
        pro: true,
      },
      {
        name: "Xem lại kết quả phỏng vấn & báo cáo cũ",
        free: "Miễn phí vĩnh viễn",
        sprint: "Miễn phí vĩnh viễn",
        pro: "Miễn phí vĩnh viễn",
      },
    ],
  },
];

export default function PricingPage() {
  const { locale, t } = useI18n();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const remotePlans = await billingApi.getPlans();
        if (isMounted && remotePlans && remotePlans.length > 0) {
          setPlans(remotePlans);
        }
      } catch {
        // Keep default plans
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const isYearly = billingCycle === "yearly";
  const proMonthlyPlan =
    plans.find((p) => p.plan_id === 2 || p.billing_cycle === "monthly") || DEFAULT_PLANS[2];
  const proYearlyPlan =
    plans.find((p) => p.plan_id === 3 || p.billing_cycle === "yearly") || DEFAULT_PLANS[3];
  const sprintPlan =
    plans.find((p) => p.plan_id === 4 || p.billing_cycle === "weekly") || DEFAULT_PLANS[1];

  const activeProPlan = isYearly ? proYearlyPlan : proMonthlyPlan;
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(activeProPlan.price) + " đ";
  const sprintPrice = new Intl.NumberFormat("vi-VN").format(sprintPlan.price) + " đ";
  const checkoutPlanKey = isYearly ? "pro_yearly" : "pro_monthly";

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <Sparkles size={14} /> Gói cước kết hợp & hạn mức minh bạch
          </div>
          <h1 className={styles.title}>
            Đầu tư vào tương lai sự nghiệp với <em>AI Interview Coach</em>
          </h1>
          <p className={styles.subtitle}>
            Minh bạch hạn mức theo phút phỏng vấn thực tế và lượt tạo CV AI. Không ép mua xu ảo, tùy ý nạp thêm gói phút khi cần.
          </p>

          {/* Billing cycle toggle */}
          <div className={styles.toggleContainer}>
            <div className={styles.mascotBadgeWrap}>
              <PageMascot size={68} />
            </div>
            <div className={styles.toggleWrapper} role="tablist" aria-label="Chu kỳ thanh toán">
              <button
                type="button"
                className={`${styles.toggleBtn} ${!isYearly ? styles.toggleBtnActive : ""}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Theo tháng
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isYearly ? styles.toggleBtnActive : ""}`}
                onClick={() => setBillingCycle("yearly")}
              >
                Theo năm
                <span className={styles.discountBadge}>Tiết kiệm 25%</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className={styles.cardsGrid}>
          {/* Free Plan */}
          <div className={styles.card}>
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>Miễn Phí (Free Starter)</h2>
              <p className={styles.planDesc}>
                Trải nghiệm mô phỏng phỏng vấn AI với hạn mức có sẵn.
              </p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>0 đ</span>
              <span className={styles.pricePeriod}>/ vĩnh viễn</span>
            </div>
            <div className={styles.priceSubtext}>Không cần thẻ thanh toán</div>

            <div className={styles.divider} />

            <div className={styles.featuresTitle}>Hạn mức & tính năng:</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>15 phút</strong> phỏng vấn giọng nói AI</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>1 lượt</strong> tạo CV mẫu chuẩn ATS</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Khám phá ngân hàng câu hỏi & lộ trình học</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Xem lại kết quả & lịch sử phỏng vấn <strong>miễn phí vĩnh viễn</strong></span>
              </li>
              <li className={styles.featureItem}>
                <X size={18} className={styles.featureIconCross} />
                <span className={styles.featureTextMuted}>Phân tích giọng nói WPM & phát hiện từ đệm</span>
              </li>
              <li className={styles.featureItem}>
                <X size={18} className={styles.featureIconCross} />
                <span className={styles.featureTextMuted}>Xuất báo cáo PDF A4 có mã QR</span>
              </li>
            </ul>

            <Link href="/practice" className={`${styles.ctaBtn} ${styles.ctaSecondary}`}>
              Bắt đầu miễn phí ngay
            </Link>
          </div>

          {/* 7-Day Sprint Plan */}
          <div className={`${styles.card} ${styles.cardSprint}`}>
            <div className={styles.sprintRibbon}>
              <Flame size={13} /> Cấp tốc 7 ngày
            </div>

            <div className={styles.planHeader}>
              <h2 className={styles.planName}>Cấp Tốc (7-Day Sprint)</h2>
              <p className={styles.planDesc}>
                Luyện phỏng vấn cấp tốc trong 7 ngày, tăng tối đa phản xạ và tự tin.
              </p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>{sprintPrice}</span>
              <span className={styles.pricePeriod}>/ 7 ngày</span>
            </div>
            <div className={styles.priceSubtextSprint}>
              Chỉ ~7.000 đ/ngày • Không tự động gia hạn
            </div>

            <div className={styles.divider} />

            <div className={styles.featuresTitle}>Đặc quyền gói Cấp Tốc:</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>60 phút</strong> phỏng vấn giọng nói AI (~2-3 buổi trọn vẹn)</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>3 lượt</strong> tạo & tối ưu CV theo JD bằng AI</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Toàn bộ quyền Pro trong 7 ngày</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Phân tích giọng nói WPM & phát hiện từ đệm</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Chấm điểm Rubric 3 tiêu chí & gợi ý STAR</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Xuất báo cáo PDF A4 có mã QR bảo chứng</span>
              </li>
            </ul>

            <Link
              href="/subscription/checkout?plan=sprint_7days"
              className={`${styles.ctaBtn} ${styles.ctaSprint}`}
            >
              Bắt đầu Cấp Tốc 7 Ngày <ArrowRight size={18} />
            </Link>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.card} ${styles.cardPro}`}>
            <div className={styles.popularRibbon}>
              <Zap size={13} /> Được đề xuất nhiều nhất
            </div>

            <div className={styles.planHeader}>
              <h2 className={styles.planName}>Chuyên Nghiệp (Pro Master)</h2>
              <p className={styles.planDesc}>
                Rèn luyện chuyên sâu dài hạn, sẵn sàng cho mọi kỳ phỏng vấn quan trọng.
              </p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>{formattedPrice}</span>
              <span className={styles.pricePeriod}>/ {isYearly ? "năm" : "tháng"}</span>
            </div>
            <div className={styles.priceSubtext}>
              {isYearly
                ? "Tương đương ~74.900 đ/tháng • Tiết kiệm 25%"
                : "Thanh toán linh hoạt theo từng tháng"}
            </div>

            <div className={styles.divider} />

            <div className={styles.featuresTitle}>Toàn bộ đặc quyền Pro:</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>{isYearly ? "4.000 phút (~130 phiên)" : "300 phút (~10 phiên)"}</strong> phỏng vấn giọng nói</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span><strong>{isYearly ? "200 lượt" : "15 lượt"}</strong> tạo & tối ưu CV AI chuyên sâu</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Toàn quyền mở khóa tất cả khóa học & case study</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Phân tích giọng nói WPM & phát hiện từ đệm</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Chấm điểm Rubric 3 tiêu chí & câu trả lời mẫu</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={18} className={styles.featureIconCheck} />
                <span>Xuất báo cáo PDF A4 & lưu trữ lịch sử vĩnh viễn</span>
              </li>
            </ul>

            <Link
              href={`/subscription/checkout?plan=${checkoutPlanKey}`}
              className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
            >
              Nâng cấp gói Pro ngay <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Free Report Retention Guarantee Banner */}
        <div className={styles.freeReviewBanner}>
          <div className={styles.freeReviewBannerIcon}>
            <RotateCcw size={22} />
          </div>
          <div className={styles.freeReviewBannerText}>
            <strong>Cam kết bảo lưu kết quả miễn phí:</strong> Khi bạn đã hoàn thành một phiên phỏng vấn hoặc tạo CV, bạn có thể xem lại toàn bộ lịch sử trả lời, phân tích năng lực STAR và tải báo cáo PDF <strong>hoàn toàn miễn phí trọn đời</strong>, không bao giờ bị trừ thêm phút hay bất kỳ chi phí nào khi mở lại báo cáo.
          </div>
        </div>

        {/* ADD-ON PACKS SECTION */}
        <section className={styles.addonsSection}>
          <div className={styles.addonsHeader}>
            <div className={styles.addonsBadge}>
              <Sparkles size={13} /> Gói Nạp Bổ Sung (Add-on Packs)
            </div>
            <h2 className={styles.addonsTitle}>Nạp thêm phút & lượt dùng khi cần</h2>
            <p className={styles.addonsSubtitle}>
              Hết phút phỏng vấn hoặc cần tạo thêm CV? Mua thêm theo nhu cầu thực tế, cộng dồn vào tài khoản ngay lập tức và không lo hết hạn.
            </p>
          </div>

          <div className={styles.addonsGrid}>
            {/* Addon 101 */}
            <div className={styles.addonCard}>
              <div className={styles.addonCardTop}>
                <span className={styles.addonTag}>Phỏng vấn Voice AI</span>
                <h3 className={styles.addonCardTitle}>+30 Phút Phỏng Vấn</h3>
                <p className={styles.addonCardDesc}>
                  Thêm 30 phút luyện tập phỏng vấn giọng nói thời gian thực.
                </p>
                <div className={styles.addonPriceRow}>
                  <span className={styles.addonPrice}>29.000 đ</span>
                </div>
              </div>
              <Link href="/subscription/checkout?plan_id=101" className={styles.addonBtn}>
                <Mic size={14} /> Nạp 30 phút ngay
              </Link>
            </div>

            {/* Addon 102 */}
            <div className={styles.addonCard} style={{ borderColor: "rgba(217, 130, 54, 0.4)" }}>
              <div className={styles.addonCardTop}>
                <span className={styles.addonTag} style={{ background: "#ffedd5", color: "#c2410c" }}>
                  Phổ biến nhất
                </span>
                <h3 className={styles.addonCardTitle}>+60 Phút Phỏng Vấn</h3>
                <p className={styles.addonCardDesc}>
                  Thêm 60 phút (~2 buổi trọn vẹn) kèm phân tích phát hiện từ đệm.
                </p>
                <div className={styles.addonPriceRow}>
                  <span className={styles.addonPrice}>49.000 đ</span>
                </div>
              </div>
              <Link href="/subscription/checkout?plan_id=102" className={styles.addonBtn} style={{ background: "#c2410c" }}>
                <Mic size={14} /> Nạp 60 phút ngay
              </Link>
            </div>

            {/* Addon 103 */}
            <div className={styles.addonCard}>
              <div className={styles.addonCardTop}>
                <span className={styles.addonTag}>Tiết kiệm 20%</span>
                <h3 className={styles.addonCardTitle}>+120 Phút Phỏng Vấn</h3>
                <p className={styles.addonCardDesc}>
                  Thêm 120 phút luyện tập chuyên sâu cho mọi câu hỏi kỹ thuật & hành vi.
                </p>
                <div className={styles.addonPriceRow}>
                  <span className={styles.addonPrice}>89.000 đ</span>
                </div>
              </div>
              <Link href="/subscription/checkout?plan_id=103" className={styles.addonBtn}>
                <Mic size={14} /> Nạp 120 phút ngay
              </Link>
            </div>

            {/* Addon 104 */}
            <div className={styles.addonCard}>
              <div className={styles.addonCardTop}>
                <span className={styles.addonTag} style={{ background: "#f3e8ff", color: "#7e22ce" }}>
                  Tạo CV AI
                </span>
                <h3 className={styles.addonCardTitle}>+3 Lượt Tạo CV</h3>
                <p className={styles.addonCardDesc}>
                  Thêm 3 lượt sinh & tối ưu CV chuẩn ATS tự động từ mô tả công việc (JD).
                </p>
                <div className={styles.addonPriceRow}>
                  <span className={styles.addonPrice}>19.000 đ</span>
                </div>
              </div>
              <Link href="/subscription/checkout?plan_id=104" className={styles.addonBtn}>
                <FileText size={14} /> Nạp 3 lượt CV
              </Link>
            </div>

            {/* Addon 105 */}
            <div className={styles.addonCard}>
              <div className={styles.addonCardTop}>
                <span className={styles.addonTag} style={{ background: "#f3e8ff", color: "#7e22ce" }}>
                  Gói Siêu Hời
                </span>
                <h3 className={styles.addonCardTitle}>+10 Lượt Tạo CV</h3>
                <p className={styles.addonCardDesc}>
                  Thêm 10 lượt tối ưu CV AI không giới hạn ngành nghề, chuẩn quốc tế.
                </p>
                <div className={styles.addonPriceRow}>
                  <span className={styles.addonPrice}>49.000 đ</span>
                </div>
              </div>
              <Link href="/subscription/checkout?plan_id=105" className={styles.addonBtn}>
                <FileText size={14} /> Nạp 10 lượt CV
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table (Collapsible by default) */}
        <section className={styles.tableSection}>
          <div className={styles.toggleBtnWrapper}>
            <button
              type="button"
              className={`${styles.tableToggleBtn} ${isTableExpanded ? styles.tableToggleBtnActive : ""}`}
              onClick={() => setIsTableExpanded((prev) => !prev)}
              aria-expanded={isTableExpanded}
            >
              <span>{isTableExpanded ? "Thu gọn bảng so sánh chi tiết" : "Xem bảng so sánh chi tiết tính năng"}</span>
              <ChevronDown
                size={18}
                className={`${styles.toggleChevron} ${isTableExpanded ? styles.toggleChevronActive : ""}`}
              />
            </button>
          </div>

          {isTableExpanded && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tính Năng</th>
                    <th>Gói Miễn Phí</th>
                    <th>Gói Cấp Tốc (7 Ngày)</th>
                    <th>Gói Chuyên Nghiệp (Pro)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_GROUPS.map((group) => (
                    <tr key={group.category} className={styles.tableCategoryRow}>
                      <td colSpan={4}>{group.category}</td>
                    </tr>
                  )).reduce<React.ReactNode[]>((acc, groupRow, idx) => {
                    const group = COMPARISON_GROUPS[idx];
                    acc.push(groupRow);
                    group.features.forEach((feature) => {
                      acc.push(
                        <tr key={feature.name} className={styles.tableRow}>
                          <td className={styles.tableFeatureName}>{feature.name}</td>
                          <td className={styles.tableColFree}>
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <Check size={18} className={styles.featureIconCheck} />
                              ) : (
                                <X size={18} className={styles.featureIconCross} />
                              )
                            ) : (
                              feature.free
                            )}
                          </td>
                          <td className={styles.tableColSprint}>
                            {typeof feature.sprint === "boolean" ? (
                              feature.sprint ? (
                                <Check size={18} className={styles.featureIconCheck} />
                              ) : (
                                <X size={18} className={styles.featureIconCross} />
                              )
                            ) : (
                              feature.sprint
                            )}
                          </td>
                          <td className={styles.tableColPro}>
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <Check size={18} className={styles.featureIconCheck} />
                              ) : (
                                <X size={18} className={styles.featureIconCross} />
                              )
                            ) : (
                              feature.pro
                            )}
                          </td>
                        </tr>
                      );
                    });
                    return acc;
                  }, [])}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Câu hỏi thường gặp</h2>
            <p className={styles.sectionSubtitle}>
              Mọi thắc mắc của bạn về việc đăng ký, cổng thanh toán VietQR và chính sách của Interviewly.
            </p>
          </div>

          <div className={styles.faqList}>
            {FAQ_LIST.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question} className={styles.faqCard}>
                  <button
                    type="button"
                    className={styles.faqQuestionBtn}
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust & Guarantee Banner */}
        <section className={styles.trustBanner}>
          <div className={styles.trustContent}>
            <h3 className={styles.trustTitle}>Cam kết an toàn tuyệt đối với Interviewly</h3>
            <p className={styles.trustDesc}>
              Xác thực giao dịch tự động qua cổng xGate VietQR Napas 247. Hỗ trợ kích hoạt tức thì không chờ đợi.
            </p>
          </div>
          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <ShieldCheck size={20} color="#d98236" />
              <span>Đối soát tự động xGate</span>
            </div>
            <div className={styles.trustItem}>
              <Clock size={20} color="#d98236" />
              <span>Kích hoạt trong 3 giây</span>
            </div>
            <div className={styles.trustItem}>
              <Award size={20} color="#d98236" />
              <span>Bảo lưu kết quả vĩnh viễn</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
