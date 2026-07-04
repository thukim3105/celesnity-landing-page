import styles from "./Hero.module.css";

/**
 * Line-art backdrop for the hero: a single static inside-factory scene. It fills
 * the hero section (absolutely) and scrolls away together with the content.
 * A --gradient-brand fill (held at 40% opacity) clipped by the baked alpha mask;
 * the backdrop behind is --hero-bg. Both flip with the DS theme.
 */
export function HeroExperience() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.layer}>
        <div className={`${styles.lineFill} ${styles.lineInterior}`} />
      </div>
      <div className={styles.scrim} />
    </div>
  );
}
