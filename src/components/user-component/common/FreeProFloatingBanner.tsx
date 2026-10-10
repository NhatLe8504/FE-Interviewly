"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import styles from "./FreeProFloatingBanner.module.css";

// CHỈ hiển thị trên 4 trang chính:
// 1. Giả lập phỏng vấn: /practice
// 2. Tìm việc: /jobs
// 3. Ngân hàng câu hỏi: /questions
// 4. Khóa học: /courses
// TUYỆT ĐỐI KHÔNG hiển thị trên trang Home (/) hay bất kỳ trang con nào (/practice/..., /jobs/..., /questions/..., /courses/...)
const ALLOWED_MAIN_PATHS = new Set([
  "/practice",
  "/jobs",
  "/questions",
  "/courses",
]);

export function FreeProFloatingBanner() {
  const pathname = usePathname();
  const { isSubscribed } = useUserSubscription();

  // 1. Chỉ áp dụng cho các trang chính được chỉ định
  if (!pathname || !ALLOWED_MAIN_PATHS.has(pathname)) {
    return null;
  }

  // 2. Luôn luôn hiển thị cho tài khoản Free (khi đã là Pro thì không hiển thị)
  if (isSubscribed) {
    return null;
  }

  return (
    <aside
      className={styles.bannerContainer}
      aria-label="Nâng cấp tài khoản Interviewly Pro"
    >
      <Link
        href="/subscription/checkout"
        className={styles.bannerLink}
        title="Nâng cấp gói đăng ký để tăng trải nghiệm của bạn"
      >
        <div className={styles.imageWrapper}>
          <Image
            src="/images/panel_subcription/pannel.png"
            alt="Nâng cấp gói đăng ký Interviewly Pro"
            width={280}
            height={187}
            priority
            className={styles.bannerImg}
          />
        </div>
      </Link>
    </aside>
  );
}
