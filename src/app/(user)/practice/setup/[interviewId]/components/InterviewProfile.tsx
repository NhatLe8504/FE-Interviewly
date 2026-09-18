import type { CSSProperties } from "react";
import { Award, Building2, Clock, Layers, Sparkles, Star, User } from "lucide-react";
import type { PreMadeInterview } from "@/data/mockInterviews";
import styles from "../setup.module.css";

interface InterviewProfileProps {
  interview: PreMadeInterview;
}

export function InterviewProfile({ interview }: InterviewProfileProps) {
  const stats = [
    { Icon: Clock, label: interview.durationMinutes + " phút", detail: "Thời lượng" },
    { Icon: Layers, label: interview.questionsCount + " câu", detail: "Catalog gợi ý" },
    { Icon: User, label: interview.candidatesPracticed, detail: "Đã luyện tập" },
    { Icon: Award, label: interview.reviewsCount + " đánh giá", detail: "Cộng đồng" },
  ];

  return (
    <section className={styles.profileColumn} aria-labelledby="interview-title">
      <header
        className={styles.profileHero}
        style={{ "--profile-image": "url(" + interview.imageUrl + ")" } as CSSProperties}
      >
        <div className={styles.profileOverlay}>
          <div className={styles.heroMeta}>
            <span>{interview.levelLabel}</span>
            <strong>
              <Star size={13} fill="currentColor" aria-hidden="true" />
              {interview.rating}
            </strong>
          </div>
          <h1 id="interview-title">{interview.title}</h1>
          <p>
            <Building2 size={13} aria-hidden="true" />
            {interview.company} · {interview.domain}
          </p>
        </div>
      </header>

      <dl className={styles.statsGrid}>
        {stats.map(({ Icon, label, detail }) => (
          <div key={detail}>
            <Icon size={17} aria-hidden="true" />
            <dt>{detail}</dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>

      <blockquote className={styles.testimonial}>
        <p>&ldquo;{interview.testimonial.quote}&rdquo;</p>
        <footer>
          <Award size={14} aria-hidden="true" />
          {interview.testimonial.author} ({interview.testimonial.role})
        </footer>
      </blockquote>

      <section className={styles.topicSection} aria-labelledby="topic-heading">
        <h2 id="topic-heading">Chủ đề phỏng vấn</h2>
        <div>
          {interview.topics.map((topic) => <span key={topic}>{topic}</span>)}
        </div>
      </section>

      <aside className={styles.catalogNotice}>
        <Sparkles size={17} aria-hidden="true" />
        <p>
          Khi chọn nguồn <strong>Tự chọn</strong> hoặc <strong>Kết hợp</strong>, hệ thống chỉ dùng
          câu hỏi đã duyệt từ Question Bank.
        </p>
      </aside>
    </section>
  );
}
