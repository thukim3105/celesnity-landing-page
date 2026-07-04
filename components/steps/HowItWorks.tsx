"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./HowItWorks.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

type Step = { n: string; title: string; points: string[] };

const STEPS: Step[] = [
  {
    n: "01",
    title: "Install the Hardware",
    points: [
      "Set up Minder AI in the work area",
      "Two Celesnity engineers deploy and configure the system on-site",
      "Gather factory-specific operational information",
    ],
  },
  {
    n: "02",
    title: "Configure the Software",
    points: [
      "Connect Minder AI to existing processes",
      "Define user roles and permissions",
      "Customize terminology, workflows, and operational stages",
    ],
  },
  {
    n: "03",
    title: "Start Using Minder AI",
    points: [
      "Workers log in and interact using voice commands",
      "AI supports daily operations immediately",
      "Continuous learning and optimization from usage",
    ],
  },
];

/**
 * "How it works" — a pinned section whose heading stays fixed on the left while
 * the three steps reveal on the right, one at a time, driven by scroll progress:
 * each step fades and slides in as its scroll segment arrives, then fades away as
 * the next begins (including the last — the stage ends empty). Scroll drives per-
 * step CSS custom properties via rAF; only opacity + transform animate. Falls
 * back to a static, fully-visible stack when reduced motion is requested.
 */
export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.dataset.reduced = "true";
      return;
    }

    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, travel));
      const seg = 1 / STEPS.length;
      for (let i = 0; i < STEPS.length; i++) {
        // Local progress inside this step's scroll segment (0..1), or out of range.
        const local = (p - i * seg) / seg;
        let op = 0;
        let ty = 24; // px: starts below, waiting to slide up
        if (local >= 0 && local <= 1) {
          if (local < 0.25) {
            op = local / 0.25; // fade in
            ty = (1 - op) * 24; // slide up from below into place
          } else if (local > 0.75) {
            op = (1 - local) / 0.25; // fade out
            ty = -(1 - op) * 24; // continue drifting up and out
          } else {
            op = 1;
            ty = 0;
          }
        }
        op = clamp01(op);
        el.style.setProperty(`--s${i}-op`, String(op));
        el.style.setProperty(`--s${i}-ty`, `${ty}px`);
      }
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
        <div className={styles.grid}>
          <div className={styles.headingCol}>
            <Reveal>
              <p className={styles.eyebrow}>How it works</p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className={styles.heading}>
                Easy to set up,
                <br />
                simple to use
              </h2>
            </Reveal>
          </div>

          <div className={styles.stage}>
            {STEPS.map((s, i) => (
              <article
                key={s.n}
                className={styles.step}
                style={{
                  opacity: `var(--s${i}-op, 0)`,
                  transform: `translateY(var(--s${i}-ty, 24px))`,
                }}
              >
                <span className={styles.badge}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <ul className={styles.points}>
                  {s.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
