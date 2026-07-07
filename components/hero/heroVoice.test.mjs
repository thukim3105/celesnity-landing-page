import { test } from "node:test";
import assert from "node:assert/strict";
import { holdProgress, revealedByTime } from "./heroVoice.mjs";

test("holdProgress: 0..1 fill of the press-and-hold ring", () => {
  assert.equal(holdProgress(0, 1000), 0);
  assert.equal(holdProgress(500, 1000), 0.5);
  assert.equal(holdProgress(1000, 1000), 1);
  assert.equal(holdProgress(2000, 1000), 1); // clamps
  assert.equal(holdProgress(-50, 1000), 0); // clamps
});

test("holdProgress: guards a non-positive hold duration", () => {
  assert.equal(holdProgress(10, 0), 1);
  assert.equal(holdProgress(0, 0), 0);
});

test("revealedByTime: one item per interval, clamped to total", () => {
  assert.equal(revealedByTime(0, 3, 500), 0);
  assert.equal(revealedByTime(499, 3, 500), 0);
  assert.equal(revealedByTime(500, 3, 500), 1);
  assert.equal(revealedByTime(1500, 3, 500), 3);
  assert.equal(revealedByTime(9999, 3, 500), 3); // clamps
});

test("revealedByTime: guards a non-positive interval", () => {
  assert.equal(revealedByTime(0, 4, 0), 4);
});
