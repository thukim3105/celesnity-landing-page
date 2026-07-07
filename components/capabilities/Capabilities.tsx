"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Capabilities.module.css";

const AUTO_MS = 3000; // time on each image before advancing

type ItemMeta = { n: string; img?: string };

const ITEM_META: ItemMeta[] = [
  { n: "01", img: "/capabilities/onboard-new-hires.png" },
  { n: "02", img: "/capabilities/catch-errors.png" },
  { n: "03", img: "/capabilities/capture-data.png" },
  { n: "04", img: "/capabilities/reporting.png" },
  { n: "05", img: "/capabilities/scheduling.png" },
  { n: "06", img: "/capabilities/ask-anything.png" },
];

/**
 * Capabilities — an auto-advancing image carousel. The active panel is centred
 * and enlarged; every few seconds it advances to the next, and after the last it
 * rewinds smoothly back to the first. Hovering the images pauses it; clicking a
 * panel or dot jumps to it. Reduced motion stops the auto-play (click/keys only).
 */
export function Capabilities() {
  const t = useTranslations("Capabilities");
  const items = (t.raw("items") as string[]).map((title, i) => ({
    title,
    n: ITEM_META[i].n,
    img: ITEM_META[i].img,
  }));
  const n = items.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Slide the track so the active panel sits at the viewport centre.
  useEffect(() => {
    const track = trackRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport) return;
    const place = () => {
      const panels = Array.from(
        track.querySelectorAll<HTMLElement>("[data-panel]"),
      );
      if (panels.length === 0) return;
      const panelW = panels[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = panelW + gap;
      const x = viewport.clientWidth / 2 - (active * step + panelW / 2);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, n]);

  // Auto-advance; after the last image it wraps back to the first (rewinds).
  // Any active change (including a click) restarts the timer.
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % n), AUTO_MS);
    return () => clearTimeout(id);
  }, [active, paused, reduced, n]);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.sectionTitle}>{t("sectionTitle")}</h2>
      </div>

      <p key={active} className={styles.activeTitle}>
        {items[active].title}
      </p>

      <div
        className={styles.viewport}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={styles.track} ref={trackRef}>
          {items.map((it, i) => (
            <button
              key={it.n}
              type="button"
              className={`${styles.panel} ${it.img ? styles.hasImg : ""}`}
              data-panel
              data-active={i === active}
              style={
                it.img ? { backgroundImage: `url("${it.img}")` } : undefined
              }
              onClick={() => setActive(i)}
              aria-label={it.title}
              aria-current={i === active}
            >
              {!it.img && <span className={styles.panelNum}>{it.n}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dots}>
        {items.map((it, i) => (
          <button
            key={it.n}
            type="button"
            className={styles.dot}
            data-active={i === active}
            onClick={() => setActive(i)}
            aria-label={it.title}
          />
        ))}
      </div>
    </section>
  );
}
