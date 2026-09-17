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
    question: "Tôi có thể hủy gói đăng ký bất kỳ lúc nào không?",
    answer:
      "Có. Bạn hoàn toàn có thể chủ động hủy gia hạn gói bất cứ lúc nào trong trang Quản lý gói cước (My Subscription). Sau khi hủy, bạn vẫn được sử dụng toàn bộ đặc quyền của gói Pro cho đến hết chu kỳ bạn đã thanh toán.",
  },
  {
    question: "Cổng thanh toán VNPay hỗ trợ những hình thức thanh toán nào?",
    answer:
      "VNPay hỗ trợ quét mã VNPAY-QR trên hơn 30 ứng dụng Mobile Banking và ví điện tử, thẻ ATM/Tài khoản nội địa của 40+ ngân hàng Việt Nam, cùng thẻ thanh toán quốc tế Visa, Mastercard và JCB.",
  },
  {
    question: "Tài khoản của tôi sẽ được nâng cấp Pro sau bao lâu?",
    answer:
      "Hệ thống webhook IPN tự động xác thực và kích hoạt trạng thái Pro cho tài khoản của bạn ngay lập tức (dưới 3 giây) sau khi giao dịch trên cổng thanh toán VNPay thành công.",
  },
  {
    question: "Chính sách hoàn tiền của Interviewly hoạt động như thế nào?",
    answer:
      "Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn đã trải nghiệm dưới 3 lượt phỏng vấn và cảm thấy dịch vụ chưa đáp ứng được nhu cầu của bạn.",
  },
  {
    question: "Tôi có thể tải biên lai / hóa đơn thanh toán ở đâu?",
    answer:
      "Mọi giao dịch thành công đều được lưu trữ minh bạch tại mục Lịch sử thanh toán (/subscription/history). Bạn có thể xem chi tiết và tải hóa đơn điện tử bất kỳ lúc nào.",
  },
];

interface FeatureComparisonGroup {
  category: string;
  features: {
    name: string;
    free: string | boolean;
    pro: string | boolean;
  }[];
}

const COMPARISON_GROUPS: FeatureComparisonGroup[] = [
  {
    category: "Phỏng Vấn & Tương Tác AI",
    features: [
      {
        name: "Số lượt phỏng vấn mỗi tháng",
        free: "3 lượt",
        pro: "Không giới hạn (100 lượt/tháng)",
      },
      {
        name: "Thời lượng mỗi buổi phỏng vấn",
        free: "Tối đa 10 phút",
        pro: "Không giới hạn",
      },
      {
        name: "Câu hỏi thích ứng theo ngữ cảnh (Adaptive AI)",
        free: "1 tầng cơ bản",
        pro: "Đa tầng chuyên sâu theo thời gian thực",
      },
      {
        name: "Tùy chọn cấp bậc phỏng vấn (Junior / Mid / Senior)",
        free: "Chỉ Junior",
        pro: "Toàn bộ cấp bậc (Fresher đến Director)",
      },
    ],
  },
  {
    category: "Phân Tích & Chấm Điểm",
    features: [
      {
        name: "Khung chấm điểm STAR & Rubric 3 tiêu chí",
        free: "Điểm tổng quan",
        pro: "Chấm chi tiết từng câu trả lời",
      },
      {
        name: "Phân tích tốc độ nói (WPM) & độ lưu loát",
        free: false,
        pro: true,
      },
      {
        name: "Phát hiện & đếm từ đệm đa ngữ (ừm, à, basically)",
        free: false,
        pro: true,
      },
      {
        name: "Gợi ý câu trả lời mẫu tối ưu hóa",
        free: false,
        pro: true,
      },
    ],
  },
  {
    category: "Báo Cáo & Chứng Nhận",
    features: [
      {
        name: "Lưu trữ lịch sử các phiên phỏng vấn",
        free: "3 phiên gần nhất",
        pro: "Vĩnh viễn",
      },
      {
        name: "Xuất báo cáo kỹ năng PDF A4 có mã QR bảo chứng",
        free: false,
        pro: true,
      },
      {
        name: "Đồ thị tiến trình phát triển kỹ năng (Skill Matrix)",
        free: false,
        pro: true,
      },
    ],
  },
  {
    category: "Hỗ Trợ & Đặc Quyền",
    features: [
      {
        name: "Kho câu hỏi phỏng vấn thực tế từ Big Tech",
        free: "Cơ bản",
        pro: "Kho độc quyền (Google, Meta, VNG, FPT,...)",
      },
      {
        name: "Hỗ trợ khách hàng",
        free: "Cộng đồng (48h)",
        pro: "Ưu tiên 24/7 qua Chat & Email",
      },
    ],
  },
];

export default function PricingPage() {
  const { locale, t } = useI18n();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
  const proMonthlyPlan = plans.find((p) => p.billing_cycle === "monthly") || DEFAULT_PLANS[1];
  const proYearlyPlan = plans.find((p) => p.billing_cycle === "yearly") || DEFAULT_PLANS[2];
  const activeProPlan = isYearly ? proYearlyPlan : proMonthlyPlan;

  const formattedPrice = isYearly
    ? new Intl.NumberFormat("vi-VN").format(activeProPlan.price) + " đ"
    : new Intl.NumberFormat("vi-VN").format(activeProPlan.price) + " đ";

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
          Đầu tư vào tương lai sự nghiệp với <span className={styles.titleHighlight}>AI Interview Coach</span>
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
              Khám phá và làm quen với hình thức phỏng vấn AI thông minh.
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
              <span><strong>3 lượt phỏng vấn</strong> miễn phí hàng tháng</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Phỏng vấn tối đa <strong>10 phút / phiên</strong></span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Đánh giá năng lực tổng quan theo chuẩn STAR</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Bộ câu hỏi cơ bản cho vị trí Fresher & Junior</span>
            </li>
            <li className={styles.featureItem}>
              <X size={18} className={styles.featureIconCross} />
              <span className={styles.featureTextMuted}>Phân tích giọng nói WPM & phát hiện từ đệm</span>
            </li>
            <li className={styles.featureItem}>
              <X size={18} className={styles.featureIconCross} />
              <span className={styles.featureTextMuted}>Báo cáo kỹ năng PDF A4 có mã QR</span>
            </li>
          </ul>

          <Link href="/practice" className={`${styles.ctaBtn} ${styles.ctaSecondary}`}>
            Bắt đầu miễn phí ngay
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
              Dành cho ứng viên đang tích cực tìm việc và muốn tự tin phỏng vấn ở bất kỳ doanh nghiệp nào.
            </p>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>{formattedPrice}</span>
            <span className={styles.pricePeriod}>/ {isYearly ? "năm" : "tháng"}</span>
          </div>
          <div className={styles.priceSubtext}>
            {isYearly
              ? "Tương đương ~74.900 đ/tháng • Tặng thêm 300 lượt"
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
              <span>Không giới hạn thời lượng mỗi phiên luyện tập</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span><strong>Phân tích giọng nói WPM</strong> & phát hiện từ đệm đa ngữ</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Chấm điểm chi tiết <strong>Rubric 3 tiêu chí</strong> & câu trả lời mẫu</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span><strong>Xuất báo cáo PDF A4</strong> có mã QR chứng nhận năng lực</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Kho câu hỏi phỏng vấn thực tế từ Google, Meta, Shopee, VNG</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.featureIconCheck} />
              <span>Hỗ trợ kỹ thuật ưu tiên 24/7 từ chuyên gia</span>
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

      {/* Feature Comparison Table */}
      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>So sánh chi tiết tính năng</h2>
          <p className={styles.sectionSubtitle}>
            Xem xét sự khác biệt rõ rệt giữa gói Miễn Phí và gói Chuyên Nghiệp để đưa ra quyết định phù hợp nhất.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tính Năng</th>
                <th>Gói Miễn Phí</th>
                <th>Gói Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_GROUPS.map((group) => (
                <tr key={group.category} className={styles.tableCategoryRow}>
                  <td colSpan={3}>{group.category}</td>
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
