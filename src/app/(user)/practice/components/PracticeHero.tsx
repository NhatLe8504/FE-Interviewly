import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, FileText, Keyboard, Mic, Sparkles } from "lucide-react";
import styles from "./practiceHero.module.css";

const WAVE_HEIGHTS = [10, 18, 30, 22, 38, 26, 44, 32, 48, 34, 24, 40, 28, 18, 30, 16, 10];

export function PracticeHero() {
  return (
    <section className={styles.hero} aria-labelledby="practice-title">
      <div className={styles.copy}>
        <div className={styles.eyebrow}><span />KHÔNG GIAN LUYỆN TẬP CỦA BẠN</div>
        <h1 id="practice-title">Tự tin hơn,<br /><em>qua mỗi lần luyện.</em></h1>
        <p>Chọn một tình huống để bắt đầu, hoặc mang công việc bạn đang ứng tuyển vào buổi phỏng vấn riêng cùng AI.</p>
        <div className={styles.actions}>
          <Link href="/practice/new" className={styles.primaryAction}>Tạo buổi luyện theo JD<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link href="#interview-library" className={styles.secondaryAction}>Khám phá thư viện<ArrowDown size={17} aria-hidden="true" /></Link>
        </div>
        <div className={styles.formats}>
          <span><Mic size={15} aria-hidden="true" />Nói chuyện với AI</span>
          <span className={styles.separator} aria-hidden="true" />
          <span><Keyboard size={15} aria-hidden="true" />Hoặc trả lời bằng văn bản</span>
        </div>
      </div>

      <div className={styles.scene} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.backSheet} />
        <div className={styles.interviewSheet}>
          <div className={styles.sheetHeader}><span className={styles.sheetBrand}>interviewly<span>.</span></span><Sparkles size={17} /></div>
          <span className={styles.sheetEyebrow}>YOUR NEXT CHAPTER</span>
          <h2>Buổi phỏng vấn<br />dành riêng cho bạn.</h2>
          <div className={styles.roleLine}><span>SE</span><div><strong>Software Engineer</strong><small>Câu hỏi theo vị trí bạn chọn</small></div></div>
          <div className={styles.voicePreview}>
            <span className={styles.micCircle}><Mic size={18} /></span>
            <div className={styles.waveform}>{WAVE_HEIGHTS.map((height, index) => <span key={index} style={{ height }} />)}</div>
            <span className={styles.voiceLabel}>VOICE</span>
          </div>
          <div className={styles.sheetFooter}><Check size={14} />Theo nhịp của bạn. Không vội vàng.</div>
        </div>
        <div className={styles.jdNote}><span><FileText size={19} /></span><div><strong>Bắt đầu từ JD của bạn</strong><small>Đúng vị trí. Đúng trọng tâm.</small></div></div>
        <div className={styles.readyNote}><span><Check size={14} /></span>Chuẩn bị hôm nay. Tự tin ngày mai.</div>
      </div>
    </section>
  );
}
