"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./HowItWorks.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// easeOutQuad — decelerating arrival, matching the heading reveal's feel.
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

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
 * "How it works" — a pinned section. The heading stays on the left while the
 * steps play in one frame on the right: each step's lines fade + slide + blur in
 * one after another (heading-style), then get pulled UP line by line to hand off
 * to the next step. The last step stays. Scroll drives each line via rAF; only
 * opacity + transform + filter animate. Reduced motion shows everything.
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

    // Each step's revealable lines (badge, title, bullets), grouped by step.
    const stepLines = Array.from(
      el.querySelectorAll<HTMLElement>("[data-step]"),
    ).map((step) => Array.from(step.querySelectorAll<HTMLElement>("[data-line]")));

    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, travel));
      // Lead-in: heading alone before step 1; then one segment per step.
      const lead = 0.16;
      const seg = (1 - lead) / stepLines.length;
      const stagger = 0.05; // per-line offset within a segment
      const width = 0.2; // each line's fade span (keeps all lines fully shown mid-segment)
      stepLines.forEach((lines, i) => {
        const isLast = i === stepLines.length - 1;
        const local = (p - lead - i * seg) / seg;
        lines.forEach((line, j) => {
          let op = 0;
          let ty = 24;
          if (local >= 0 && (isLast || local <= 1)) {
            // Cascade in (each line a touch later); the last step never leaves.
            const fadeIn = clamp01((local - j * stagger) / width);
            const fadeOut = isLast
              ? 1
              : clamp01((1 - local - j * stagger) / width);
            const entering = fadeIn <= fadeOut;
            op = easeOut(Math.min(fadeIn, fadeOut));
            // Enter from below (+), leave by being pulled UP (−).
            ty = entering ? (1 - op) * 24 : -(1 - op) * 24;
          }
          line.style.opacity = String(op);
          line.style.transform = `translateY(${ty}px)`;
          line.style.filter = `blur(${(1 - op) * 10}px)`;
        });
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
                <span className={`${styles.badge} ${styles.line}`} data-line>
                  {s.n}
                </span>
                <h3 className={`${styles.stepTitle} ${styles.line}`} data-line>
                  {s.title}
                </h3>
                <ul className={styles.points}>
                  {s.points.map((pt) => (
                    <li key={pt} className={styles.line} data-line>
                      {pt}
                    </li>
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
