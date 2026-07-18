"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./WashingFly.module.css";

/**
 * Scroll-scrubbed lateral dolly past a row of washing machines.
 *
 * Pre-rendered in Blender from washing-machine.blend: the camera flies left→right
 * along the row, lens facing each machine (easing to dwell on each of the four).
 * Frames are transparent (alpha) so the machines composite over a dark backdrop —
 * no baked background, no WebGL, so it stays smooth even without GPU accel.
 */

const FRAME_COUNT = 90;
const FRAME_W = 1280;
const FRAME_H = 720;
const framePath = (i: number) =>
  `/hero/wm/frame_${String(i).padStart(3, "0")}.webp`;

export function WashingFly() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnRef = useRef(-1);
  const [ready, setReady] = useState(false);

  // Preload the frame sequence.
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

  // Scroll → frame.
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
      // Slight zoom past contain-fit for a bit more presence as machines fly past.
      const scale = Math.min(cw / FRAME_W, ch / FRAME_H) * 1.12;
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

    let raf = 0;
    const draw = (force = false) => {
      const p = reduced ? 0.5 : progress();
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
        <div className={styles.backdrop} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        {!ready && <div className={styles.loader} aria-hidden="true" />}
      </div>
    </section>
  );
}
