import { test } from "node:test";
import assert from "node:assert/strict";
import {
  outroStep,
  OUTRO_MESSAGE_MS,
  OUTRO_CTA_MS,
  OUTRO_CLICK_MS,
  OUTRO_SCENE2_MS,
  OUTRO_SCENE3_MS,
  OUTRO_SCENE4_MS,
} from "./heroOutro.mjs";

test("thresholds are ordered and match the timeline", () => {
  assert.ok(
    0 < OUTRO_MESSAGE_MS &&
      OUTRO_MESSAGE_MS < OUTRO_CTA_MS &&
      OUTRO_CTA_MS < OUTRO_CLICK_MS &&
      OUTRO_CLICK_MS < OUTRO_SCENE2_MS &&
      OUTRO_SCENE2_MS < OUTRO_SCENE3_MS &&
      OUTRO_SCENE3_MS < OUTRO_SCENE4_MS,
  );
});

test("outroStep maps elapsed time to the right step", () => {
  assert.equal(outroStep(0), 0);
  assert.equal(outroStep(OUTRO_MESSAGE_MS - 1), 0);
  assert.equal(outroStep(OUTRO_MESSAGE_MS), 1);
  assert.equal(outroStep(OUTRO_CTA_MS - 1), 1);
  assert.equal(outroStep(OUTRO_CTA_MS), 2);
  assert.equal(outroStep(OUTRO_CLICK_MS - 1), 2);
  assert.equal(outroStep(OUTRO_CLICK_MS), 3);
  assert.equal(outroStep(OUTRO_SCENE2_MS - 1), 3);
  assert.equal(outroStep(OUTRO_SCENE2_MS), 4);
  assert.equal(outroStep(OUTRO_SCENE3_MS - 1), 4);
  assert.equal(outroStep(OUTRO_SCENE3_MS), 5);
  assert.equal(outroStep(OUTRO_SCENE4_MS - 1), 5);
  assert.equal(outroStep(OUTRO_SCENE4_MS), 6);
  assert.equal(outroStep(999999), 6);
});

test("outroStep clamps negative elapsed to step 0", () => {
  assert.equal(outroStep(-100), 0);
});
