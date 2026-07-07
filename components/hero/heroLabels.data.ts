/**
 * Anchor points for the conveyor boxes, in the backdrop mask's NATIVE
 * 1536x1024 space (matches /hero/mask-interior.png). They are rendered through
 * an SVG overlay with preserveAspectRatio="xMidYMid slice", the exact SVG
 * equivalent of the backdrop's `center / cover`, so the labels track the boxes
 * across viewport aspect ratios.
 *
 * Order = nearest -> farthest. Index 4 (the farthest, smallest box) is the
 * ellipsis-only card. Each point is the intersection of the diagonals of that
 * carton's TOP face (its lid centre), so the label's leg + dot lands on the box
 * top. Measured against the line-art in native mask space; nudge live if needed.
 */
export const BOX_ANCHORS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 413, y: 712 }, // 1 - large, lower-left (nearest)
  { x: 796, y: 581 }, // 2
  { x: 982, y: 517 }, // 3
  { x: 1100, y: 479 }, // 4
  { x: 1158, y: 463 }, // 5 - smallest (ellipsis card, farthest)
];

/** Total labels including the trailing ellipsis card. */
export const TOTAL_BOXES = BOX_ANCHORS.length; // 5
