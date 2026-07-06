"use client";

import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import styles from "./CartonScene.module.css";

/** Layout + timing data for each addressable carton. x/y are % of the stage;
 *  w is the box width in px; depth drives the mouse-look parallax amount.
 *  entry (data-entry time) is the "expensive" figure the story is about. */
const BOXES = [
  { id: "A-72", x: 15, y: 60, w: 168, depth: 40, pack: "0:38", check: "0:52", entry: "1:24" },
  { id: "A-73", x: 39, y: 70, w: 208, depth: 22, pack: "0:44", check: "1:03", entry: "2:11" },
  { id: "B-15", x: 64, y: 58, w: 150, depth: 54, pack: "0:31", check: "0:47", entry: "1:39" },
  { id: "B-19", x: 84, y: 71, w: 128, depth: 14, pack: "0:41", check: "0:58", entry: "1:52" },
] as const;

/** Total data-entry minutes the HUD counts up to across act 2. */
const TOTAL_MIN = 187;

function IsoBox({ className }: { className?: string }) {
  // A simple cardboard carton in 2.5D line-art. Stroke = currentColor so it
  // flips with the DS theme; faint faces keep it reading as a backdrop drawing.
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="round">
        {/* faces */}
        <polygon points="50,6 94,28 50,50 6,28" className={styles.faceTop} />
        <polygon points="6,28 50,50 50,94 6,72" className={styles.faceLeft} />
        <polygon points="94,28 50,50 50,94 94,72" className={styles.faceRight} />
        {/* tape seam across the top + down the front */}
        <path d="M28 17 L72 39 M50 50 L50 94" className={styles.seam} />
      </g>
    </svg>
  );
}

function Carton({
  box,
  index,
  p2,
}: {
  box: (typeof BOXES)[number];
  index: number;
  p2: MotionValue<number>;
}) {
  const t = useTranslations("HeroSequence");
  // Stagger each box's label reveal across act-2 progress.
  const start = 0.06 + index * 0.16;
  const reveal = useTransform(p2, [start, start + 0.42], [0, 1], { clamp: true });
  const labelY = useTransform(reveal, [0, 1], [14, 0]);
  const cartonOpacity = useTransform(reveal, [0, 1], [0.42, 1]);

  return (
    <div
      className={styles.carton}
      style={
        {
          left: `${box.x}%`,
          top: `${box.y}%`,
          width: `${box.w}px`,
          ["--depth" as string]: box.depth,
        } as React.CSSProperties
      }
    >
      <div className={styles.cartonInner}>
        <motion.div className={styles.boxWrap} style={{ opacity: cartonOpacity }}>
          <IsoBox className={styles.box} />
        </motion.div>

        <motion.div
          className={styles.label}
          style={{ opacity: reveal, y: labelY }}
        >
          <span className={styles.labelId}>{box.id}</span>
          <span className={styles.labelRow}>
            <span className={styles.labelKey}>{t("cartons.packing")}</span>
            <span className={styles.labelVal}>{box.pack}</span>
          </span>
          <span className={styles.labelRow}>
            <span className={styles.labelKey}>{t("cartons.inspection")}</span>
            <span className={styles.labelVal}>{box.check}</span>
          </span>
          <span className={`${styles.labelRow} ${styles.labelRowHot}`}>
            <span className={styles.labelKey}>{t("cartons.dataEntry")}</span>
            <span className={styles.labelVal}>{box.entry}</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export function CartonScene({ p2 }: { p2: MotionValue<number> }) {
  const t = useTranslations("HeroSequence");

  const minutes = useTransform(p2, [0, 1], [0, TOTAL_MIN]);
  const hud = useTransform(
    minutes,
    (v) => `${Math.floor(v / 60)}h ${String(Math.floor(v % 60)).padStart(2, "0")}m`,
  );
  const hudOpacity = useTransform(p2, [0, 0.12], [0, 1], { clamp: true });

  return (
    <div className={styles.scene} aria-hidden>
      {/* Line-art factory backdrop — reuses the existing hero mask fill. */}
      <div className={styles.backdrop}>
        <div className={styles.backdropFill} />
      </div>

      {/* Foreground addressable cartons. */}
      <div className={styles.cartons}>
        {BOXES.map((box, i) => (
          <Carton key={box.id} box={box} index={i} p2={p2} />
        ))}
      </div>

      {/* Corner HUD — the running cost of manual data entry. */}
      <motion.div className={styles.hud} style={{ opacity: hudOpacity }}>
        <span className={styles.hudLabel}>{t("hud.label")}</span>
        <motion.span className={styles.hudValue}>{hud}</motion.span>
        <span className={styles.hudUnit}>{t("hud.unit")}</span>
      </motion.div>
    </div>
  );
}
