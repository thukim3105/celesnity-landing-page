import styles from "./Header.module.css";

/**
 * Celesnity logo lockup (orbit mark + wordmark), reproducing the design
 * system's `Logo` lockup with the DS PNG marks (copied to /public/brand).
 * Both marks render; CSS shows the white mark on Cosmos and the ink mark on
 * Daybreak based on [data-theme], so the markup is theme-independent (no
 * hydration mismatch, instant flip). Wordmark color follows --text-primary.
 */
export function Logo({ size = 28 }: { size?: number }) {
  const markSize = Math.round(size * 1.4);
  return (
    <span className={styles.logo} aria-label="Celesnity" role="img">
      <span className={styles.logoMarks} style={{ width: markSize, height: markSize }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.markDark}
          src="/brand/logo-mark-white.png"
          alt=""
          width={markSize}
          height={markSize}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.markLight}
          src="/brand/logo-mark-ink.png"
          alt=""
          width={markSize}
          height={markSize}
        />
      </span>
      <span className={styles.logoWord} style={{ fontSize: Math.round(size * 0.72) }}>
        Celesnity
      </span>
    </span>
  );
}
