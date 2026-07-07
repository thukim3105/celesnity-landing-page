"use client";

import styles from "./HeroOutro.module.css";

type HeroScene2Props = {
  shown: boolean;
  line: string;
};

/**
 * Placeholder for Scene 2 ("Installing the hardware…"). Crossfades in when the
 * Scene-1 auto-click completes. Intentionally minimal — real content (the
 * How-it-works integration) is built on top of this later.
 */
export function HeroScene2({ shown, line }: HeroScene2Props) {
  return (
    <div className={`${styles.scene2} ${shown ? styles.scene2Shown : ""}`}>
      <p className={styles.scene2Line}>{line}</p>
    </div>
  );
}
