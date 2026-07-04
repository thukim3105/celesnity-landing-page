"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// easeOutQuad — decelerating arrival for the interior "fly in".
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

/**
 * Pinned line-art backdrop for the hero scroll journey. As the page scrolls the
 * worm's-eye layer zooms forward and fades out (flying past the camera) while
 * the interior layer FLIES IN from below-and-back, decelerating to rest.
 * Each layer is a --gradient-brand fill (held at 40% opacity) clipped by an
 * alpha mask baked from the source wireframe art; the backdrop behind is
 * --hero-bg. Scroll drives CSS custom properties via rAF; only opacity +
 * transform animate.
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
      // Worm's-eye: zoom forward + drift up while fading (flies past the camera).
      el.style.setProperty("--l1-op", String(clamp01(1 - t / 0.55)));
      el.style.setProperty("--l1-sc", String(1 + t * 0.28));
      el.style.setProperty("--l1-ty", `${-t * 5}%`);
      // Interior: flies in from below-and-back, decelerating to rest (ease-out).
      const p2 = easeOut(clamp01((t - 0.15) / 0.5));
      el.style.setProperty("--l2-op", String(p2));
      el.style.setProperty("--l2-sc", String(1.22 - p2 * 0.22));
      el.style.setProperty("--l2-ty", `${(1 - p2) * 10}%`);
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
