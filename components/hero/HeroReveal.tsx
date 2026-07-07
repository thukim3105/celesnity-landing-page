"use client";

import { useEffect, useRef, useState } from "react";
import { HeroExperience } from "./HeroExperience";
import { HeroLabels } from "./HeroLabels";
import { WasteCounter } from "./WasteCounter";
import { HeroOutro } from "./HeroOutro";
import { HeroSceneLine } from "./HeroSceneLine";
import { HeroVoiceScene } from "./HeroVoiceScene";
import { TOTAL_BOXES } from "./heroLabels.data";
import { computeProgress, contentHideT } from "./heroRevealMath.mjs";
import { OUTRO_SCENE2_MS } from "./heroOutro.mjs";
import {
  labelsAt,
  labelsDone,
  playheadEnd,
  stepAt,
  scrub,
  advance,
} from "./heroPlayback.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./Hero.module.css";

// Phase thresholds over the section's 0..1 scroll progress.
const P1_END = 0.55; // content fully faded by here (lead-in)
const P2_START = 0.72; // scrub sequence engages here (near the section end)
const CONTENT_RISE_PX = 48; // how far the content slides up as it exits

// Scrub playback tuning.
const SCRUB_GAIN = 6; // playhead ms moved per px of scroll delta
const IDLE_MS = 1000; // idle before the playhead auto-advances
const KEY_STEP_PX = 250; // scroll-delta equivalent of one arrow/page key press

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
  const [step, setStep] = useState(0); // outro timeline step (0..6)

  // Scrub playback state — kept in refs so the rAF loop never re-subscribes.
  const tRef = useRef(0); // playhead (ms)
  const lastInputRef = useRef(0); // perf.now of the last scrub input
  const lastFrameRef = useRef(0);
  const touchLastRef = useRef(0);
  const lastSetRef = useRef(0);
  const lastStepRef = useRef(0);
  const lockedRef = useRef(false);
  const sequenceDoneRef = useRef(false); // released downward (Scene 4 done/skipped)
  const releasedUpRef = useRef(false); // released upward (rewound past the start)
  const reducedRef = useRef(false);

  // Scene 4 finishing its form releases the sequence downward.
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

  // Real click on the CTA doesn't navigate — it jumps the playhead to Scene 2,
  // which then auto-continues like the untouched sequence.
  const handleCtaClick = () => {
    tRef.current = labelsDone(TOTAL_BOXES) + OUTRO_SCENE2_MS;
    lastInputRef.current = performance.now();
  };

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const end = playheadEnd(TOTAL_BOXES);

    const engage = () => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      lastInputRef.current = performance.now();
      window.dispatchEvent(new Event("hero:lock"));
    };
    const release = () => {
      if (!lockedRef.current) return;
      lockedRef.current = false;
      window.dispatchEvent(new Event("hero:unlock"));
    };
    const scrollToNext = () => {
      const el = sectionRef.current;
      if (!el) return;
      const target = el.getBoundingClientRect().bottom + window.scrollY;
      window.dispatchEvent(new CustomEvent("hero:scrollto", { detail: target }));
    };
    // Rewinding past the start hands scrolling back to the page; scrolling past
    // Scene 4 skips it and moves on — the sequence is never a hard gate.
    const applyDelta = (deltaY: number) => {
      lastInputRef.current = performance.now();
      if (tRef.current <= 0 && deltaY < 0) {
        releasedUpRef.current = true;
        release();
        return;
      }
      if (tRef.current >= end && deltaY > 0) {
        sequenceDoneRef.current = true;
        release();
        scrollToNext();
        return;
      }
      tRef.current = scrub(tRef.current, deltaY, SCRUB_GAIN, end);
    };

    const onWheel = (e: WheelEvent) => {
      if (!lockedRef.current) return;
      e.preventDefault();
      applyDelta(e.deltaY);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchLastRef.current = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!lockedRef.current) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchLastRef.current;
      applyDelta(touchLastRef.current - y);
      touchLastRef.current = y;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!lockedRef.current) return;
      const fwd = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const back = e.key === "ArrowUp" || e.key === "PageUp";
      if (!fwd && !back) return;
      e.preventDefault();
      applyDelta(fwd ? KEY_STEP_PX : -KEY_STEP_PX);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    let raf = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const section = sectionRef.current;
      const overlay = overlayRef.current;
      if (section) {
        const now = performance.now();
        const rect = section.getBoundingClientRect();
        const progress = computeProgress(
          rect.top,
          rect.height,
          window.innerHeight,
        );

        // Content fade + rise from the lead-in scroll (fully faded before P2).
        if (overlay) {
          const hide = contentHideT(progress, P1_END);
          overlay.style.opacity = String(1 - hide);
          overlay.style.transform = `translateY(${-hide * CONTENT_RISE_PX}px)`;
          overlay.style.pointerEvents = hide > 0.95 ? "none" : "";
        }

        const inRegion = progress >= P2_START;
        const scrubbing =
          inRegion && !sequenceDoneRef.current && !releasedUpRef.current;

        if (scrubbing) {
          engage();
          const dt = lastFrameRef.current ? now - lastFrameRef.current : 0;
          if (reducedRef.current) {
            tRef.current = end; // reduced motion: jump to the end state
          } else if (now - lastInputRef.current > IDLE_MS) {
            tRef.current = advance(tRef.current, dt, end); // auto-play when idle
          }
        } else {
          release();
          if (!inRegion) {
            // scrolled back above the sequence — reset for a fresh run
            tRef.current = 0;
            sequenceDoneRef.current = false;
            releasedUpRef.current = false;
          }
        }
        lastFrameRef.current = now;

        // Everything derives from the playhead, so scrubbing back un-reveals.
        let labels = 0;
        let st = 0;
        if (inRegion && !releasedUpRef.current) {
          labels = labelsAt(tRef.current, TOTAL_BOXES);
          st = stepAt(tRef.current, TOTAL_BOXES);
        }
        if (labels !== lastSetRef.current) {
          lastSetRef.current = labels;
          setVisibleCount(labels);
        }
        if (st !== lastStepRef.current) {
          lastStepRef.current = st;
          setStep(st);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
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
