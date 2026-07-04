"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertia (smooth) scrolling for the whole page via Lenis. Lenis smooths native
 * window scrolling, so `window.scrollY` and scroll events still drive the
 * scroll-tied backdrops/sections. Disabled under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
