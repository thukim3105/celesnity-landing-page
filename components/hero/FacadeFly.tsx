"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FacadeFly.module.css";

/**
 * Scroll-scrubbed fly-in built from a user-provided drone clip
 * (Create_a_single_continuous_fir.mp4). Sliced to webp:
 *   frames 0..47   — aerial establishing (first 3s of the clip)
 *   [SEAM]         — cut to the ground approach, hidden under a black veil
 *   frames 48..71  — approach to the front door (last 1s of the clip)
 *   frames 72..91  — synthetic push INTO the dark doorway (dolly + fade to black)
 * Opaque full-bleed frames, no WebGL — smooth even without GPU accel.
 */

const FRAME_COUNT = 72;
const SEAM = 30; // aerial -> door cut
const FRAME_W = 1280;
const FRAME_H = 720;
const framePath = (i: number) =>
  `/hero/facade/frame_${String(i).padStart(3, "0")}.webp`;

export function FacadeFly() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnRef = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i);
      img.onload = () => {
        if (!alive) return;
        loaded++;
        if (loaded === 1 || loaded === FRAME_COUNT) setReady(true);
      };
      imgs[i] = img;
    }
    framesRef.current = imgs;
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawnRef.current = -1;
      draw(true);
    };

    const drawFrame = (idx: number) => {
      const img = framesRef.current[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      // Cover-fit: fill the viewport, crop the overflow (full-bleed hero).
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
      const dw = FRAME_W * scale;
      const dh = FRAME_H * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const flyp = new URLSearchParams(window.location.search).get("flyp");
    const forced = flyp != null ? parseFloat(flyp) : NaN;

    const progress = () => {
      if (Number.isFinite(forced)) return Math.max(0, Math.min(1, forced));
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / travel));
    };

    // Black veil peaking at the aerial->door cut so the jump reads as a blink.
    const seamP = SEAM / (FRAME_COUNT - 1);
    const halfWin = 4 / (FRAME_COUNT - 1);
    const updateVeil = (p: number) => {
      const dist = Math.abs(p - seamP);
      const v = dist < halfWin ? 1 - dist / halfWin : 0;
      if (veilRef.current) veilRef.current.style.opacity = String(v);
    };

    let raf = 0;
    const draw = (force = false) => {
      const p = reduced ? 0.5 : progress();
      updateVeil(p);
      let target = Math.max(
        0,
        Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))),
      );
      if (!framesRef.current[target]?.complete) {
        for (let d = 1; d < FRAME_COUNT; d++) {
          if (framesRef.current[target - d]?.complete) {
            target -= d;
            break;
          }
          if (framesRef.current[target + d]?.complete) {
            target += d;
            break;
          }
        }
      }
      if (!force && target === drawnRef.current) return;
      drawnRef.current = target;
      drawFrame(target);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    };

    resize();
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div ref={veilRef} className={styles.seamVeil} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        {/* Mascot avatar covering the bottom-right corner (hides any watermark).
            Drop a square image at public/mascot.png to fill it. */}
        <div className={styles.mascot} aria-hidden="true" />
        {!ready && <div className={styles.loader} aria-hidden="true" />}
      </div>
    </section>
  );
}
