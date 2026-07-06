import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (name) =>
  JSON.parse(readFileSync(new URL(`./messages/${name}.json`, import.meta.url)));

for (const name of ["en", "vi"]) {
  test(`${name}: HeroLabels has field labels and 4 well-formed boxes`, () => {
    const hl = load(name).HeroLabels;
    assert.ok(hl, "HeroLabels namespace exists");
    assert.ok(hl.codeLabel && hl.qtyLabel, "field labels present");
    assert.equal(hl.boxes.length, 4, "exactly 4 data boxes");
    for (const b of hl.boxes) {
      assert.ok(b.name && b.code && b.qty, "each box has name/code/qty");
    }
  });
}
