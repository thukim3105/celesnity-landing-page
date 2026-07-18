// Pure, DOM-free helpers for the Scene-4 voice-to-form demo. Plain ESM so it
// runs under `node --test` and imports into the TSX component (tsconfig allowJs).

import { clamp } from "./heroRevealMath.mjs";

/**
 * Fill of the press-and-hold ring, 0..1, over `holdMs`.
 * @param {number} elapsedMs  ms the mic has been held
 * @param {number} holdMs     required hold duration
 * @returns {number} 0..1
 */
export function holdProgress(elapsedMs, holdMs) {
  if (holdMs <= 0) return elapsedMs > 0 ? 1 : 0;
  return clamp(elapsedMs / holdMs, 0, 1);
}

/**
 * How many items (transcript chunks, or form fields) have been revealed by
 * `elapsedMs`, one every `perMs`, clamped to `total`.
 * @returns {number} integer 0..total
 */
export function revealedByTime(elapsedMs, total, perMs) {
  if (perMs <= 0) return total;
  return clamp(Math.floor(elapsedMs / perMs), 0, total);
}
