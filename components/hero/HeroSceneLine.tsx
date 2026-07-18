"use client";

import styles from "./HeroOutro.module.css";

type HeroSceneLineProps = {
  shown: boolean;
  line: string;
};

/**
 * A full-stage status line (e.g. "Installing the hardware…", "Configuring…").
 * Crossfades in when `shown`. Placeholder scenes the user grows later.
 */
export function HeroSceneLine({ shown, line }: HeroSceneLineProps) {
  return (
    <div className={`${styles.scene2} ${shown ? styles.scene2Shown : ""}`}>
      <p className={styles.scene2Line}>{line}</p>
    </div>
  );
}
