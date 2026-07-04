import styles from "./Hero.module.css";

/**
 * Pinned line-art backdrop for the hero: a single static inside-factory scene.
 * A --gradient-brand fill (held at 70% opacity) clipped by the baked alpha mask;
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
