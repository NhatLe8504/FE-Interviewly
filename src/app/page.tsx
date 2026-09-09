import AuroraHero from "@/components/user-component/home/AuroraHero";
import CoachShowcaseSection from "@/components/user-component/home/CoachShowcaseSection";
import ToolsSection from "@/components/user-component/home/ToolsSection";
import StepsSection from "@/components/user-component/home/StepsSection";
import BenefitsSection from "@/components/user-component/home/BenefitsSection";
import FinalCtaSection from "@/components/user-component/home/FinalCtaSection";
import Header from "@/components/user-component/layout/Header";
import styles from "./page.module.css";

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
      <BenefitsSection />

      {/* =====================================================
          SECTION 4: THE COACHING PANEL & DOMAIN INTELLIGENCE
      ====================================================== */}
      <CoachShowcaseSection />

      {/* =====================================================
          SECTION 5: TOOLS
      ====================================================== */}
      <ToolsSection />

      {/* =====================================================
          SECTION 6: STEPS
      ====================================================== */}
      <StepsSection />

      {/* =====================================================
          SECTION 7: FINAL CTA
      ====================================================== */}
      <FinalCtaSection />

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
