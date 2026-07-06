import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { HeroExperience } from "./HeroExperience";
import styles from "./Hero.module.css";

/**
 * Minder AI hero content — heading + lede + primary CTA, centered over the
 * static inside-factory line-art backdrop (<HeroExperience/>). The backdrop
 * lives inside the section, so it scrolls away together with the content.
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  return (
    <section className={styles.hero} data-hero>
      <HeroExperience />
      <div className={styles.overlay}>
        <Reveal>
          <h1 className={styles.heading}>{t("heading")}</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className={styles.lead}>
            {t("leadLine1")}
            <br />
            {t("leadLine2")}
          </p>
        </Reveal>
        
      </div>
    </section>
  );
}
