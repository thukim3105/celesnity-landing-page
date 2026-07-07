"use client";

import { useEffect, useRef, useState } from "react";
import { LabelCard } from "./LabelCard";
import { BOX_ANCHORS } from "./heroLabels.data";
import { toStagePercent } from "./heroRevealMath.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./HeroLabels.module.css";

type HeroLabelsProps = {
  stageRef: React.RefObject<HTMLDivElement | null>;
  boxes: LabelBox[]; // 4 data boxes; a 5th ellipsis card is appended
  codeLabel: string;
  qtyLabel: string;
  visibleCount: number; // 0..TOTAL_BOXES
};

/**
 * The label overlay. An invisible SVG (sliced to match the backdrop's cover
 * scaling) carries one anchor per box; on mount/resize we read each anchor's
 * screen position and place a fixed-size card there. Card text does NOT scale
 * with the backdrop, so it stays readable. `visibleCount` gates which cards show.
 */
export function HeroLabels({
  stageRef,
  boxes,
  codeLabel,
  qtyLabel,
  visibleCount,
}: HeroLabelsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<{ left: number; top: number }[]>(
    [],
  );

  useEffect(() => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage) return;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const anchors = Array.from(svg.querySelectorAll("[data-anchor]"));
      setPositions(
        anchors.map((a) => toStagePercent(a.getBoundingClientRect(), stageRect)),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef]);

  return (
    <div className={styles.layer} aria-hidden="true">
      <svg
        ref={svgRef}
        className={styles.anchorSvg}
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMid slice"
      >
        {BOX_ANCHORS.map((p, i) => (
          <circle key={i} data-anchor="" cx={p.x} cy={p.y} r={1} fill="none" />
        ))}
      </svg>

      {positions.map((pos, i) => {
        const isEllipsis = i >= boxes.length; // index 4 -> ellipsis
        const box = boxes[i];
        return (
          <LabelCard
            key={i}
            left={pos.left}
            top={pos.top}
            z={positions.length - i}
            shown={i < visibleCount}
            ellipsis={isEllipsis}
            name={box?.name}
            code={box?.code}
            qty={box?.qty}
            codeLabel={codeLabel}
            qtyLabel={qtyLabel}
          />
        );
      })}
    </div>
  );
}
