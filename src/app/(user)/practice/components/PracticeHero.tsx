import Link from "next/link";
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
          <Link href="/practice/new" className={styles.primaryAction}>Tạo buổi luyện theo JD</Link>
          <Link href="#practice-sessions" className={styles.secondaryAction}>Xem buổi đã tạo</Link>
        </div>
      </div>
      <aside className={styles.guide} aria-label="Cách bắt đầu luyện tập">
        <p className={styles.guideLabel}>BẮT ĐẦU RẤT ĐƠN GIẢN</p>
        <ol className={styles.steps}>
          <li><span className={styles.stepNumber}>01</span><div><h2>Thêm mô tả công việc</h2><p>Nội dung luyện tập bắt đầu từ JD của vị trí bạn muốn ứng tuyển.</p></div></li>
          <li><span className={styles.stepNumber}>02</span><div><h2>Chọn cách bạn muốn luyện</h2><p>Trò chuyện bằng giọng nói hoặc trả lời bằng văn bản.</p></div></li>
          <li><span className={styles.stepNumber}>03</span><div><h2>Luyện, rồi nhìn lại</h2><p>Đọc phản hồi sau buổi phỏng vấn để biết mình cần cải thiện điều gì.</p></div></li>
        </ol>
      </aside>
    </section>
  );
}
