"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Inertia (smooth) scrolling for the whole page via Lenis. Lenis smooths native
 * window scrolling, so `window.scrollY` and scroll events still drive the
 * scroll-tied backdrops/sections. Disabled under prefers-reduced-motion. On a
 * route change it jumps to the top instantly so the new page doesn't lurch.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    if (!reduced) {
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Scroll lock, driven by the hero scene sequence: while locked the page can't
    // reach the next section. Uses Lenis when present, else a plain overflow lock.
    const lock = () => {
      if (lenisRef.current) lenisRef.current.stop();
      else document.documentElement.style.overflow = "hidden";
    };
    const unlock = () => {
      if (lenisRef.current) lenisRef.current.start();
      else document.documentElement.style.overflow = "";
    };
    const scrollTo = (e: Event) => {
      const target = (e as CustomEvent<number | string>).detail;
      if (target == null) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target as number, { duration: 1.1 });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("hero:lock", lock);
    window.addEventListener("hero:unlock", unlock);
    window.addEventListener("hero:scrollto", scrollTo);

    return () => {
      window.removeEventListener("hero:lock", lock);
      window.removeEventListener("hero:unlock", unlock);
      window.removeEventListener("hero:scrollto", scrollTo);
      if (raf) cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
