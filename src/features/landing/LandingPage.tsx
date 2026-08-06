import { setRequestLocale } from "next-intl/server";
import { HeroScroll } from "@/features/hero/HeroScroll";
import { Navbar } from "@/features/navigation/Navbar";
import { OperationsNetwork } from "@/components/operations/OperationsNetwork";
import { PlanningSection } from "@/components/planning/PlanningSection";
import { DevicesCarousel } from "@/components/devices/DevicesCarousel";
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
        <OperationsNetwork />
      </div>
      <div className={styles.anchor} id="section-3">
        <PlanningSection />
      </div>
      <div className={styles.anchor} id="section-4">
        <DevicesCarousel />
      </div>
      <div className={styles.anchor} id="section-5">
        <CTA />
      </div>
      <div className={styles.anchor} id="section-6">
        <Footer />
      </div>
    </main>
  );
}
