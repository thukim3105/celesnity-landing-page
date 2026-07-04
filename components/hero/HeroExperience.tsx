"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Pinned line-art backdrop for the hero scroll journey. Two theme-flexible
 * layers: `worm's-eye` crossfades/zooms into `interior` as the page scrolls.
 * Each layer is a solid --hero-line fill clipped by an alpha mask baked from
 * the source wireframe art; the backdrop behind is --hero-bg. Scroll drives CSS
 * custom properties via rAF; only opacity + transform animate.
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
      el.style.setProperty("--l1-op", String(clamp01(1 - t / 0.6)));
      el.style.setProperty("--l1-sc", String(1 + t * 0.18));
      el.style.setProperty("--l2-op", String(clamp01((t - 0.22) / 0.55)));
      el.style.setProperty("--l2-sc", String(1.14 - t * 0.14));
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
