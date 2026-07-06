"use client";

import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import styles from "./CartonScene.module.css";

/** The speech-bubble callouts from the hero art — recreated as addressable
 *  vector/HTML so each can hold a carton's detail and fill in on scroll.
 *  x/y are % of the stage (matched to the hero.png layout); w is bubble width.
 *  "full" bubbles show the packing/inspection/data-entry breakdown; "brief"
 *  bubbles show just the box id + its (expensive) data-entry time. */
const BUBBLES = [
  { id: "A-72", x: 21, y: 61, w: 236, depth: 26, variant: "full", pack: "0:38", check: "0:52", entry: "1:24" },
  { id: "A-73", x: 50, y: 36, w: 168, depth: 40, variant: "brief", entry: "2:11" },
  { id: "B-15", x: 65, y: 41, w: 150, depth: 52, variant: "brief", entry: "1:39" },
  { id: "B-19", x: 77, y: 46, w: 138, depth: 64, variant: "brief", entry: "1:52" },
] as const;

/** Total data-entry minutes the HUD counts up to across act 2. */
const TOTAL_MIN = 187;

function Bubble({
  bubble,
  index,
  p2,
}: {
  bubble: (typeof BUBBLES)[number];
  index: number;
  p2: MotionValue<number>;
}) {
  const t = useTranslations("HeroSequence");
  // Stagger each bubble's content fill across act-2 progress.
  const start = 0.05 + index * 0.15;
  const reveal = useTransform(p2, [start, start + 0.4], [0, 1], { clamp: true });
  const contentY = useTransform(reveal, [0, 1], [8, 0]);

  return (
    <div
      className={styles.bubble}
      style={
        {
          left: `${bubble.x}%`,
          top: `${bubble.y}%`,
          width: `${bubble.w}px`,
          ["--depth" as string]: bubble.depth,
        } as React.CSSProperties
      }
    >
      <motion.div className={styles.bubbleContent} style={{ opacity: reveal, y: contentY }}>
        <span className={styles.bubbleId}>{bubble.id}</span>

        {bubble.variant === "full" ? (
          <>
            <span className={styles.row}>
              <span className={styles.rowKey}>{t("cartons.packing")}</span>
              <span className={styles.rowVal}>{bubble.pack}</span>
            </span>
            <span className={styles.row}>
              <span className={styles.rowKey}>{t("cartons.inspection")}</span>
              <span className={styles.rowVal}>{bubble.check}</span>
            </span>
            <span className={`${styles.row} ${styles.rowHot}`}>
              <span className={styles.rowKey}>{t("cartons.dataEntry")}</span>
              <span className={styles.rowVal}>{bubble.entry}</span>
            </span>
          </>
        ) : (
          <span className={`${styles.row} ${styles.rowHot} ${styles.rowLead}`}>
            <span className={styles.rowKey}>{t("cartons.dataEntry")}</span>
            <span className={styles.rowVal}>{bubble.entry}</span>
          </span>
        )}
      </motion.div>
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

      {/* Foreground addressable callout bubbles. */}
      <div className={styles.bubbles}>
        {BUBBLES.map((bubble, i) => (
          <Bubble key={bubble.id} bubble={bubble} index={i} p2={p2} />
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
