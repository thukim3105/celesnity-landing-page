// Pure, DOM-free timeline for the hero Scene-1 ending + Scene-2 transition.
// Plain ESM so it runs under `node --test` and imports into the TSX component
// (tsconfig allowJs), matching heroRevealMath.mjs / wasteCounter.mjs.

/** ms since all labels are shown → when the message replaces the labels. */
export const OUTRO_MESSAGE_MS = 2500;
/** → when the "Try Minder AI" CTA appears (message lingers a while first). */
export const OUTRO_CTA_MS = 5000;
/** → when the auto-click effect plays on the CTA. */
export const OUTRO_CLICK_MS = 7000;
/** → when Scene 1 crossfades to Scene 2 ("installing…"). */
export const OUTRO_SCENE2_MS = 8200;
/** → when Scene 2 crossfades to Scene 3 ("configuring…"). */
export const OUTRO_SCENE3_MS = 11200;

/**
 * Map elapsed time (ms, since all labels were revealed) to a timeline step:
 *   0 = labels/counter, 1 = message, 2 = CTA, 3 = auto-click,
 *   4 = Scene 2 (installing), 5 = Scene 3 (configuring).
 * @param {number} elapsedMs
 * @returns {0|1|2|3|4|5}
 */
export function outroStep(elapsedMs) {
  if (elapsedMs < OUTRO_MESSAGE_MS) return 0;
  if (elapsedMs < OUTRO_CTA_MS) return 1;
  if (elapsedMs < OUTRO_CLICK_MS) return 2;
  if (elapsedMs < OUTRO_SCENE2_MS) return 3;
  if (elapsedMs < OUTRO_SCENE3_MS) return 4;
  return 5;
}
