// Pure, DOM-free math for the hero label-reveal. Plain ESM so it runs directly
// under `node --test` (matches scripts/*.test.mjs) and imports cleanly into the
// TSX components (tsconfig allowJs). No React, no window.

/** Clamp n into [min, max]. */
export function clamp(n, min, max) {
  const result = n < min ? min : n > max ? max : n;
  return result === 0 ? 0 : result; // normalize -0 to 0
}

/**
 * Scroll progress of the pinned hero section: 0 (just pinned) -> 1 (about to
 * release). Derived from the section's top offset vs. how far it can scroll
 * while its sticky stage stays pinned (sectionHeight - viewportHeight).
 * @param {number} rectTop     section.getBoundingClientRect().top
 * @param {number} rectHeight  section height in px
 * @param {number} viewportH   viewport height in px
 * @returns {number} 0..1
 */
export function computeProgress(rectTop, rectHeight, viewportH) {
  const scrollable = rectHeight - viewportH;
  if (scrollable <= 0) return 0;
  const progress = -rectTop / scrollable;
  return clamp(progress, 0, 1);
}

/**
 * How far the hero content is through its exit: 0 (fully shown) -> 1 (fully
 * hidden), reaching 1 at `p1End`. Caller maps this to opacity (1 - t) and an
 * upward translate (t * rise).
 * @returns {number} 0..1
 */
export function contentHideT(progress, p1End) {
  if (p1End <= 0) return progress > 0 ? 1 : 0;
  return clamp(progress / p1End, 0, 1);
}

/**
 * Labels revealed by SCROLL position, 0..count. Zero until phase 2 begins
 * (p2Start); reaches `count` by p2End.
 * @returns {number} integer 0..count
 */
export function scrollRevealCount(progress, count, p2Start, p2End) {
  if (progress <= p2Start) return 0;
  const span = p2End - p2Start;
  if (span <= 0) return count;
  const t = clamp((progress - p2Start) / span, 0, 1);
  return clamp(Math.ceil(t * count), 0, count);
}

/**
 * Labels revealed by the AUTO TIMER, 0..count. One more every `intervalMs` of
 * elapsed phase-2 time.
 * @returns {number} integer 0..count
 */
export function timerRevealCount(elapsedMs, count, intervalMs) {
  if (intervalMs <= 0) return count;
  return clamp(Math.floor(elapsedMs / intervalMs), 0, count);
}

/**
 * Combined reveal count: whichever source (scroll/timer) is further along,
 * capped at count.
 * @returns {number} integer 0..count
 */
export function revealCount(scrollCount, timerCount, count) {
  return clamp(Math.max(scrollCount, timerCount), 0, count);
}

/**
 * Centre of an anchor's client rect expressed as a percent of the stage box,
 * so a label can be placed with left/top %. Rects are `{left, top, width,
 * height}` (DOMRect-shaped).
 * @returns {{ left: number, top: number }}
 */
export function toStagePercent(anchorRect, stageRect) {
  if (stageRect.width === 0 || stageRect.height === 0) return { left: 0, top: 0 };
  const cx = anchorRect.left + anchorRect.width / 2 - stageRect.left;
  const cy = anchorRect.top + anchorRect.height / 2 - stageRect.top;
  return {
    left: (cx / stageRect.width) * 100,
    top: (cy / stageRect.height) * 100,
  };
}
