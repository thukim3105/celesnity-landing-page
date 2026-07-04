import styles from "./Hero.module.css";

/**
 * Minder AI hero content — heading + lede + primary CTA, centered over the
 * pinned static inside-factory line-art backdrop (rendered separately by
 * <HeroExperience/>).
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}>
        <h1 className={styles.heading}>Minder AI</h1>
        <p className={styles.lead}>
          Increase workforce productivity, capture every action as data, and make
          operations instantly searchable.
        </p>
        <div className={styles.actions}>
          <a className={styles.cta} href="#">
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
