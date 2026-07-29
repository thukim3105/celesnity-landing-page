"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero-scroll.module.css";

const SOURCE_FRAME_COUNT = 240;
const SOURCE_FRAME_STEP = 2;
const FRAME_COUNT = Math.ceil(SOURCE_FRAME_COUNT / SOURCE_FRAME_STEP);
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const PRELOAD_AHEAD = 24;
const PRELOAD_BEHIND = 10;
const RETAIN_RADIUS = 42;
const STARTUP_FRAME_COUNT = 10;
const frameSource = (index: number) =>
  `/media/cinematic-industrial-frames/frame_${String(index * SOURCE_FRAME_STEP + 1).padStart(3, "0")}.webp`;

export function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const copyFrameRef = useRef<HTMLDivElement>(null);
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
    let previousTarget = 0;
    const startupFrames = new Set<number>();

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

    const loadFrame = (index: number, priority = false) => {
      if (index < 0 || index >= FRAME_COUNT || framesRef.current.has(index)) {
        return;
      }

      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority ? "high" : "low";
      framesRef.current.set(index, image);
      image.onload = () => {
        if (!alive || framesRef.current.get(index) !== image) return;
        if (index < STARTUP_FRAME_COUNT) {
          startupFrames.add(index);
          if (startupFrames.size === STARTUP_FRAME_COUNT) setReady(true);
        }
        requestRender();
      };
      image.src = frameSource(index);
    };

    const primeFrameWindow = (target: number) => {
      const direction = target >= previousTarget ? 1 : -1;
      loadFrame(target, true);

      for (let offset = 1; offset <= PRELOAD_AHEAD; offset++) {
        loadFrame(target + offset * direction, offset <= 4);
      }
      for (let offset = 1; offset <= PRELOAD_BEHIND; offset++) {
        loadFrame(target - offset * direction);
      }

      for (const [index, image] of framesRef.current) {
        if (
          image.complete &&
          Math.abs(index - target) > RETAIN_RADIUS &&
          index >= STARTUP_FRAME_COUNT
        ) {
          image.onload = null;
          image.src = "";
          framesRef.current.delete(index);
        }
      }

      previousTarget = target;
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

      if (copyFrameRef.current) {
        const enter = Math.max(0, Math.min(1, (progress - 0.06) / 0.08));
        const leave = Math.max(0, Math.min(1, (0.9 - progress) / 0.1));
        const visibility = enter * leave;
        copyFrameRef.current.style.opacity = String(visibility);
        copyFrameRef.current.style.transform = `translate3d(-50%, ${(1 - enter) * 18}px, 0)`;
      }

    };

    const requestRender = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };

    const resize = () => {
      const ratioLimit = window.innerWidth <= 768 ? 1 : 1.25;
      pixelRatio = Math.min(window.devicePixelRatio || 1, ratioLimit);
      canvas.width = Math.round(canvas.clientWidth * pixelRatio);
      canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      drawnFrameRef.current = -1;
      requestRender();
    };

    for (let index = 0; index < STARTUP_FRAME_COUNT; index++) {
      loadFrame(index, true);
    }
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

        <div ref={cueRef} className={styles.scrollCue} aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>

        <div
          ref={copyFrameRef}
          className={styles.scrollCopyFrame}
          data-hero-copy-frame
        >
          {/* Add scroll copy here. */}
        </div>
      </div>
    </section>
  );
}
