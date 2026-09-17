"use client";

import AuroraHero from "@/components/user-component/home/AuroraHero";
import CoachShowcaseSection from "@/components/user-component/home/CoachShowcaseSection";
import ToolsSection from "@/components/user-component/home/ToolsSection";
import StepsSection from "@/components/user-component/home/StepsSection";
import BenefitsSection from "@/components/user-component/home/BenefitsSection";
import FinalCtaSection from "@/components/user-component/home/FinalCtaSection";
import { useI18n } from "@/context/I18nContext";
import styles from "./page.module.css";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className={styles.page} id="main-content">
      <a className={styles.skipLink} href="#main-content">
        {t.home.skipToContent}
      </a>
      <AuroraHero />

      <section className={styles.introBand} aria-label="Interview practice promise">
        <p>{t.home.introBand.title}</p>
        <span>{t.home.introBand.subtitle}</span>
      </section>

      <BenefitsSection />
      <CoachShowcaseSection />
      <ToolsSection />
      <StepsSection />
      <FinalCtaSection />
    </main>
  );
}
