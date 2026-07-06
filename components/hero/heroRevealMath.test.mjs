import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  computeProgress,
  contentHideT,
  scrollRevealCount,
  timerRevealCount,
  revealCount,
  toStagePercent,
} from "./heroRevealMath.mjs";

test("clamp bounds a value", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});

test("computeProgress: 0 when just pinned, 1 at the end, clamped", () => {
  // section 2400px tall, viewport 1000px -> scrollable 1400px
  assert.equal(computeProgress(0, 2400, 1000), 0);
  assert.equal(computeProgress(-700, 2400, 1000), 0.5);
  assert.equal(computeProgress(-1400, 2400, 1000), 1);
  assert.equal(computeProgress(-9999, 2400, 1000), 1); // clamps high
  assert.equal(computeProgress(500, 2400, 1000), 0); // clamps low
});

test("computeProgress: guards a section shorter than the viewport", () => {
  assert.equal(computeProgress(-10, 800, 1000), 0);
});

test("contentHideT: 0 while shown, reaches 1 at p1End", () => {
  assert.equal(contentHideT(0, 0.3), 0);
  assert.equal(contentHideT(0.15, 0.3), 0.5);
  assert.equal(contentHideT(0.3, 0.3), 1);
  assert.equal(contentHideT(0.9, 0.3), 1); // stays hidden past p1End
});

test("scrollRevealCount: 0 before phase 2, count at/after p2End", () => {
  assert.equal(scrollRevealCount(0.1, 5, 0.32, 0.85), 0);
  assert.equal(scrollRevealCount(0.32, 5, 0.32, 0.85), 0);
  assert.equal(scrollRevealCount(0.85, 5, 0.32, 0.85), 5);
  assert.equal(scrollRevealCount(1, 5, 0.32, 0.85), 5);
  // just past the start reveals exactly the first box
  assert.equal(scrollRevealCount(0.33, 5, 0.32, 0.85), 1);
});

test("timerRevealCount: one more per interval, capped at count", () => {
  assert.equal(timerRevealCount(0, 5, 900), 0);
  assert.equal(timerRevealCount(899, 5, 900), 0);
  assert.equal(timerRevealCount(900, 5, 900), 1);
  assert.equal(timerRevealCount(4500, 5, 900), 5);
  assert.equal(timerRevealCount(99999, 5, 900), 5);
});

test("revealCount: whichever source is further, capped", () => {
  assert.equal(revealCount(2, 4, 5), 4);
  assert.equal(revealCount(5, 1, 5), 5);
  assert.equal(revealCount(9, 9, 5), 5);
  assert.equal(revealCount(0, 0, 5), 0);
});

test("toStagePercent: centre of an anchor rect as a percent of the stage", () => {
  const stageRect = { left: 100, top: 200, width: 1000, height: 500 };
  const anchorRect = { left: 590, top: 440, width: 20, height: 20 };
  // centre = (600, 450); relative = (500, 250); percent = (50%, 50%)
  assert.deepEqual(toStagePercent(anchorRect, stageRect), { left: 50, top: 50 });
});
