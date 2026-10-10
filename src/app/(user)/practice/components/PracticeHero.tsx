import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import styles from "./practiceHero.module.css";

export function PracticeHero() {
  return (
    <section className={styles.hero} aria-labelledby="practice-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>LUYỆN TẬP PHỎNG VẤN</p>
        <h1 id="practice-title">Chuẩn bị hôm nay.<br /><em>Tự tin ngày mai.</em></h1>
        <p className={styles.intro}>
          Mang vị trí bạn đang ứng tuyển vào một buổi luyện cùng AI.
          Tập nói, thử trả lời và tìm cách diễn đạt tốt hơn — theo nhịp của bạn.
        </p>
        <div className={styles.actions}>
          <Button asChild variant="home-primary"><Link href="/practice/new">Tạo buổi luyện theo JD</Link></Button>
          <Button asChild variant="home-secondary"><Link href="#practice-sessions">Xem buổi đã tạo</Link></Button>
        </div>
      </div>
      <aside className={styles.guide} aria-label="Cách bắt đầu luyện tập">
        <p className={styles.guideLabel}>BẮT ĐẦU RẤT ĐƠN GIẢN</p>
        <ol className={styles.steps}>
          <li><span className={styles.stepNumber}>01</span><div><h2>Thêm mô tả công việc</h2><p>Nội dung luyện tập bắt đầu từ JD của vị trí bạn muốn ứng tuyển.</p></div></li>
          <li><span className={styles.stepNumber}>02</span><div><h2>Vào phòng, chọn cách trả lời</h2><p>Chọn ngôn ngữ, nói hoặc nhập văn bản theo hoàn cảnh.</p></div></li>
          <li><span className={styles.stepNumber}>03</span><div><h2>Luyện, rồi nhìn lại</h2><p>Đọc phản hồi sau buổi phỏng vấn để biết mình cần cải thiện điều gì.</p></div></li>
        </ol>
      </aside>
      <div className={styles.mascotOnLine}>
        <PageMascot size={68} />
      </div>
    </section>
  );
}
