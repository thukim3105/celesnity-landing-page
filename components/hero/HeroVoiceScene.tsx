"use client";

import { useEffect, useRef, useState } from "react";
import { holdProgress } from "./heroVoice.mjs";
import styles from "./HeroVoiceScene.module.css";

type VoiceField = { label: string; value: string };

type HeroVoiceSceneProps = {
  active: boolean;
  hint: string;
  processing: string;
  fields: VoiceField[];
  onComplete: () => void;
};

type Phase = "idle" | "holding" | "speaking" | "processing" | "filled";

const HOLD_MS = 1000; // press-and-hold duration
const FALLBACK_MS = 4000; // auto-play if nobody interacts
const CHUNK_MS = 700; // per transcript chunk
const PROCESS_MS = 1300; // loading bar duration
const FILL_MS = 480; // per form field
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
  fields,
  onComplete,
}: HeroVoiceSceneProps) {
  const [phase, _setPhase] = useState<Phase>("idle");
  const [transcriptN, setTranscriptN] = useState(0);
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

  const chunks = fields.map((f) => f.value);

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
    const startFill = () => {
      clearTimers();
      setPhase("filled");
      fields.forEach((_, i) =>
        addTimer(() => setFilledN(i + 1), (i + 1) * FILL_MS),
      );
      addTimer(finish, fields.length * FILL_MS + 500);
    };
    const startProcessing = () => {
      clearTimers();
      setPhase("processing");
      addTimer(startFill, PROCESS_MS);
    };
    const startSpeaking = () => {
      clearTimers();
      setPhase("speaking");
      chunks.forEach((_, i) =>
        addTimer(() => setTranscriptN(i + 1), (i + 1) * CHUNK_MS),
      );
      addTimer(startProcessing, chunks.length * CHUNK_MS + 400);
    };
    const scheduleFallback = () => addTimer(() => beginHold(true), FALLBACK_MS);
    const beginHold = (auto: boolean) => {
      if (phaseRef.current !== "idle") return;
      clearTimers();
      autoRef.current = auto;
      setPhase("holding");
      holdStartRef.current = performance.now();
      const loop = () => {
        const p = holdProgress(performance.now() - holdStartRef.current, HOLD_MS);
        setRing(p);
        if (p >= 1) {
          startSpeaking();
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
      setPhase("idle");
      scheduleFallback();
    };

    // expose the two pointer/keyboard entry points to the render closure
    handlersRef.current = { beginHold, cancelHold };

    if (!active) return clearTimers;

    // reset for a fresh run
    doneRef.current = false;
    setTranscriptN(0);
    setFilledN(0);
    setRing(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("filled");
      setTranscriptN(chunks.length);
      setFilledN(fields.length);
      addTimer(finish, 700);
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
      <div className={styles.card}>
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
          {chunks.map((c, i) => (
            <span
              key={i}
              className={styles.chunk}
              data-shown={i < transcriptN}
            >
              {c}
            </span>
          ))}
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
    </div>
  );
}
