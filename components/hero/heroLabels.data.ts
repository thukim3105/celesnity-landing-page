/**
 * Anchor points for the conveyor boxes, in the backdrop mask's NATIVE
 * 1536x1024 space (matches /hero/mask-interior.png). They are rendered through
 * an SVG overlay with preserveAspectRatio="xMidYMid slice", the exact SVG
 * equivalent of the backdrop's `center / cover`, so the labels track the boxes
 * across viewport aspect ratios.
 *
 * Order = nearest -> farthest. Index 4 (the farthest, smallest box) is the
 * ellipsis-only card. These are initial estimates tuned by eye against the
 * line-art in Task 5 — adjust live in the browser.
 */
export const BOX_ANCHORS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 470, y: 640 }, // 1 - large, lower-left (nearest)
  { x: 900, y: 470 }, // 2
  { x: 1085, y: 405 }, // 3
  { x: 1220, y: 365 }, // 4
  { x: 1320, y: 335 }, // 5 - smallest (ellipsis card, farthest)
];

/** Total labels including the trailing ellipsis card. */
export const TOTAL_BOXES = BOX_ANCHORS.length; // 5
