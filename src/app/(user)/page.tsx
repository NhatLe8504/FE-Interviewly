import AuroraHero from "@/components/user-component/home/AuroraHero";
import CoachShowcaseSection from "@/components/user-component/home/CoachShowcaseSection";
import ToolsSection from "@/components/user-component/home/ToolsSection";
import StepsSection from "@/components/user-component/home/StepsSection";
import BenefitsSection from "@/components/user-component/home/BenefitsSection";
import FinalCtaSection from "@/components/user-component/home/FinalCtaSection";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page} id="main-content">
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <AuroraHero />

      <section className={styles.introBand} aria-label="Interview practice promise">
        <p>Less second-guessing. More deliberate practice.</p>
        <span>Built for job seekers preparing for the moments that matter.</span>
      </section>

      <BenefitsSection />
      <CoachShowcaseSection />
      <ToolsSection />
      <StepsSection />
      <FinalCtaSection />
    </main>
  );
}
