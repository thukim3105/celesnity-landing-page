import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LABEL_MS,
  labelsAt,
  labelsDone,
  playheadEnd,
  stepAt,
  scrub,
  advance,
} from "./heroPlayback.mjs";
import {
  OUTRO_MESSAGE_MS,
  OUTRO_SCENE4_MS,
} from "./heroOutro.mjs";

test("labelsAt: one label per LABEL_MS, first at t=0, clamped to count", () => {
  assert.equal(labelsAt(0, 5), 1);
  assert.equal(labelsAt(LABEL_MS - 1, 5), 1);
  assert.equal(labelsAt(LABEL_MS, 5), 2);
  assert.equal(labelsAt(4 * LABEL_MS, 5), 5);
  assert.equal(labelsAt(99999, 5), 5);
});

test("labelsDone / playheadEnd", () => {
  assert.equal(labelsDone(5), 4 * LABEL_MS);
  assert.equal(playheadEnd(5), 4 * LABEL_MS + OUTRO_SCENE4_MS);
});

test("stepAt: 0 while labels reveal, then the outro steps", () => {
  assert.equal(stepAt(0, 5), 0);
  assert.equal(stepAt(labelsDone(5) - 1, 5), 0);
  assert.equal(stepAt(labelsDone(5), 5), 0); // outro elapsed 0 -> step 0
  assert.equal(stepAt(labelsDone(5) + OUTRO_MESSAGE_MS, 5), 1);
  assert.equal(stepAt(labelsDone(5) + OUTRO_SCENE4_MS, 5), 6); // Scene 4 edge
});

test("scrub: delta moves the playhead, clamped to [0, end]", () => {
  assert.equal(scrub(100, 50, 6, 1000), 400);
  assert.equal(scrub(0, -50, 6, 1000), 0);
  assert.equal(scrub(1000, 50, 6, 1000), 1000);
});

test("advance: adds dt, clamped to [0, end]", () => {
  assert.equal(advance(100, 200, 1000), 300);
  assert.equal(advance(950, 200, 1000), 1000);
  assert.equal(advance(-50, 10, 1000), 0); // -40 clamps up to 0
});
