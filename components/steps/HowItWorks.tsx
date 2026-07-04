"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./HowItWorks.module.css";

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

/** Inline CSS custom property for the per-line stagger index. */
const lineVar = (i: number) => ({ "--li": i }) as CSSProperties;

/**
 * "How it works" — the heading stays sticky on the left while the three steps
 * stack down the right. Each step reveals line by line (fade + slide + blur,
 * staggered) as it scrolls into view, and STAYS (steps accumulate 1 -> 2 -> 3;
 * nothing hides). Falls back to fully-visible under prefers-reduced-motion.
 */
export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.reduced = "true";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.shown = "true";
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" },
    );
    el.querySelectorAll("[data-step]").forEach((step) => io.observe(step));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={rootRef} className={styles.section}>
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
          {STEPS.map((s) => (
            <article key={s.n} className={styles.step} data-step>
              <span className={`${styles.badge} ${styles.line}`} style={lineVar(0)}>
                {s.n}
              </span>
              <h3
                className={`${styles.stepTitle} ${styles.line}`}
                style={lineVar(1)}
              >
                {s.title}
              </h3>
              <ul className={styles.points}>
                {s.points.map((pt, j) => (
                  <li key={pt} className={styles.line} style={lineVar(2 + j)}>
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
