import { Reveal } from "@/components/motion/Reveal";
import { HeroExperience } from "./HeroExperience";
import styles from "./Hero.module.css";

/**
 * Minder AI hero content — heading + lede + primary CTA, centered over the
 * static inside-factory line-art backdrop (<HeroExperience/>). The backdrop
 * lives inside the section, so it scrolls away together with the content.
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <HeroExperience />
      <div className={styles.overlay}>
        <Reveal>
          <h1 className={styles.heading}>Minder AI</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className={styles.lead}>
            Increase workforce productivity, capture every action as data, and make
            operations instantly searchable.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className={styles.actions}>
            <a className={styles.cta} href="#">
              Get started
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
