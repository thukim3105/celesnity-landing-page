"use client";

import { useEffect, useRef, useState } from "react";
import { HeroExperience } from "./HeroExperience";
import { HeroLabels } from "./HeroLabels";
import { WasteCounter } from "./WasteCounter";
import { HeroOutro } from "./HeroOutro";
import { HeroSceneLine } from "./HeroSceneLine";
import { HeroVoiceScene } from "./HeroVoiceScene";
import { TOTAL_BOXES } from "./heroLabels.data";
import {
  computeProgress,
  contentHideT,
  timerRevealCount,
} from "./heroRevealMath.mjs";
import { outroStep, OUTRO_SCENE2_MS } from "./heroOutro.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./Hero.module.css";

// Phase thresholds over the section's 0..1 scroll progress.
const P1_END = 0.4; // content fully faded by here (longer lead-in)
const P2_START = 0.44; // labels start revealing (+ scroll lock engages)
const TIMER_INTERVAL_MS = 900; // auto-reveal cadence (~1s each)
const CONTENT_RISE_PX = 48; // how far the content slides up as it exits

type HeroRevealProps = {
  heading: string;
  lead1: string;
  lead2: string;
  boxes: LabelBox[];
  codeLabel: string;
  qtyLabel: string;
  wasteEyebrow: string;
  wasteCaption: string;
  outroMessage: string;
  outroCta: string;
  scene2Line: string;
  scene3Line: string;
  voiceHint: string;
  voiceProcessing: string;
  voiceScrollHint: string;
  voiceFields: { label: string; value: string }[];
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
  wasteEyebrow,
  wasteCaption,
  outroMessage,
  outroCta,
  scene2Line,
  scene3Line,
  voiceHint,
  voiceProcessing,
  voiceScrollHint,
  voiceFields,
}: HeroRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [step, setStep] = useState(0); // outro timeline step (0..4)

  // Mutable frame state kept in refs so the rAF loop never re-subscribes.
  const maxRevealedRef = useRef(0);
  const lastSetRef = useRef(0);
  const phase2StartRef = useRef<number | null>(null);
  const outroStartRef = useRef<number | null>(null);
  const lastStepRef = useRef(0);
  const lockedRef = useRef(false);
  const sequenceDoneRef = useRef(false);
  const reducedRef = useRef(false);

  // Scene 4 shows its scroll cue → release the scroll lock for good.
  const handleVoiceComplete = () => {
    sequenceDoneRef.current = true;
  };

  // The scroll cue's arrow jumps past the pinned hero to the next section.
  const handleExplore = () => {
    const el = sectionRef.current;
    if (!el) return;
    const target = el.getBoundingClientRect().bottom + window.scrollY;
    window.dispatchEvent(new CustomEvent("hero:scrollto", { detail: target }));
  };

  // Real click on the CTA doesn't navigate — it fast-forwards the timeline to
  // Scene 2, which then auto-continues to Scene 3 like the untouched sequence.
  const handleCtaClick = () => {
    outroStartRef.current = performance.now() - OUTRO_SCENE2_MS;
  };

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
          sequenceDoneRef.current = false;
        }

        let target: number;
        if (reducedRef.current) {
          target = progress >= P2_START ? TOTAL_BOXES : 0;
        } else if (phase2StartRef.current === null) {
          target = 0;
        } else {
          // First label the moment phase 2 starts, then one every interval, so
          // box 1 -> 2 is spaced the same as the rest. Scroll is locked during
          // the reveal, so the cadence is purely time-based.
          const tCount = timerRevealCount(
            performance.now() - phase2StartRef.current,
            TOTAL_BOXES,
            TIMER_INTERVAL_MS,
          );
          target = Math.min(TOTAL_BOXES, tCount + 1);
        }

        // Monotonic: never un-reveal on scroll-up (unless we left phase 2).
        maxRevealedRef.current = Math.max(maxRevealedRef.current, target);
        if (maxRevealedRef.current !== lastSetRef.current) {
          lastSetRef.current = maxRevealedRef.current;
          setVisibleCount(maxRevealedRef.current);
        }

        // Scene-1 ending timeline: begins once all labels are shown, then
        // auto-plays message -> CTA -> click -> Scene 2.
        if (maxRevealedRef.current >= TOTAL_BOXES) {
          if (outroStartRef.current === null) {
            outroStartRef.current = performance.now();
          }
        } else {
          outroStartRef.current = null;
        }
        const nextStep =
          outroStartRef.current === null
            ? 0
            : outroStep(performance.now() - outroStartRef.current);
        if (nextStep !== lastStepRef.current) {
          lastStepRef.current = nextStep;
          setStep(nextStep);
        }

        // Scroll lock: hold from the first label through the whole scene
        // sequence, releasing only once Scene 4 fills its form.
        const wantLock =
          phase2StartRef.current !== null && !sequenceDoneRef.current;
        if (wantLock !== lockedRef.current) {
          lockedRef.current = wantLock;
          window.dispatchEvent(new Event(wantLock ? "hero:lock" : "hero:unlock"));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      // Never leave the page scroll-locked if this unmounts mid-sequence.
      if (lockedRef.current) {
        lockedRef.current = false;
        window.dispatchEvent(new Event("hero:unlock"));
      }
    };
  }, []);

  const dimmed = step >= 1; // labels + counter fade out once the message shows
  const sceneActive = step >= 4; // Scene 1 hidden once the status scenes begin
  const scene2Shown = step === 4; // "installing…"
  const scene3Shown = step === 5; // "configuring…"
  const scene4Active = step >= 6; // voice-to-form demo

  return (
    <section ref={sectionRef} className={styles.section} data-hero>
      <div ref={stageRef} className={styles.stage}>
        <HeroExperience />
        <div
          className={`${styles.scene1} ${sceneActive ? styles.scene1Hidden : ""}`}
        >
          <WasteCounter
            visibleCount={visibleCount}
            dimmed={dimmed}
            eyebrow={wasteEyebrow}
            caption={wasteCaption}
          />
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
            dimmed={dimmed}
          />
          <HeroOutro
            step={step}
            message={outroMessage}
            ctaLabel={outroCta}
            onCtaClick={handleCtaClick}
          />
        </div>
        <HeroSceneLine shown={scene2Shown} line={scene2Line} />
        <HeroSceneLine shown={scene3Shown} line={scene3Line} />
        <HeroVoiceScene
          active={scene4Active}
          hint={voiceHint}
          processing={voiceProcessing}
          scrollHint={voiceScrollHint}
          fields={voiceFields}
          onComplete={handleVoiceComplete}
          onExplore={handleExplore}
        />
      </div>
    </section>
  );
}
