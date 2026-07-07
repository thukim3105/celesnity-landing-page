"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Capabilities.module.css";

const AUTO_MS = 3000; // time on each image before advancing
const SLIDE_MS = 700; // must match the .track / .panel transition in the CSS

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
 * and enlarged; every 2s it advances to the next, looping. Hovering pauses it;
 * clicking a panel (or a dot) jumps to it and restarts the 2s timer. Reduced
 * motion stops the auto-play and leaves it click/keyboard driven.
 */
export function Capabilities() {
  const t = useTranslations("Capabilities");
  const items = (t.raw("items") as string[]).map((title, i) => ({
    title,
    n: ITEM_META[i].n,
    img: ITEM_META[i].img,
  }));
  const n = items.length;

  // active runs 0..n; index n is a clone of the first image, so advancing off
  // the end slides forward onto it and then snaps back invisibly (seamless loop).
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [noAnim, setNoAnim] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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
      track.style.transition = noAnim ? "none" : "";
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, noAnim, n]);

  // Auto-advance; any active change (including a click) restarts the timer.
  // Stops at the clone (n) — the loop effect below takes over there.
  useEffect(() => {
    if (reduced || paused || active >= n) return;
    const id = window.setTimeout(() => setActive((a) => a + 1), AUTO_MS);
    return () => clearTimeout(id);
  }, [active, paused, reduced, n]);

  // Seamless loop: once the slide onto the clone finishes, jump back to the
  // real first image with the transition off (invisible, since they're identical).
  useEffect(() => {
    if (active !== n) return;
    const id = window.setTimeout(() => {
      setNoAnim(true);
      setActive(0);
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, n]);

  // Re-enable the slide a frame after the instant snap.
  useEffect(() => {
    if (!noAnim) return;
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setNoAnim(false)),
    );
    return () => cancelAnimationFrame(r);
  }, [noAnim]);

  const go = (i: number) => {
    // If we're on the clone (mid-loop) it's visually the first image, so jump
    // instantly rather than sliding all the way back; otherwise animate.
    if (activeRef.current === n) {
      setNoAnim(true);
      setActive(i);
      return;
    }
    setNoAnim(false);
    setActive(i);
  };

  return (
    <section
      className={styles.section}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.head}>
        <h2 className={styles.sectionTitle}>{t("sectionTitle")}</h2>
      </div>

      <div className={styles.viewport}>
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
              onClick={() => go(i)}
              aria-label={it.title}
              aria-current={i === active}
            >
              {!it.img && <span className={styles.panelNum}>{it.n}</span>}
            </button>
          ))}
          {/* Clone of the first image so the last→first loop slides forward.
              Hidden unless it's the active (loop) frame, so it doesn't peek as a
              neighbour after the last image. */}
          <div
            className={`${styles.panel} ${styles.clone} ${items[0].img ? styles.hasImg : ""}`}
            data-panel
            data-active={active === n}
            aria-hidden="true"
            style={
              items[0].img
                ? { backgroundImage: `url("${items[0].img}")` }
                : undefined
            }
          />
        </div>
      </div>

      <p key={active} className={styles.activeTitle}>
        {items[active % n].title}
      </p>

      <div className={styles.dots}>
        {items.map((it, i) => (
          <button
            key={it.n}
            type="button"
            className={styles.dot}
            data-active={active % n === i}
            onClick={() => go(i)}
            aria-label={it.title}
          />
        ))}
      </div>
    </section>
  );
}
