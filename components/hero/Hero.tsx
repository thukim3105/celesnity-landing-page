import styles from "./Hero.module.css";

/**
 * Minder AI hero content — heading + lede + primary CTA, centered over the
 * pinned line-art factory backdrop (rendered separately by <HeroExperience/>).
 * As the user scrolls, this section scrolls away while the backdrop crossfades
 * from the worm's-eye view into the factory interior.
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
