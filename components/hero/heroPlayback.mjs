// Pure, DOM-free playhead math for the scrubbable hero. A single time value `t`
// (ms) drives label reveal + the outro steps, so scrolling can scrub forward or
// back and the state is always a pure function of `t`. Plain ESM (node --test).

import { clamp } from "./heroRevealMath.mjs";
import { outroStep, OUTRO_SCENE4_MS } from "./heroOutro.mjs";

/** ms between consecutive label reveals. */
export const LABEL_MS = 900;

/** Playhead time by which every label is shown. */
export function labelsDone(count) {
  return Math.max(0, (count - 1) * LABEL_MS);
}

/** End of the scrubbable playhead — where Scene 4 (the voice station) begins. */
export function playheadEnd(count) {
  return labelsDone(count) + OUTRO_SCENE4_MS;
}

/**
 * Labels revealed at playhead `t`: the first at t=0, then one every LABEL_MS,
 * capped at `count`.
 * @returns {number} 0..count
 */
export function labelsAt(t, count) {
  if (t <= 0) return count > 0 ? 1 : 0;
  return clamp(1 + Math.floor(t / LABEL_MS), 0, count);
}

/**
 * Outro step at playhead `t`: 0 while the labels are still revealing, then the
 * message/CTA/click/scene steps (1..6) once all labels are shown.
 * @returns {number} 0..6
 */
export function stepAt(t, count) {
  const d = t - labelsDone(count);
  return d < 0 ? 0 : outroStep(d);
}

/** Move the playhead by a scroll delta (px * gain), clamped to [0, end]. */
export function scrub(t, deltaY, gain, end) {
  return clamp(t + deltaY * gain, 0, end);
}

/** Advance the playhead by dt ms (auto-play), clamped to [0, end]. */
export function advance(t, dtMs, end) {
  return clamp(t + dtMs, 0, end);
}
