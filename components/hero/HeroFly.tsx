"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroFly.module.css";

/**
 * Experimental "fly-around the factory" hero.
 *
 * A pre-rendered camera fly-around (neutral Blender frames, transparent bg) is
 * scrubbed by scroll and colourised into the Cosmos nebula gradient live on a
 * <canvas> — so the tint flips with the DS theme and no colour is baked in.
 *
 * Pipeline is deliberately light: no Three.js, no model in the browser. Each
 * scroll tick just draws one frame + a 3-op gradient composite (multiply →
 * clip-to-alpha), which is ~1ms and GPU-accelerated.
 *
 * Reserved handoff: the last frame lands low among the buildings, ready for an
 * interior segment to be appended when that model arrives.
 */

const FRAME_COUNT = 170;
// The sequence is two acts: exterior fly-around (0..EXT_FRAMES-1) then the
// interior conveyor walk (EXT_FRAMES..end). A short fade-through-dark hides the
// cut between the two separately-rendered models.
const EXT_FRAMES = 100;
const SEAM_HALF = 4; // frames on each side of the seam that dip to dark
const FRAME_W = 1280;
const FRAME_H = 720;
const framePath = (i: number) =>
  `/hero/fly/frame_${String(i).padStart(3, "0")}.webp`;

type Stop = { c: [number, number, number]; at: number };

// Parse the resolved --gradient-brand ("linear-gradient(120deg, rgb(...) 0%, ...)")
// into canvas gradient stops. Falls back to the nebula spine if parsing fails.
function readBrandStops(el: HTMLElement): Stop[] {
  const raw = getComputedStyle(el).getPropertyValue("--gradient-brand");
  const colorRe = /rgba?\(([^)]+)\)\s*([\d.]+)%/g;
  const stops: Stop[] = [];
  let m: RegExpExecArray | null;
  while ((m = colorRe.exec(raw))) {
    const parts = m[1].split(",").map((n) => parseFloat(n));
    stops.push({ c: [parts[0], parts[1], parts[2]], at: parseFloat(m[2]) / 100 });
  }
  if (stops.length >= 2) return stops;
  return [
    { c: [45, 68, 224], at: 0 },
    { c: [110, 31, 198], at: 0.52 },
    { c: [177, 79, 208], at: 1 },
  ];
}

export function HeroFly({
  heading = "The factory, from the inside out.",
  lead = "Fly the line, then step inside. Real-time operational data on every carton that moves.",
  ctaPrimary = "Talk to us",
  ctaSecondary = "See the platform",
  showCopy = true,
}: {
  heading?: string;
  lead?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  showCopy?: boolean;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const stopsRef = useRef<Stop[]>([]);
  const drawnRef = useRef(-1);
  const [ready, setReady] = useState(false);

  // Preload frames.
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

  // Draw loop: scroll → progress → frame, with the Cosmos gradient composite.
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const refreshStops = () =>
      (stopsRef.current = readBrandStops(document.documentElement));
    refreshStops();

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      drawnRef.current = -1; // force redraw
      draw(true);
    };

    const gradientFor = (w: number, h: number) => {
      // Diagonal ~120° like the nebula gradient.
      const g = ctx.createLinearGradient(0, h, w, 0);
      for (const s of stopsRef.current) {
        g.addColorStop(
          Math.max(0, Math.min(1, s.at)),
          `rgb(${s.c[0]},${s.c[1]},${s.c[2]})`,
        );
      }
      return g;
    };

    const drawFrame = (idx: number) => {
      const img = framesRef.current[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
      const dw = FRAME_W * scale;
      const dh = FRAME_H * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh); // neutral model + alpha
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = gradientFor(cw, ch); // colourise, keep luminance
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(img, dx, dy, dw, dh); // clip back to the model silhouette
      ctx.globalCompositeOperation = "source-over";

      // Fade-through-dark across the exterior->interior seam.
      const dist = Math.abs(idx - (EXT_FRAMES - 0.5));
      if (dist < SEAM_HALF) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(5,6,15,${(1 - dist / SEAM_HALF) * 0.92})`;
        ctx.fillRect(0, 0, cw, ch);
      }
    };

    // Optional debug override: /hero-fly?flyp=0.6 pins a fixed progress so a
    // given frame can be inspected/screenshotted without scrolling.
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
      const p = reduced ? 0.62 : progress();
      const idx = Math.max(
        0,
        Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))),
      );
      let target = idx;
      // If the exact frame isn't decoded yet, fall back to the nearest ready one.
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

    const themeObs = new MutationObserver(() => {
      refreshStops();
      drawnRef.current = -1;
      draw(true);
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      themeObs.disconnect();
    };
  }, [ready]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />
        {showCopy && (
          <div className={styles.overlay}>
            <h1 className={styles.heading}>{heading}</h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.ctaPrimary}>
                {ctaPrimary}
              </button>
              <button type="button" className={styles.ctaSecondary}>
                {ctaSecondary}
              </button>
            </div>
          </div>
        )}
        {!ready && <div className={styles.loader} aria-hidden="true" />}
      </div>
    </section>
  );
}
