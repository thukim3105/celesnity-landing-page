import { test } from "node:test";
import assert from "node:assert/strict";
import { toMaskAlpha } from "./bake-hero-masks.mjs";

test("near-black background pixel becomes fully transparent", () => {
  // #05060F-ish — the source wash
  assert.equal(toMaskAlpha(5, 6, 15), 0);
});

test("bright blue/cyan stroke becomes mostly opaque", () => {
  assert.ok(toMaskAlpha(120, 160, 255) > 180, "bright stroke should be > 180 alpha");
});

test("output is clamped to the 0–255 range", () => {
  assert.equal(toMaskAlpha(255, 255, 255), 255);
  assert.equal(toMaskAlpha(0, 0, 0), 0);
});
