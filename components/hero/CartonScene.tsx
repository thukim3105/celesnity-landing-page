"use client";

import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import styles from "./CartonScene.module.css";

/** Real cartons on the conveyor in the hero art (public/hero/mask-interior.png).
 *  bx/by = the box's anchor point; cx/cy = where its info card sits — both as %
 *  of the fixed-ratio scene canvas, so a leader line links card → box and stays
 *  aligned under `cover`. "full" shows the packing/inspection/data-entry
 *  breakdown; "brief" shows the box id + its (expensive) data-entry time. */
const BOXES = [
  { id: "A-72", bx: 31, by: 66, cx: 15, cy: 33, variant: "full", pack: "0:38", check: "0:52", entry: "1:24" },
  { id: "A-73", bx: 50, by: 59, cx: 35, cy: 25, variant: "brief", entry: "2:11" },
  { id: "B-15", bx: 58, by: 49, cx: 64, cy: 23, variant: "brief", entry: "1:39" },
  { id: "B-19", bx: 67, by: 45, cx: 83, cy: 30, variant: "brief", entry: "1:52" },
] as const;

/** Total data-entry minutes the HUD counts up to across act 2. */
const TOTAL_MIN = 187;

function Box({
  box,
  index,
  p2,
}: {
  box: (typeof BOXES)[number];
  index: number;
  p2: MotionValue<number>;
}) {
  const t = useTranslations("HeroSequence");
  const start = 0.05 + index * 0.15;
  const reveal = useTransform(p2, [start, start + 0.4], [0, 1], { clamp: true });
  const cardY = useTransform(reveal, [0, 1], [10, 0]);
  const ringScale = useTransform(reveal, [0, 1], [0.4, 1]);

  return (
    <>
      {/* leader line: box → card */}
      <svg className={styles.leader} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <motion.line
          x1={box.cx}
          y1={box.cy}
          x2={box.bx}
          y2={box.by}
          className={styles.leaderLine}
          style={{ opacity: reveal }}
        />
      </svg>

      {/* hotspot on the box */}
      <div className={styles.hotspot} style={{ left: `${box.bx}%`, top: `${box.by}%` }}>
        <motion.span className={styles.ring} style={{ opacity: reveal, scale: ringScale }} />
        <motion.span className={styles.dot} style={{ opacity: reveal }} />
      </div>

      {/* info card */}
      <motion.div
        className={styles.card}
        style={{ left: `${box.cx}%`, top: `${box.cy}%`, opacity: reveal, y: cardY }}
      >
        <span className={styles.cardId}>{box.id}</span>
        {box.variant === "full" ? (
          <>
            <span className={styles.row}>
              <span className={styles.rowKey}>{t("cartons.packing")}</span>
              <span className={styles.rowVal}>{box.pack}</span>
            </span>
            <span className={styles.row}>
              <span className={styles.rowKey}>{t("cartons.inspection")}</span>
              <span className={styles.rowVal}>{box.check}</span>
            </span>
            <span className={`${styles.row} ${styles.rowHot}`}>
              <span className={styles.rowKey}>{t("cartons.dataEntry")}</span>
              <span className={styles.rowVal}>{box.entry}</span>
            </span>
          </>
        ) : (
          <span className={`${styles.row} ${styles.rowHot} ${styles.rowLead}`}>
            <span className={styles.rowKey}>{t("cartons.dataEntry")}</span>
            <span className={styles.rowVal}>{box.entry}</span>
          </span>
        )}
      </motion.div>
    </>
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
      {/* Fixed-ratio canvas: image + anchored annotations scale/crop together. */}
      <div className={styles.canvas}>
        <div className={styles.backdropFill} />
        {BOXES.map((box, i) => (
          <Box key={box.id} box={box} index={i} p2={p2} />
        ))}
      </div>

      {/* Corner HUD — the running cost of manual data entry (UI, not parallaxed). */}
      <motion.div className={styles.hud} style={{ opacity: hudOpacity }}>
        <span className={styles.hudLabel}>{t("hud.label")}</span>
        <motion.span className={styles.hudValue}>{hud}</motion.span>
        <span className={styles.hudUnit}>{t("hud.unit")}</span>
      </motion.div>
    </div>
  );
}
