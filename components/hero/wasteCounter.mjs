// Pure, DOM-free data + formatting for the hero "data-entry time" waste counter.
// Plain ESM so it runs under `node --test` and imports into the TSX component
// (tsconfig allowJs), matching the heroRevealMath.mjs pattern.

/**
 * Accumulated "manual data-entry time", in seconds, indexed by how many carton
 * labels are revealed (0..5). +45s per carton for the first four; the fifth
 * ("…") card jumps past an hour to imply a whole backlog.
 */
export const SECONDS = [0, 45, 90, 135, 180, 4320];

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Format a duration in seconds as `m:ss`, or `h:mm:ss` once it reaches an hour.
 * Minutes and seconds are zero-padded to two digits when an hour is present;
 * under an hour the leading minutes value is unpadded (e.g. "3:00").
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
    : `${minutes}:${pad2(seconds)}`;
}
