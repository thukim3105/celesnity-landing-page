"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Pinned line-art backdrop for the hero scroll journey. Scrolling PULLS the
 * scene up: the worm's-eye layer slides up and out the top while the interior
 * layer slides up into view from below, the two meeting at a seam that travels
 * upward (like pulling a filmstrip). The layers tile exactly — no crossfade, no
 * gap. Each layer is a --gradient-brand fill (held at 40% opacity) clipped by an
 * alpha mask baked from the source wireframe art; the backdrop behind is
 * --hero-bg. Scroll drives CSS custom properties via rAF; only transform animates.
 */
export function HeroExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const journey = 1.4 * window.innerHeight;
      const t = clamp01(window.scrollY / journey);
      // Pull the scene up: worm's-eye exits the top, interior enters from below.
      // The seam sits at (1 - t) of the viewport height and travels upward.
      el.style.setProperty("--l1-ty", `${-t * 100}%`);
      el.style.setProperty("--l2-ty", `${(1 - t) * 100}%`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.backdrop} aria-hidden="true">
      <div className={`${styles.layer} ${styles.layer1}`}>
        <div className={`${styles.lineFill} ${styles.lineWorm}`} />
      </div>
      <div className={`${styles.layer} ${styles.layer2}`}>
        <div className={`${styles.lineFill} ${styles.lineInterior}`} />
      </div>
      <div className={styles.scrim} />
    </div>
  );
}
