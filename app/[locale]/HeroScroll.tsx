"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero-scroll.module.css";

const FRAME_COUNT = 304;
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const SEQUENCE_DURATION = 15.2;
const frameSource = (index: number) =>
  `/media/intro-6-frames/frame_${String(index + 1).padStart(3, "0")}.webp`;

export function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnFrameRef = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ambientVideo = ambientVideoRef.current;
    if (!section || !canvas || !ambientVideo) return;

    const context = canvas.getContext("2d");
    if (!context) return;

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
      const image = framesRef.current[index];
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

    const render = () => {
      animationFrame = 0;
      const progress = reduceMotion ? 0 : getProgress();
      const target = Math.round(progress * (FRAME_COUNT - 1));
      const ambientDuration =
        Number.isFinite(ambientVideo.duration) && ambientVideo.duration > 0
          ? ambientVideo.duration
          : SEQUENCE_DURATION;
      const ambientTime = progress * Math.max(0, ambientDuration - 0.04);

      if (
        ambientVideo.readyState >= HTMLMediaElement.HAVE_METADATA &&
        Math.abs(ambientVideo.currentTime - ambientTime) > 0.05
      ) {
        ambientVideo.currentTime = ambientTime;
      }

      if (target !== drawnFrameRef.current && !drawFrame(target)) {
        for (let offset = 1; offset < FRAME_COUNT; offset++) {
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

    const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image();
      image.decoding = "async";
      image.src = frameSource(index);
      image.onload = () => {
        if (!alive) return;
        if (index === 0) setReady(true);
        requestRender();
      };
      return image;
    });
    framesRef.current = frames;

    resize();
    ambientVideo.addEventListener("loadedmetadata", requestRender);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      alive = false;
      cancelAnimationFrame(animationFrame);
      ambientVideo.removeEventListener("loadedmetadata", requestRender);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", resize);
      framesRef.current = [];
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-hero>
      <div className={styles.stage}>
        <video
          ref={ambientVideoRef}
          className={styles.ambient}
          src="/media/intro-6-ambient.mp4"
          preload="auto"
          muted
          playsInline
          aria-hidden="true"
        />
        <canvas
          ref={canvasRef}
          className={styles.video}
          aria-label="Celesnity automated factory journey"
          role="img"
        />

        <div className={styles.scrim} aria-hidden="true" />

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
      </div>
    </section>
  );
}
