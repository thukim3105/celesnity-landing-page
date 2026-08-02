import { setRequestLocale } from "next-intl/server";
import { HeroScroll } from "@/features/hero/HeroScroll";
import { Navbar } from "@/features/navigation/Navbar";
import { HowItWorks } from "@/components/steps/HowItWorks";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { CTA } from "@/components/cta/CTA";
import { Footer } from "@/components/layout/Footer";
import styles from "./LandingPage.module.css";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navbar />
      <div className={styles.anchor} id="section-1">
        <HeroScroll />
      </div>
      <div className={styles.anchor} id="section-2">
        <HowItWorks />
      </div>
      <div className={styles.anchor} id="section-3">
        <Capabilities />
      </div>
      <div className={styles.anchor} id="section-4">
        <CTA />
      </div>
      <div className={styles.anchor} id="section-6">
        <Footer />
      </div>
    </main>
  );
}
