"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "./Capabilities.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

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
 * Capabilities — a pinned horizontal-scroll gallery. Vertical scrolling slides a
 * row of 16:9 panels sideways (continuous scrub); the panel nearest centre is
 * "active" and its heading cross-fades in at the top. Placeholder panels for now;
 * swap in real images via each item's `img`. Reduced motion unpins and stacks.
 */
export function Capabilities() {
  const t = useTranslations("Capabilities");
  const items = (t.raw("items") as string[]).map((title, i) => ({
    title,
    n: ITEM_META[i].n,
    img: ITEM_META[i].img,
  }));

  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Small screens and reduced motion use the stacked layout (no horizontal scrub).
    if (
      window.matchMedia("(max-width: 860px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.dataset.reduced = "true";
      return;
    }

    const track = el.querySelector<HTMLElement>("[data-track]");
    const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));
    const titles = Array.from(el.querySelectorAll<HTMLElement>("[data-title]"));
    if (!track || panels.length === 0) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, travel));
      const n = panels.length;
      const activeFloat = p * (n - 1);

      // Slide the track so the active panel sits at the viewport centre.
      const panelW = panels[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = panelW + gap;
      const x = window.innerWidth / 2 - (activeFloat * step + panelW / 2);
      track.style.transform = `translate3d(${x}px, 0, 0)`;

      // Cross-fade the heading of the panel nearest centre.
      titles.forEach((t, i) => {
        const op = easeOut(clamp01((0.6 - Math.abs(activeFloat - i)) / 0.35));
        t.style.opacity = String(op);
        t.style.transform = `translateY(${(1 - op) * 16}px)`;
        t.style.filter = `blur(${(1 - op) * 8}px)`;
      });
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
    <section ref={rootRef} className={styles.section}>
      <div className={styles.sticky}>
        <div className={styles.head}>
          <h2 className={styles.sectionTitle}>
            {t("sectionTitle")}
          </h2>
        </div>

        <div className={styles.titles}>
          {items.map((it) => (
            <p key={it.n} className={styles.title} data-title>
              {it.title}
            </p>
          ))}
        </div>

        <div className={styles.track} data-track>
          {items.map((it) => (
            <article
              key={it.n}
              className={`${styles.panel} ${it.img ? styles.hasImg : ""}`}
              data-panel
              style={it.img ? { backgroundImage: `url("${it.img}")` } : undefined}
            >
              {!it.img && <span className={styles.panelNum}>{it.n}</span>}
              <span className={styles.panelLabel}>{it.title}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
