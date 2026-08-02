"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./hero-scroll.module.css";

const SOURCE_FRAME_COUNT = 145;
const FRAME_STEP = 1;
const FRAME_COUNT = Math.ceil(SOURCE_FRAME_COUNT / FRAME_STEP);
const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;
const PRELOAD_AHEAD = 12;
const PRELOAD_BEHIND = 5;
const RETAIN_RADIUS = 24;
const STARTUP_FRAME_COUNT = 1;
const PRELOAD_TRANSITION_PROGRESS = 0.35;
const frameSource = (index: number) =>
  `/media/hero-section-4k-full-frames/frame_${String(index * FRAME_STEP + 1).padStart(3, "0")}.webp`;

type ContentPhase = "example1" | "hidden" | "example2";

export function HeroScroll() {
  const t = useTranslations("Hero");
  const introRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const transitionShadeRef = useRef<HTMLDivElement>(null);
  const videoVeilRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const drawnFrameRef = useRef(-1);
  const [contentPhase, setContentPhase] = useState<ContentPhase>("example1");
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
    const startupFrames = new Set<number>();
    let alive = true;
    let animationFrame = 0;
    let previousTarget = 0;
    let previousVideoTone: boolean | null = null;

    const getProgress = () => {
      const bounds = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const transitionDistance = window.innerHeight * 0.55;
      const sequenceDistance = distance - transitionDistance;
      return sequenceDistance <= 0
        ? 0
        : Math.max(
            0,
            Math.min(1, (-bounds.top - transitionDistance) / sequenceDistance),
          );
    };

    const drawFrame = (index: number) => {
      const image = loadedFrames.get(index);
      if (!image?.complete || image.naturalWidth === 0) return false;

      const scale = Math.max(
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

    const requestRender = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };

    const loadFrame = (index: number, priority = false) => {
      if (index < 0 || index >= FRAME_COUNT || loadedFrames.has(index)) return;
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority ? "high" : "low";
      loadedFrames.set(index, image);
      image.onload = () => {
        if (!alive || loadedFrames.get(index) !== image) return;
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
        loadFrame(target + offset * direction, offset <= 5);
      }
      for (let offset = 1; offset <= PRELOAD_BEHIND; offset++) {
        loadFrame(target - offset * direction);
      }
      for (const [index, image] of loadedFrames) {
        if (
          image.complete &&
          Math.abs(index - target) > RETAIN_RADIUS &&
          index >= STARTUP_FRAME_COUNT
        ) {
          image.onload = null;
          image.src = "";
          loadedFrames.delete(index);
        }
      }
      previousTarget = target;
    };

    function render() {
      animationFrame = 0;
      const sequenceTop =
        sectionRef.current?.getBoundingClientRect().top ?? window.innerHeight;
      const transitionProgress = Math.max(
        0,
        Math.min(1, -sequenceTop / (window.innerHeight * 0.55)),
      );
      const heroBounds = sectionRef.current
        ?.closest<HTMLElement>("[data-hero]")
        ?.getBoundingClientRect();
      const useVideoTone =
        transitionProgress >= 0.6 && (heroBounds?.bottom ?? 0) > 0;
      if (useVideoTone !== previousVideoTone) {
        document.documentElement.dataset.heroTone = useVideoTone
          ? "video"
          : "intro";
        window.dispatchEvent(
          new CustomEvent<boolean>("celesnity:hero-tone", {
            detail: useVideoTone,
          }),
        );
        previousVideoTone = useVideoTone;
      }
      if (transitionShadeRef.current) {
        transitionShadeRef.current.style.opacity = String(
          Math.min(1, transitionProgress / 0.45),
        );
      }
      if (introRef.current) {
        const introFade = Math.max(
          0,
          Math.min(1, (transitionProgress - 0.45) / 0.15),
        );
        introRef.current.style.opacity = String(1 - introFade);
        introRef.current.style.pointerEvents = introFade === 1 ? "none" : "auto";
      }
      if (videoVeilRef.current) {
        const videoReveal = Math.max(
          0,
          Math.min(1, (transitionProgress - 0.6) / 0.4),
        );
        videoVeilRef.current.style.opacity = String(1 - videoReveal);
      }
      const progress = reduceMotion ? 0 : getProgress();
      const beat = Math.min(8, Math.floor(progress / 0.08));
      const nextPhase: ContentPhase =
        beat === 4 || beat === 8
          ? "hidden"
          : beat < 4
            ? "example1"
            : "example2";
      setContentPhase((current) =>
        current === nextPhase ? current : nextPhase,
      );
      let target: number;
      if (progress <= 0.64) {
        target = Math.round((progress / 0.64) * 58);
      } else if (progress <= 0.82) {
        target = Math.round(58 + ((progress - 0.64) / 0.18) * 34);
      } else if (progress <= 0.9) {
        target = Math.round(92 + ((progress - 0.82) / 0.08) * 32);
      } else if (progress <= 0.96) {
        target = Math.round(124 + ((progress - 0.9) / 0.06) * 20);
      } else {
        target = FRAME_COUNT - 1;
      }
      if (scrimRef.current) {
        const fadeIn = Math.max(0, Math.min(1, (progress - 0.68) / 0.12));
        const fadeOut = Math.max(0, Math.min(1, (0.94 - progress) / 0.08));
        scrimRef.current.style.opacity = String(fadeIn * fadeOut * 0.28);
      }
      if (transitionProgress < PRELOAD_TRANSITION_PROGRESS) {
        loadFrame(0, true);
        if (drawnFrameRef.current !== 0) drawFrame(0);
        return;
      }
      primeFrameWindow(target);
      if (target !== drawnFrameRef.current && !drawFrame(target)) {
        for (let offset = 1; offset <= RETAIN_RADIUS; offset++) {
          if (target - offset >= 0 && drawFrame(target - offset)) break;
          if (target + offset < FRAME_COUNT && drawFrame(target + offset)) break;
        }
      }
    }

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * pixelRatio);
      canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      drawnFrameRef.current = -1;
      requestRender();
    };
    const onScroll = () => requestRender();

    for (let index = 0; index < STARTUP_FRAME_COUNT; index++) {
      loadFrame(index, true);
    }
    resize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      alive = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      delete document.documentElement.dataset.heroTone;
      for (const image of loadedFrames.values()) {
        image.onload = null;
        image.src = "";
      }
      loadedFrames.clear();
    };
  }, []);

  const [intro, firstVideoChapter, secondVideoChapter] = t.raw("chapters") as {
    eyebrow: string;
    heading: string;
    lead: string;
  }[];

  return (
    <section className={styles.section} data-hero>
      <div ref={introRef} className={styles.intro}>
        <div className={styles.introInner}>
          <div className="relative isolate w-full max-w-[860px]">
            <div className={`${styles.outerGlow} ${styles.outerGlowOverall}`} aria-hidden="true" />
            <div className={`${styles.outerGlow} ${styles.outerGlowLeft}`} aria-hidden="true" />
            <div className={`${styles.outerGlow} ${styles.outerGlowRight}`} aria-hidden="true" />
            <div className={`${styles.outerGlow} ${styles.outerGlowBottom}`} aria-hidden="true" />

            <div className={styles.introCardBorder}>
              <div className={styles.introCardBody}>
                <div className={`${styles.innerGlow} ${styles.innerGlowLeft}`} aria-hidden="true" />
                <div className={`${styles.innerGlow} ${styles.innerGlowRight}`} aria-hidden="true" />
                <div className={`${styles.innerGlow} ${styles.innerGlowCenter}`} aria-hidden="true" />

                <div className={styles.introCardContent}>
                  <h1 className={styles.introHeading}>{intro.heading}</h1>
                  <p className={styles.introLead}>{intro.lead}</p>
                  <a className={styles.cta} href="#section-4">
                    {t("cta")}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.introCue}>{t("scrollHint")}</p>
        </div>
        <div ref={transitionShadeRef} className={styles.transitionShade} aria-hidden="true" />
      </div>

      <div ref={sectionRef} className={styles.sequence}>
        <div className={styles.stage} data-hero-stage>
        <canvas
          ref={canvasRef}
          className={styles.video}
          aria-label={t("videoLabel")}
          role="img"
        />

        <div ref={scrimRef} className={styles.scrim} aria-hidden="true" />
        <div ref={videoVeilRef} className={styles.videoVeil} aria-hidden="true" />

        <div
          className={`${styles.loader} ${ready ? styles.loaderReady : ""}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.loaderBar} />
          <span className={styles.srOnly}>
            {ready ? t("ready") : t("loading")}
          </span>
        </div>

          <div className={styles.content} aria-live="polite">
          <div
            className={`${styles.chapter} ${styles.exampleChapter} ${contentPhase === "example1" ? styles.chapterActive : ""}`}
            aria-hidden={contentPhase !== "example1"}
          >
            <h2 className={styles.heading}>{firstVideoChapter.heading}</h2>
          </div>

          <div
            className={`${styles.chapter} ${styles.exampleChapter} ${contentPhase === "example2" ? styles.chapterActive : ""}`}
            aria-hidden={contentPhase !== "example2"}
          >
            <h2 className={styles.heading}>{secondVideoChapter.heading}</h2>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
