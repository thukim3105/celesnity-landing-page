"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { CartonScene } from "./CartonScene";
import { PhoneDemo } from "./PhoneDemo";
import { useParallax } from "./useParallax";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import styles from "./HeroSequence.module.css";

export function HeroSequence() {
  const t = useTranslations("HeroSequence");
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const [demo, setDemo] = useState(false);
  const [problemReady, setProblemReady] = useState(false);

  // Mouse-look — off while the demo takeover is open.
  useParallax(stageRef, !demo);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const intro = useTransform(scrollYProgress, [0, 0.16], [1, 0], { clamp: true });
  const scrubP2 = useTransform(scrollYProgress, [0.26, 0.7], [0, 1], { clamp: true });
  const sceneOpacity = useTransform(scrollYProgress, [0.68, 0.86], [1, 0.3], { clamp: true });
  const p3 = useTransform(scrollYProgress, [0.74, 0.92], [0, 1], { clamp: true });
  const p3y = useTransform(p3, [0, 1], [26, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const ready = v > 0.82;
    setProblemReady((prev) => (prev === ready ? prev : ready));
  });

  // Reduced motion: no scrub — cartons fully revealed, problem always visible.
  const staticP2 = useMotionValue(1);
  const p2 = reduced ? staticP2 : scrubP2;

  const openDemo = () => setDemo(true);
  const closeDemo = () => setDemo(false);

  const explore = () => {
    setDemo(false);
    const el = containerRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Esc closes the demo takeover.
  useEffect(() => {
    if (!demo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDemo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${reduced ? styles.reduced : ""}`}
    >
      <div ref={stageRef} className={styles.stage} data-hero>
        <motion.div className={styles.sceneLayer} style={{ opacity: reduced ? 1 : sceneOpacity }}>
          <CartonScene p2={p2} />
        </motion.div>

        {/* Act 1 — idle intro */}
        {!reduced && (
          <motion.div className={styles.intro} style={{ opacity: intro }}>
            <span className={styles.eyebrow}>{t("eyebrow")}</span>
            <h1 className={styles.heading}>{t("heading")}</h1>
            <span className={styles.scrollHint}>
              {t("scrollHint")}
              <span className={styles.scrollHintLine} />
            </span>
          </motion.div>
        )}

        {/* Act 3 — the problem + entry point */}
        <motion.div
          className={styles.problem}
          style={reduced ? undefined : { opacity: p3, y: p3y }}
          data-ready={reduced || problemReady}
        >
          <h2 className={styles.problemTitle}>{t("problem.title")}</h2>
          <p className={styles.problemBody}>{t("problem.body")}</p>
          <button type="button" className={styles.tryBtn} onClick={openDemo}>
            {t("problem.cta")}
          </button>
        </motion.div>
      </div>

      {/* Acts 4–7 — full-screen interactive demo takeover */}
      <AnimatePresence>
        {demo && (
          <motion.div
            className={styles.takeover}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("problem.cta")}
          >
            <button
              type="button"
              className={styles.close}
              onClick={closeDemo}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <PhoneDemo onExplore={explore} reduced={reduced} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
