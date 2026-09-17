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
} from "lucide-react";
import styles from "./pricing.module.css";
import { billingApi, DEFAULT_PLANS } from "@/services/billingApi";
import { useI18n } from "@/context/I18nContext";
import type { SubscriptionPlan } from "@/types/billing";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: "Gói Cấp Tốc 7 Ngày (7-Day Sprint) phù hợp với ai?",
    answer:
      "Gói Cấp Tốc 7 Ngày được thiết kế cho ứng viên chuẩn bị phỏng vấn trong 1 tuần tới. Với 30 lượt luyện tập, phân tích WPM, từ đệm và chấm điểm STAR, bạn sẽ nhanh chóng lấy lại phản xạ và tự tin bước vào buổi phỏng vấn.",
  },
  {
    question: "Tôi có thể hủy gói đăng ký bất kỳ lúc nào không?",
    answer:
      "Có. Bạn có thể chủ động hủy gia hạn bất cứ lúc nào trong trang Quản lý gói cước. Sau khi hủy, bạn vẫn được sử dụng toàn bộ tính năng cho đến hết chu kỳ đã thanh toán.",
  },
  {
    question: "Cổng thanh toán VNPay hỗ trợ những hình thức thanh toán nào?",
    answer:
      "VNPay hỗ trợ quét mã VNPAY-QR trên hơn 30 ứng dụng ngân hàng và ví điện tử, thẻ ATM nội địa cùng thẻ quốc tế Visa, Mastercard và JCB.",
  },
  {
    question: "Tài khoản của tôi sẽ được kích hoạt sau bao lâu?",
    answer:
      "Hệ thống tự động kích hoạt tài khoản của bạn ngay lập tức sau khi giao dịch thành công.",
  },
  {
    question: "Chính sách hoàn tiền hoạt động như thế nào?",
    answer:
      "Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn đã trải nghiệm dưới 3 lượt phỏng vấn và cảm thấy dịch vụ chưa phù hợp.",
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
    category: "Luyện Tập & Phỏng Vấn",
    features: [
      {
        name: "Số lượt phỏng vấn",
        free: "3 lượt / tháng",
        sprint: "30 lượt / 7 ngày",
        pro: "100 lượt / tháng (1.500/năm)",
      },
      {
        name: "Thời lượng mỗi buổi phỏng vấn",
        free: "Tối đa 10 phút",
        sprint: "Không giới hạn",
        pro: "Không giới hạn",
      },
      {
        name: "Chọn cấp bậc (Fresher, Junior, Mid, Senior)",
        free: "Fresher & Junior",
        sprint: "Toàn bộ cấp bậc",
        pro: "Toàn bộ cấp bậc",
      },
      {
        name: "Phỏng vấn thích ứng theo ngữ cảnh",
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
        name: "Gợi ý câu trả lời mẫu tham khảo",
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
        name: "Lưu trữ lịch sử phiên phỏng vấn",
        free: "3 phiên gần nhất",
        sprint: "Trong thời gian gói (7 ngày)",
        pro: "Vĩnh viễn",
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
  const proMonthlyPlan = plans.find((p) => p.billing_cycle === "monthly") || DEFAULT_PLANS[2] || DEFAULT_PLANS[1];
  const proYearlyPlan = plans.find((p) => p.billing_cycle === "yearly") || DEFAULT_PLANS[3] || DEFAULT_PLANS[2];
  const activeProPlan = isYearly ? proYearlyPlan : proMonthlyPlan;

  const formattedPrice = new Intl.NumberFormat("vi-VN").format(activeProPlan.price) + " đ";
  const checkoutPlanKey = isYearly ? "pro_yearly" : "pro_monthly";

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={14} /> Gói cước linh hoạt & minh bạch
        </div>
        <h1 className={styles.title}>
          Đầu tư vào tương lai sự nghiệp với <em>AI Interview Coach</em>
        </h1>
        <p className={styles.subtitle}>
          Rèn luyện phản xạ phỏng vấn thực chiến, nhận phân tích giọng nói WPM thời gian thực và tự tin trúng tuyển vào các doanh nghiệp hàng đầu.
        </p>

        {/* Billing cycle toggle */}
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
            <span className={styles.discountBadge}>Tiết kiệm 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className={styles.cardsGrid}>
        {/* Free Plan */}
        <div className={styles.card}>
          <div className={styles.planHeader}>
            <h2 className={styles.planName}>Miễn Phí (Free Starter)</h2>
            <p className={styles.planDesc}>
              Trải nghiệm mô phỏng phỏng vấn AI với các tính năng cơ bản.
            </p>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>0 đ</span>
            <span className={styles.pricePeriod}>/ mãi mãi</span>
          </div>
          <div className={styles.priceSubtext}>Không cần thẻ thanh toán</div>

          <div className={styles.divider} />

          <div className={styles.featuresTitle}>Tính năng bao gồm:</div>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span><strong>3 lượt phỏng vấn</strong> miễn phí / tháng</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Phỏng vấn tối đa 10 phút / phiên</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Đánh giá năng lực theo chuẩn STAR</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Câu hỏi cơ bản cho Fresher & Junior</span>
            </li>
            <li className={styles.featureItem}>
              <X size={18} className={styles.featureIconCross} />
              <span className={styles.featureTextMuted}>Phân tích giọng nói WPM & từ đệm</span>
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
              Luyện phỏng vấn cấp tốc trong 7 ngày, tăng phản xạ và tự tin trước buổi phỏng vấn.
            </p>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>49.000 đ</span>
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
              <span><strong>30 lượt phỏng vấn AI</strong> trong 7 ngày</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Không giới hạn thời lượng mỗi phiên</span>
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
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Mở khóa toàn bộ cấp bậc & câu hỏi phỏng vấn</span>
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
              Rèn luyện chuyên sâu dài hạn, sẵn sàng cho mọi buổi phỏng vấn.
            </p>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>{formattedPrice}</span>
            <span className={styles.pricePeriod}>/ {isYearly ? "năm" : "tháng"}</span>
          </div>
          <div className={styles.priceSubtext}>
            {isYearly
              ? "Tương đương ~74.900 đ/tháng • Tiết kiệm 20%"
              : "Thanh toán linh hoạt theo từng tháng"}
          </div>

          <div className={styles.divider} />

          <div className={styles.featuresTitle}>Toàn bộ đặc quyền Pro:</div>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span><strong>{isYearly ? "1.500 lượt phỏng vấn / năm" : "100 lượt phỏng vấn / tháng"}</strong></span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Không giới hạn thời lượng mỗi phiên</span>
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
              <span>Xuất báo cáo PDF A4 có mã QR bảo chứng</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Lưu trữ toàn bộ lịch sử phỏng vấn</span>
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
            Mọi thắc mắc của bạn về việc đăng ký, cổng thanh toán VNPay và chính sách của Interviewly.
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
          <h3 className={styles.trustTitle}>Cam kết không rủi ro với Interviewly</h3>
          <p className={styles.trustDesc}>
            Thanh toán an toàn 100% qua cổng VNPay với chuẩn mã hóa SSL 256-bit. Đảm bảo hoàn tiền trong 7 ngày nếu không hài lòng.
          </p>
        </div>
        <div className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <ShieldCheck size={20} color="#d98236" />
            <span>{t.pricing.trustVnpay}</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={20} color="#d98236" />
            <span>{t.pricing.trustInstant}</span>
          </div>
          <div className={styles.trustItem}>
            <Award size={20} color="#d98236" />
            <span>{t.pricing.trustRefund}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
