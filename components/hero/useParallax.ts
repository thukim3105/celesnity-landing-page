"use client";

import { useEffect, type RefObject } from "react";

/**
 * Mouse-look parallax. Tracks the pointer across the viewport and writes
 * smoothed, normalized offsets (-1..1) as CSS custom properties (--px, --py)
 * onto `ref`. Child layers translate by these vars scaled to their own depth,
 * so the scene appears to "look around" as the cursor moves. A rAF lerp keeps
 * the motion calm (no jitter). No-op on touch pointers and reduced-motion.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1; // -1 (left) .. 1 (right)
      targetY = (e.clientY / window.innerHeight) * 2 - 1; // -1 (top)  .. 1 (bottom)
    };

    const loop = () => {
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      el.style.setProperty("--px", curX.toFixed(4));
      el.style.setProperty("--py", curY.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
  }, [ref, enabled]);
}
