"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero-scroll.module.css";

const FRAME_COUNT = 240;
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const PRELOAD_RADIUS = 12;
const RETAIN_RADIUS = 24;
const frameSource = (index: number) =>
  `/media/cinematic-industrial-frames/frame_${String(index + 1).padStart(3, "0")}.webp`;

export function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const copyRegionRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const drawnFrameRef = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const loadedFrames = framesRef.current;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let alive = true;
    let animationFrame = 0;
    let pixelRatio = 1;

    const getProgress = () => {
      const bounds = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      if (distance <= 0) return 0;
      return Math.max(0, Math.min(1, -bounds.top / distance));
    };

    const drawFrame = (index: number) => {
      const image = framesRef.current.get(index);
      if (!image?.complete || image.naturalWidth === 0) return false;

      const scale = Math.min(
        canvas.width / FRAME_WIDTH,
        canvas.height / FRAME_HEIGHT,
      );
      const width = FRAME_WIDTH * scale;
      const height = FRAME_HEIGHT * scale;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
      drawnFrameRef.current = index;
      return true;
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || framesRef.current.has(index)) {
        return;
      }

      const image = new Image();
      image.decoding = "async";
      framesRef.current.set(index, image);
      image.onload = () => {
        if (!alive || framesRef.current.get(index) !== image) return;
        if (index === 0) setReady(true);
        requestRender();
      };
      image.src = frameSource(index);
    };

    const primeFrameWindow = (target: number) => {
      loadFrame(target);
      for (let offset = 1; offset <= PRELOAD_RADIUS; offset++) {
        loadFrame(target + offset);
        loadFrame(target - offset);
      }

      for (const [index, image] of framesRef.current) {
        if (Math.abs(index - target) > RETAIN_RADIUS) {
          image.onload = null;
          image.src = "";
          framesRef.current.delete(index);
        }
      }
    };

    const render = () => {
      animationFrame = 0;
      const progress = reduceMotion ? 0 : getProgress();
      const target = Math.round(progress * (FRAME_COUNT - 1));
      primeFrameWindow(target);

      if (target !== drawnFrameRef.current && !drawFrame(target)) {
        for (let offset = 1; offset <= RETAIN_RADIUS; offset++) {
          if (target - offset >= 0 && drawFrame(target - offset)) break;
          if (target + offset < FRAME_COUNT && drawFrame(target + offset)) {
            break;
          }
        }
      }

      if (cueRef.current) {
        cueRef.current.style.opacity = String(
          Math.max(0, 1 - progress / 0.08),
        );
      }

      if (copyRegionRef.current) {
        const enter = Math.max(0, Math.min(1, (progress - 0.04) / 0.1));
        const leave = Math.max(0, Math.min(1, (0.88 - progress) / 0.1));
        const visibility = enter * leave;
        copyRegionRef.current.style.opacity = String(visibility);
        copyRegionRef.current.style.transform = `translate3d(${(1 - enter) * -24}px, 0, 0)`;
      }
    };

    const requestRender = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * pixelRatio);
      canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      drawnFrameRef.current = -1;
      requestRender();
    };

    loadFrame(0);
    resize();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      alive = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", resize);
      for (const image of loadedFrames.values()) {
        image.onload = null;
        image.src = "";
      }
      loadedFrames.clear();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-hero>
      <div className={styles.stage} data-hero-stage>
        <canvas
          ref={canvasRef}
          className={styles.video}
          aria-label="Celesnity automated factory journey"
          role="img"
        />

        <div
          className={`${styles.loader} ${ready ? styles.loaderReady : ""}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.loaderBar} />
          <span className={styles.srOnly}>
            {ready ? "Sequence ready" : "Loading sequence"}
          </span>
        </div>

        <div
          ref={copyRegionRef}
          className={styles.copyRegion}
          data-hero-copy-region
        >
          <div className={styles.copySlot}>{/* Add hero copy here. */}</div>
        </div>

        <div ref={cueRef} className={styles.scrollCue} aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </div>
    </section>
  );
}
