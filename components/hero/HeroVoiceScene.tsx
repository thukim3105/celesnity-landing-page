"use client";

import { useEffect, useRef, useState } from "react";
import { holdProgress, revealedByTime } from "./heroVoice.mjs";
import styles from "./HeroVoiceScene.module.css";

type VoiceField = { label: string; value: string };

type HeroVoiceSceneProps = {
  active: boolean;
  hint: string;
  processing: string;
  scrollHint: string;
  fields: VoiceField[];
  onComplete: () => void;
  onExplore: () => void;
};

type Phase =
  | "idle"
  | "holding"
  | "speaking"
  | "processing"
  | "filled"
  | "cue";

const HOLD_MS = 1000; // press-and-hold duration
const FALLBACK_MS = 4000; // auto-play if nobody interacts
const CHAR_MS = 42; // per transcript character (typing effect)
const PROCESS_MS = 1300; // loading bar duration
const FILL_MS = 480; // per form field
const CUE_DELAY_MS = 2000; // pause after the form fills before the scroll cue
const RING_C = 2 * Math.PI * 45; // circumference of the r=45 progress ring

/**
 * Scene 4: a simulated voice-to-form demo. Press-and-hold the mic for 1s (or let
 * the auto-fallback fire) to play: waveform -> spoken transcript -> processing ->
 * the fields landing in a tidy form. Calls onComplete when the form is filled.
 */
export function HeroVoiceScene({
  active,
  hint,
  processing,
  scrollHint,
  fields,
  onComplete,
  onExplore,
}: HeroVoiceSceneProps) {
  const [phase, _setPhase] = useState<Phase>("idle");
  const [charN, setCharN] = useState(0);
  const [filledN, setFilledN] = useState(0);

  const phaseRef = useRef<Phase>("idle");
  const holdStartRef = useRef(0);
  const autoRef = useRef(false);
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const doneRef = useRef(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const handlersRef = useRef<{
    beginHold: (auto: boolean) => void;
    cancelHold: () => void;
  } | null>(null);

  const transcriptText = fields.map((f) => f.value).join(", ");

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    _setPhase(p);
  };
  const setRing = (p: number) => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(RING_C * (1 - p));
    }
  };

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    const addTimer = (fn: () => void, ms: number) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    };
    const showCue = () => {
      clearTimers();
      setPhase("cue"); // slide up + show the scroll cue; release the lock
      finish();
    };
    const startFill = () => {
      clearTimers();
      setPhase("filled");
      fields.forEach((_, i) =>
        addTimer(() => setFilledN(i + 1), (i + 1) * FILL_MS),
      );
      addTimer(showCue, fields.length * FILL_MS + CUE_DELAY_MS);
    };
    const startProcessing = () => {
      clearTimers();
      setPhase("processing");
      addTimer(startFill, PROCESS_MS);
    };
    const scheduleFallback = () => addTimer(() => beginHold(true), FALLBACK_MS);
    const beginHold = (auto: boolean) => {
      if (phaseRef.current !== "idle") return;
      clearTimers();
      autoRef.current = auto;
      setPhase("holding");
      holdStartRef.current = performance.now();
      const total = transcriptText.length;
      let lastN = -1;
      const loop = () => {
        const elapsed = performance.now() - holdStartRef.current;
        const p = holdProgress(elapsed, HOLD_MS);
        setRing(p);
        // the transcript types out from the moment the mic is pressed
        const n = revealedByTime(elapsed, total, CHAR_MS);
        if (n !== lastN) {
          lastN = n;
          setCharN(n);
        }
        // once held past 1s, we're committed — keep typing to the end
        if (p >= 1 && phaseRef.current === "holding") setPhase("speaking");
        if (p >= 1 && n >= total) {
          startProcessing();
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    };
    const cancelHold = () => {
      if (phaseRef.current !== "holding" || autoRef.current) return;
      clearTimers();
      setRing(0);
      setCharN(0);
      setPhase("idle");
      scheduleFallback();
    };

    // expose the two pointer/keyboard entry points to the render closure
    handlersRef.current = { beginHold, cancelHold };

    if (!active) return clearTimers;

    // reset for a fresh run
    doneRef.current = false;
    setCharN(0);
    setFilledN(0);
    setRing(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("filled");
      setCharN(transcriptText.length);
      setFilledN(fields.length);
      addTimer(showCue, 900);
      return clearTimers;
    }

    setPhase("idle");
    scheduleFallback();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onPointerDown = () => handlersRef.current?.beginHold(false);
  const onPointerUp = () => handlersRef.current?.cancelHold();
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlersRef.current?.beginHold(true);
    }
  };

  const listening = phase === "holding" || phase === "speaking";

  return (
    <div className={`${styles.scene} ${active ? styles.sceneShown : ""}`}>
      <div className={styles.card} data-cue={phase === "cue"}>
        <span
          className={styles.hint}
          data-visible={phase === "idle" || phase === "holding"}
        >
          {hint}
        </span>

        <button
          type="button"
          className={styles.mic}
          data-listening={listening}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          aria-label={hint}
        >
          <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
            <circle className={styles.ringTrack} cx="50" cy="50" r="45" />
            <circle
              ref={ringRef}
              className={styles.ringProgress}
              cx="50"
              cy="50"
              r="45"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C}
            />
          </svg>
          <svg className={styles.micIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M6 11a6 6 0 0 0 12 0M12 18v3" fill="none" />
          </svg>
          <span className={styles.wave} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={styles.waveBar} />
            ))}
          </span>
        </button>

        <div className={styles.transcript} aria-hidden="true">
          <span className={styles.transcriptText}>
            {transcriptText.slice(0, charN)}
          </span>
          {(phase === "holding" || phase === "speaking") &&
            charN < transcriptText.length && <span className={styles.caret} />}
        </div>

        <div className={styles.processing} data-shown={phase === "processing"}>
          <span className={styles.processingLabel}>{processing}</span>
          <span className={styles.bar}>
            <span className={styles.barFill} />
          </span>
        </div>

        <ul className={styles.form}>
          {fields.map((f, i) => (
            <li key={i} className={styles.field} data-filled={i < filledN}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className={styles.scrollCue}
        data-shown={phase === "cue"}
        onClick={onExplore}
        tabIndex={phase === "cue" ? 0 : -1}
        aria-hidden={phase !== "cue"}
      >
        <span className={styles.scrollText}>{scrollHint}</span>
        <svg className={styles.scrollArrow} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>
    </div>
  );
}
