import styles from "./AuroraBackground.module.css";

/**
 * Reusable Brand-Kit "Cover" aurora background — the same treatment the CTA uses,
 * shared across the content sections (Hero excepted). It absolutely fills its
 * host, sitting behind the host's content (z-index -1), so the host only needs
 * `position: relative; isolation: isolate;` and nothing else changes.
 *
 * Dark (Cosmos): cosmic-black base + three blurred, rotated nebula streaks +
 * vignette. Light (Daybreak): cloud-white base with two soft diagonal tints
 * (streaks/vignette hidden). The whole layer fades in/out at the top and bottom
 * so adjacent sections blend into the continuous page background — no seams.
 */
export function AuroraBackground({ opacity = 0.4 }: { opacity?: number }) {
  return (
    <div className={styles.bg} style={{ opacity }} aria-hidden="true">
      <div className={styles.bgBase} />
      <div className={styles.streaks}>
        <div className={styles.streak1} />
        <div className={styles.streak2} />
        <div className={styles.streak3} />
      </div>
      <div className={styles.vignette} />
    </div>
  );
}
