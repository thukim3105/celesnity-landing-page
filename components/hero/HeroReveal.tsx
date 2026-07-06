"use client";

import { useEffect, useRef, useState } from "react";
import { HeroExperience } from "./HeroExperience";
import { HeroLabels } from "./HeroLabels";
import { TOTAL_BOXES } from "./heroLabels.data";
import {
  computeProgress,
  contentHideT,
  scrollRevealCount,
  timerRevealCount,
  revealCount,
} from "./heroRevealMath.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./Hero.module.css";

// Phase thresholds over the section's 0..1 scroll progress.
const P1_END = 0.3; // content fully faded by here
const P2_START = 0.32; // labels start revealing
const P2_END = 0.85; // all labels revealed by here
const TIMER_INTERVAL_MS = 900; // auto-reveal cadence (~1s each)
const CONTENT_RISE_PX = 48; // how far the content slides up as it exits

type HeroRevealProps = {
  heading: string;
  lead1: string;
  lead2: string;
  boxes: LabelBox[];
  codeLabel: string;
  qtyLabel: string;
};

/**
 * Pins the hero backdrop while the content scrolls away, then reveals the
 * labels. Reveal count = max(scrollIndex, timerIndex), kept monotonic so a
 * scroll-up never hides an already-shown label. Under reduced motion the timer
 * is off and all labels appear at once when phase 2 is entered.
 */
export function HeroReveal({
  heading,
  lead1,
  lead2,
  boxes,
  codeLabel,
  qtyLabel,
}: HeroRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  // Mutable frame state kept in refs so the rAF loop never re-subscribes.
  const maxRevealedRef = useRef(0);
  const lastSetRef = useRef(0);
  const phase2StartRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const section = sectionRef.current;
      const overlay = overlayRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const progress = computeProgress(
          rect.top,
          rect.height,
          window.innerHeight,
        );

        // Content fade + rise, written straight to the DOM (no re-render).
        if (overlay) {
          const t = contentHideT(progress, P1_END);
          overlay.style.opacity = String(1 - t);
          overlay.style.transform = `translateY(${-t * CONTENT_RISE_PX}px)`;
          overlay.style.pointerEvents = t > 0.95 ? "none" : "";
        }

        // Phase-2 clock: start when entered, reset if we scroll back above it.
        if (progress >= P2_START) {
          if (phase2StartRef.current === null) {
            phase2StartRef.current = performance.now();
          }
        } else {
          phase2StartRef.current = null;
          maxRevealedRef.current = 0;
        }

        let target: number;
        if (reducedRef.current) {
          target = progress >= P2_START ? TOTAL_BOXES : 0;
        } else {
          const sCount = scrollRevealCount(
            progress,
            TOTAL_BOXES,
            P2_START,
            P2_END,
          );
          const tCount =
            phase2StartRef.current === null
              ? 0
              : timerRevealCount(
                  performance.now() - phase2StartRef.current,
                  TOTAL_BOXES,
                  TIMER_INTERVAL_MS,
                );
          target = revealCount(sCount, tCount, TOTAL_BOXES);
        }

        // Monotonic: never un-reveal on scroll-up (unless we left phase 2).
        maxRevealedRef.current = Math.max(maxRevealedRef.current, target);
        if (maxRevealedRef.current !== lastSetRef.current) {
          lastSetRef.current = maxRevealedRef.current;
          setVisibleCount(maxRevealedRef.current);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-hero>
      <div ref={stageRef} className={styles.stage}>
        <HeroExperience />
        <div className={styles.overlay} ref={overlayRef}>
          <h1 className={styles.heading}>{heading}</h1>
          <p className={styles.lead}>
            {lead1}
            <br />
            {lead2}
          </p>
        </div>
        <HeroLabels
          stageRef={stageRef}
          boxes={boxes}
          codeLabel={codeLabel}
          qtyLabel={qtyLabel}
          visibleCount={visibleCount}
        />
      </div>
    </section>
  );
}
