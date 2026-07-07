import { test } from "node:test";
import assert from "node:assert/strict";
import { SECONDS, formatDuration } from "./wasteCounter.mjs";

test("SECONDS accumulates +45s per carton, then jumps for the ellipsis card", () => {
  assert.deepEqual(SECONDS, [0, 45, 90, 135, 180, 4320]);
});

test("formatDuration: m:ss under an hour", () => {
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(45), "0:45");
  assert.equal(formatDuration(90), "1:30");
  assert.equal(formatDuration(135), "2:15");
  assert.equal(formatDuration(180), "3:00");
});

test("formatDuration: h:mm:ss at or over an hour, zero-padded", () => {
  assert.equal(formatDuration(4320), "1:12:00");
  assert.equal(formatDuration(3600), "1:00:00");
  assert.equal(formatDuration(3661), "1:01:01");
});
