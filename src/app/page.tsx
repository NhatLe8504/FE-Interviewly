import {
  ArrowRight,
  BarChart3,
  FileText,
  Languages,
  MessageSquareText,
  Mic2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import AuroraHero from "@/components/user-component/home/AuroraHero";
import CoachShowcaseSection from "@/components/user-component/home/CoachShowcaseSection";
import Header from "@/components/user-component/layout/Header";
import styles from "./page.module.css";

const practiceBenefits = [
  {
    icon: MessageSquareText,
    eyebrow: "Adaptive conversations",
    title: "Questions that follow your answer, not a script.",
    copy: "Choose a role, field, level, and language. Your AI interviewer asks relevant follow-ups so each practice session feels closer to the real thing.",
  },
  {
    icon: Target,
    eyebrow: "Clear feedback",
    title: "Know exactly what to improve next.",
    copy: "Receive a practical rubric for clarity, structure, and evidence - with guidance to make your next response sharper.",
  },
  {
    icon: BarChart3,
    eyebrow: "Visible progress",
    title: "Build confidence session by session.",
    copy: "Keep your history, revisit feedback, and watch your interview skills improve over time instead of starting from scratch.",
  },
];

const coachTools = [
  { icon: Mic2, title: "Voice practice", copy: "Turn a spoken answer into useful coaching on pace and hesitation." },
  { icon: Sparkles, title: "STAR support", copy: "Shape behavioral answers with a clear situation, task, action, and result." },
  { icon: FileText, title: "Session reports", copy: "Leave each practice with a focused PDF report you can return to." },
  { icon: Languages, title: "Vietnamese & English", copy: "Practice in the language that helps you prepare with confidence." },
];

const steps = [
  ["01", "Set your interview", "Select the role, field, experience level, and language you want to practice."],
  ["02", "Have the conversation", "Respond naturally while the interviewer adapts its next question to you."],
  ["03", "Use the feedback", "Review your rubric, practical suggestions, and a plan for the next session."],
];

export default function HomePage() {
  return (
    <main className={styles.page} id="main-content">
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      {/* =====================================================
          GLOBAL FLOATING HEADER (Z-INDEX 99,999,999)
      ====================================================== */}
      <Header />

      {/* =====================================================
          HEAD / HERO: SCULPTED LIQUID GLASS HERO
      ====================================================== */}
      <AuroraHero />

      {/* =====================================================
          SECTION 2: INTRO PROMISE BAND
      ====================================================== */}
      <section className={styles.introBand} aria-label="Interview practice promise">
        <p>Less second-guessing. More deliberate practice.</p>
        <span>Built for job seekers preparing for the moments that matter.</span>
      </section>

      {/* =====================================================
          SECTION 3: PRACTICE BENEFITS
      ====================================================== */}
      <section className={styles.benefits} id="practice">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}><span /> Practice with intention</p>
          <h2>More than a list of questions.</h2>
          <p>Interviewly gives you a structured practice loop that feels personal, useful, and easy to return to.</p>
        </div>
        <div className={styles.benefitGrid}>
          {practiceBenefits.map(({ icon: Icon, eyebrow, title, copy }, index) => (
            <article className={styles.benefitCard} key={title}>
              <span className={styles.cardNumber}>0{index + 1}</span>
              <span className={styles.featureIcon}><Icon size={22} strokeWidth={1.8} /></span>
              <p>{eyebrow}</p>
              <h3>{title}</h3>
              <span className={styles.cardRule} />
              <span className={styles.cardCopy}>{copy}</span>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          SECTION 4: THE COACHING PANEL & DOMAIN INTELLIGENCE
      ====================================================== */}
      <CoachShowcaseSection />

      {/* =====================================================
          SECTION 5: TOOLS
      ====================================================== */}
      <section className={styles.toolsSection} id="tools">
        <div className={styles.toolsHeader}>
          <div>
            <p className={styles.eyebrow}><span /> Designed around your growth</p>
            <h2>Practice in the way that works for you.</h2>
          </div>
          <p>Every tool supports one goal: helping you deliver stronger, clearer answers when it is time to interview.</p>
        </div>
        <div className={styles.toolGrid}>
          {coachTools.map(({ icon: Icon, title, copy }) => (
            <article className={styles.toolCard} key={title}>
              <span><Icon size={21} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          SECTION 6: STEPS
      ====================================================== */}
      <section className={styles.stepsSection} id="steps">
        <div className={styles.stepsIntro}>
          <p className={styles.eyebrow}><span /> Your next practice</p>
          <h2>Ready when you are.</h2>
          <p>No performance pressure. Just a repeatable routine that makes the real conversation feel more familiar.</p>
        </div>
        <ol className={styles.steps}>
          {steps.map(([number, title, copy]) => (
            <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
          ))}
        </ol>
      </section>

      {/* =====================================================
          SECTION 7: FINAL CTA
      ====================================================== */}
      <section className={styles.finalCta}>
        <ShieldCheck size={28} strokeWidth={1.8} aria-hidden="true" />
        <p className={styles.eyebrow}><span /> A more prepared you</p>
        <h2>Your next interview deserves more than a guess.</h2>
        <a className={styles.primaryButton} href="#practice">Begin your practice <ArrowRight size={18} aria-hidden="true" /></a>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark}>✦</span>
          <span>interviewly</span>
        </a>
        <p>AI-powered interview practice for thoughtful preparation.</p>
        <span>© 2026 Interviewly</span>
      </footer>
    </main>
  );
}
