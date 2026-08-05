"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./hero-scroll.module.css";

const SOURCE_FRAME_COUNT = 145;
const FRAME_STEP = 1;
const FRAME_COUNT = Math.ceil(SOURCE_FRAME_COUNT / FRAME_STEP);
const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;
const PRELOAD_AHEAD = 8;
const PRELOAD_BEHIND = 3;
const MAX_PRELOAD_AHEAD = 12;
const MAX_DECODED_FRAMES = 16;
const STARTUP_FRAME_COUNT = 1;
const PRELOAD_TRANSITION_PROGRESS = 0.35;
const ALERT_FRAME_INDEX = 4;
const CHECK_FRAME_INDEX = 19;
const DIGITAL_FRAME_INDEX = 34;
const FRAME_TIMELINE = [
  { progress: 0, frame: 0 },
  { progress: 0.06, frame: 4 },
  { progress: 0.24, frame: 19 },
  { progress: 0.42, frame: 34 },
  { progress: 0.64, frame: 70 },
  { progress: 0.72, frame: 92 },
  { progress: 0.78, frame: 112 },
  { progress: 0.98, frame: 140 },
  { progress: 1, frame: FRAME_COUNT - 1 },
] as const;
const frameSource = (index: number) =>
  `/media/0805-7-frames/frame_${String(index * FRAME_STEP + 1).padStart(3, "0")}.webp`;

function frameAtProgress(progress: number) {
  for (let index = 1; index < FRAME_TIMELINE.length; index++) {
    const end = FRAME_TIMELINE[index];
    if (progress > end.progress) continue;
    const start = FRAME_TIMELINE[index - 1];
    const segmentProgress =
      (progress - start.progress) / (end.progress - start.progress);
    return Math.round(
      start.frame + segmentProgress * (end.frame - start.frame),
    );
  }
  return FRAME_COUNT - 1;
}

type ContentPhase = "title" | "example1" | "example2" | "hidden";

export function HeroScroll() {
  const t = useTranslations("Hero");
  const introRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const transitionTitleRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const drawnFrameRef = useRef(-1);
  const [contentPhase, setContentPhase] = useState<ContentPhase>("title");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const activeSection = section;

    const context = canvas.getContext("2d");
    if (!context) return;

    const loadedFrames = framesRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startupFrames = new Set<number>();
    const pendingFrames = new Map<number, HTMLImageElement>();
    let alive = true;
    let animationFrame = 0;
    let previousTarget = 0;
    let previousContentPhase: ContentPhase = "title";
    let previousVideoTone: boolean | null = null;
    let isNearViewport = true;
    let transitionTitleStart = 50;

    const getProgress = (sectionTop: number) => {
      const distance = activeSection.offsetHeight - window.innerHeight;
      const transitionDistance = window.innerHeight * 0.55;
      const sequenceDistance = distance - transitionDistance;
      return sequenceDistance <= 0
        ? 0
        : Math.max(
            0,
            Math.min(1, (-sectionTop - transitionDistance) / sequenceDistance),
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

    const releaseImage = (image: HTMLImageElement) => {
      image.onload = null;
      image.onerror = null;
      image.src = "";
    };

    const pruneDecodedFrames = (target: number) => {
      if (loadedFrames.size <= MAX_DECODED_FRAMES) return;
      const evictionCandidates = [...loadedFrames.keys()]
        .filter((index) => index !== 0 && index !== target)
        .sort(
          (left, right) =>
            Math.abs(right - target) - Math.abs(left - target),
        );
      while (
        loadedFrames.size > MAX_DECODED_FRAMES &&
        evictionCandidates.length > 0
      ) {
        const index = evictionCandidates.shift();
        if (index === undefined) break;
        const image = loadedFrames.get(index);
        if (!image) continue;
        releaseImage(image);
        loadedFrames.delete(index);
      }
    };

    const loadFrame = (index: number, priority = false) => {
      if (
        index < 0 ||
        index >= FRAME_COUNT ||
        loadedFrames.has(index) ||
        pendingFrames.has(index)
      ) {
        return;
      }
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority ? "high" : "low";
      pendingFrames.set(index, image);

      const markDecoded = () => {
        if (!alive || pendingFrames.get(index) !== image) return;
        pendingFrames.delete(index);
        loadedFrames.set(index, image);
        if (index < STARTUP_FRAME_COUNT) {
          startupFrames.add(index);
          if (startupFrames.size === STARTUP_FRAME_COUNT) setReady(true);
        }
        pruneDecodedFrames(previousTarget);
        requestRender();
      };

      image.onerror = () => {
        if (pendingFrames.get(index) === image) pendingFrames.delete(index);
      };
      image.src = frameSource(index);
      image.decode().then(markDecoded).catch(() => {
        if (image.complete && image.naturalWidth > 0) markDecoded();
      });
    };

    const primeFrameWindow = (target: number) => {
      const direction = target >= previousTarget ? 1 : -1;
      const targetJump = Math.abs(target - previousTarget);
      const preloadAhead = Math.min(
        MAX_PRELOAD_AHEAD,
        PRELOAD_AHEAD + Math.floor(targetJump / 3),
      );
      loadFrame(target, true);
      for (let offset = 1; offset <= preloadAhead; offset++) {
        loadFrame(target + offset * direction, offset <= 5);
      }
      for (let offset = 1; offset <= PRELOAD_BEHIND; offset++) {
        loadFrame(target - offset * direction);
      }

      for (const [index, image] of pendingFrames) {
        if (Math.abs(index - target) > MAX_PRELOAD_AHEAD * 2 && index !== 0) {
          releaseImage(image);
          pendingFrames.delete(index);
        }
      }
      previousTarget = target;
      pruneDecodedFrames(target);
    };

    function render() {
      animationFrame = 0;
      if (!isNearViewport) return;
      const sectionBounds = activeSection.getBoundingClientRect();
      const sequenceTop = sectionBounds.top;
      const transitionProgress = Math.max(
        0,
        Math.min(1, -sequenceTop / (window.innerHeight * 0.55)),
      );
      const useVideoTone =
        transitionProgress >= 0.6 && sectionBounds.bottom > 0;
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
      if (introRef.current) {
        const showIntro = transitionProgress < 0.6;
        introRef.current.style.visibility = showIntro ? "visible" : "hidden";
        introRef.current.style.pointerEvents = showIntro ? "auto" : "none";
      }
      if (transitionTitleRef.current) {
        const titleTravel = Math.max(
          0,
          Math.min(1, (transitionProgress - 0.6) / 0.4),
        );
        const titleTravelPixels =
          ((80 - transitionTitleStart) / 100) * window.innerHeight * titleTravel;
        transitionTitleRef.current.style.transform =
          `translate3d(-50%, calc(-50% + ${titleTravelPixels}px), 0)`;
      }
      const videoReveal = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (transitionProgress - 0.6) / 0.4));
      const activeCanvas = canvasRef.current;
      if (activeCanvas) {
        activeCanvas.style.opacity = String(videoReveal);
      }
      const progress = reduceMotion ? 0 : getProgress(sequenceTop);
      const target = frameAtProgress(progress);
      const nextPhase: ContentPhase =
        target < ALERT_FRAME_INDEX
          ? "title"
          : target < CHECK_FRAME_INDEX
            ? "example1"
            : target < DIGITAL_FRAME_INDEX
              ? "example2"
              : "hidden";
      if (nextPhase !== previousContentPhase) {
        previousContentPhase = nextPhase;
        setContentPhase(nextPhase);
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
        for (let offset = 1; offset <= MAX_DECODED_FRAMES; offset++) {
          if (target - offset >= 0 && drawFrame(target - offset)) break;
          if (target + offset < FRAME_COUNT && drawFrame(target + offset)) break;
        }
      }
    }

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * pixelRatio);
      canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      const introTitleBounds = introHeadingRef.current?.getBoundingClientRect();
      transitionTitleStart = introTitleBounds
        ? ((introTitleBounds.top + introTitleBounds.height / 2) /
            window.innerHeight) *
          100
        : 50;
      if (transitionTitleRef.current) {
        transitionTitleRef.current.style.top = `${transitionTitleStart}%`;
      }
      drawnFrameRef.current = -1;
      requestRender();
    };
    const onScroll = () => requestRender();

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting;
        if (isNearViewport) requestRender();
      },
      { rootMargin: "100% 0px" },
    );

    for (let index = 0; index < STARTUP_FRAME_COUNT; index++) {
      loadFrame(index, true);
    }
    resize();
    viewportObserver.observe(activeSection);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      alive = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      viewportObserver.disconnect();
      delete document.documentElement.dataset.heroTone;
      for (const image of loadedFrames.values()) {
        releaseImage(image);
      }
      for (const image of pendingFrames.values()) releaseImage(image);
      loadedFrames.clear();
      pendingFrames.clear();
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
                  <h1 ref={introHeadingRef} className={styles.introHeading}>
                    {intro.heading}
                  </h1>
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
            ref={transitionTitleRef}
            className={`${styles.chapter} ${styles.transitionChapter} ${contentPhase === "title" ? styles.chapterActive : ""}`}
            aria-hidden={contentPhase !== "title"}
          >
            <h2 className={styles.heading}>{intro.heading}</h2>
          </div>

          <div
            className={`${styles.chapter} ${styles.exampleChapter} ${contentPhase === "example1" ? styles.chapterActive : ""}`}
            aria-hidden={contentPhase !== "example1"}
          >
            {firstVideoChapter.eyebrow ? (
              <p className={styles.eyebrow}>{firstVideoChapter.eyebrow}</p>
            ) : null}
            <h2 className={styles.heading}>{firstVideoChapter.heading}</h2>
            <p className={styles.lead}>{firstVideoChapter.lead}</p>
          </div>

          <div
            className={`${styles.chapter} ${styles.exampleChapter} ${contentPhase === "example2" ? styles.chapterActive : ""}`}
            aria-hidden={contentPhase !== "example2"}
          >
            {secondVideoChapter.eyebrow ? (
              <p className={styles.eyebrow}>{secondVideoChapter.eyebrow}</p>
            ) : null}
            <h2 className={styles.heading}>{secondVideoChapter.heading}</h2>
            <p className={styles.lead}>{secondVideoChapter.lead}</p>
          </div>

          </div>
        </div>
      </div>
    </section>
  );
}
