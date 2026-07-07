"use client";

import { useEffect, useRef } from "react";
import { SECONDS, formatDuration } from "./wasteCounter.mjs";
import styles from "./WasteCounter.module.css";

type WasteCounterProps = {
  visibleCount: number; // 0..SECONDS.length-1, from HeroReveal
  eyebrow: string;
  caption: string;
};

const DURATION_MS = 450;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * "Data-entry time" counter: climbs as carton labels reveal, dramatising the
 * time manual data entry wastes. Reads `visibleCount` (same signal as the
 * labels) and counts up to SECONDS[visibleCount]. Decorative (aria-hidden).
 */
export function WasteCounter({
  visibleCount,
  eyebrow,
  caption,
}: WasteCounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const target = SECONDS[Math.min(visibleCount, SECONDS.length - 1)];
    const from = fromRef.current;
    const el = numRef.current;
    if (!el) {
      fromRef.current = target;
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || from === target) {
      el.textContent = formatDuration(target);
      fromRef.current = target;
      return;
    }

    let start = 0;
    cancelAnimationFrame(rafRef.current);
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / DURATION_MS);
      el.textContent = formatDuration(from + (target - from) * easeOut(p));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visibleCount]);

  return (
    <div
      className={`${styles.card} ${visibleCount >= 1 ? styles.shown : ""}`}
      aria-hidden="true"
    >
      <span className={styles.eyebrow}>{eyebrow}</span>
      <span className={styles.value} ref={numRef}>
        0:00
      </span>
      <span className={styles.caption}>{caption}</span>
    </div>
  );
}
