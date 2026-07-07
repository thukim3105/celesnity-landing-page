// Pure, DOM-free timeline for the hero Scene-1 ending + Scene-2 transition.
// Plain ESM so it runs under `node --test` and imports into the TSX component
// (tsconfig allowJs), matching heroRevealMath.mjs / wasteCounter.mjs.

/** ms since all labels are shown → when the message replaces the labels. */
export const OUTRO_MESSAGE_MS = 1500;
/** → when the "Try Minder AI" CTA appears. */
export const OUTRO_CTA_MS = 2800;
/** → when the auto-click effect plays on the CTA. */
export const OUTRO_CLICK_MS = 4500;
/** → when Scene 1 crossfades to Scene 2. */
export const OUTRO_SCENE2_MS = 5400;

/**
 * Map elapsed time (ms, since all labels were revealed) to a timeline step:
 *   0 = labels/counter shown, 1 = message, 2 = CTA, 3 = auto-click, 4 = Scene 2.
 * @param {number} elapsedMs
 * @returns {0|1|2|3|4}
 */
export function outroStep(elapsedMs) {
  if (elapsedMs < OUTRO_MESSAGE_MS) return 0;
  if (elapsedMs < OUTRO_CTA_MS) return 1;
  if (elapsedMs < OUTRO_CLICK_MS) return 2;
  if (elapsedMs < OUTRO_SCENE2_MS) return 3;
  return 4;
}
