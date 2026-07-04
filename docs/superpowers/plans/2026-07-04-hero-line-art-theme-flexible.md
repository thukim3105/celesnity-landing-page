# Hero line-art theme-flexible Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero backdrop follow the Cosmos/Daybreak theme by masking the two wireframe images with their own line art and driving line + background colors from DS tokens.

**Architecture:** Bake each source PNG into a white-line-on-transparent alpha mask. Each hero layer becomes a solid `var(--hero-line)` fill clipped by its mask; the backdrop behind is `var(--hero-bg)`. Both tokens flip via `[data-theme]`, so the whole hero switches light/dark. The scroll crossfade/zoom (rAF + custom props) is untouched.

**Tech Stack:** Next.js 16 (App Router), React 19, CSS Modules, `sharp` 0.34.5 (already installed) for the bake script, `node:test` for the unit test.

## Global Constraints

- **Never modify anything in `Celesnity Design System Gradient/`** — read-only. All new tokens go in `app/globals.css`.
- Reference **semantic DS tokens only** — no raw hex in component/CSS code. New tokens may only compose existing DS tokens (`--starlight`, `--ink`, `--cosmic-black`, `--cloud-white`, `--hero-bg`, `--hero-text`, `--hero-lead`).
- Theme selectors are `:root, [data-theme="dark"]` (Cosmos, default) and `[data-theme="light"]` (Daybreak). `<html>` defaults to `data-theme="dark"`.
- No emoji anywhere. Calm motion only. Keep the existing rAF scroll logic and its four custom props (`--l1-op`, `--l1-sc`, `--l2-op`, `--l2-sc`) unchanged.
- Source mask inputs live at project root: `bg (2).png` (worm's-eye) and `in-factory.png` (interior). Outputs go to `public/hero/`.

---

### Task 1: Bake alpha masks from the two source PNGs

**Files:**
- Create: `scripts/bake-hero-masks.mjs`
- Test: `scripts/bake-hero-masks.test.mjs`
- Produces (generated, committed): `public/hero/mask-worm.png`, `public/hero/mask-interior.png`

**Interfaces:**
- Consumes: nothing (first task).
- Produces:
  - `toMaskAlpha(r, g, b, gain?, offset?): number` — pure fn, returns an 8-bit alpha (0–255) from an sRGB pixel. Defaults `gain = 3.6`, `offset = 40`.
  - Two PNG artifacts at the paths above (white RGB, alpha = `toMaskAlpha`).

- [ ] **Step 1: Write the failing test**

Create `scripts/bake-hero-masks.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/bake-hero-masks.test.mjs`
Expected: FAIL — cannot resolve `toMaskAlpha` (module has no such export yet).

- [ ] **Step 3: Write the script with the pure function + a guarded bake runner**

Create `scripts/bake-hero-masks.mjs`:

```js
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * sRGB pixel -> alpha for a line mask. Rec.709 luminance, then a gain/offset
 * curve so the near-black source background clamps to 0 and bright wireframe
 * strokes rise toward 255. Output RGB is always white; only alpha carries the mask.
 */
export function toMaskAlpha(r, g, b, gain = 3.6, offset = 40) {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0–255
  const v = luma * gain - offset;
  return Math.max(0, Math.min(255, Math.round(v)));
}

async function bake(src, dst, gain, offset) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    out[o] = 255;
    out[o + 1] = 255;
    out[o + 2] = 255;
    out[o + 3] = toMaskAlpha(data[i], data[i + 1], data[i + 2], gain, offset);
  }
  await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(dst);
  console.log(`baked ${dst} (${width}x${height})`);
}

async function main() {
  await bake("bg (2).png", "public/hero/mask-worm.png", 3.6, 40);
  await bake("in-factory.png", "public/hero/mask-interior.png", 3.6, 40);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/bake-hero-masks.test.mjs`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Run the bake script to generate the masks**

Run: `node scripts/bake-hero-masks.mjs`
Expected: prints `baked public/hero/mask-worm.png (...)` and `baked public/hero/mask-interior.png (...)`, and both files now exist.

- [ ] **Step 6: Verify the masks look right (transparent background, visible white lines)**

Run: `node -e "const s=require('sharp'); (async()=>{for(const f of ['public/hero/mask-worm.png','public/hero/mask-interior.png']){const {width,height}=await s(f).metadata(); const st=await s(f).stats(); const a=st.channels[3]; console.log(f, width+'x'+height, 'alpha min/max', a.min, a.max);}})()"`
Expected: for both files, alpha `min` is `0` (transparent background present) and `max` is `255` (opaque strokes present). If `max` is well under ~200, the mask is too faint — lower `offset` (e.g. 24) or raise `gain` (e.g. 4.2) in `main()` and re-run Steps 5–6.

- [ ] **Step 7: Commit**

```bash
git add scripts/bake-hero-masks.mjs scripts/bake-hero-masks.test.mjs public/hero/mask-worm.png public/hero/mask-interior.png
git commit -m "feat(hero): bake theme-flexible alpha masks from wireframe art"
```

---

### Task 2: Wire the masks into a theme-flexible hero

**Files:**
- Modify: `app/globals.css` (add `--hero-line` and `--hero-scrim` in both theme scopes)
- Modify: `components/hero/HeroExperience.tsx` (replace `<img>` layers + remove `DuotoneFilter`)
- Modify: `components/hero/Hero.module.css` (backdrop/line-fill/scrim/text tokens)
- Delete: `public/hero/factory-bg.png`, `public/hero/factory-in.png` (old rasters, now unreferenced)

**Interfaces:**
- Consumes from Task 1: `/hero/mask-worm.png`, `/hero/mask-interior.png` (alpha masks).
- Produces: no exported symbols; a themed hero. `HeroExperience` keeps its default export-less named export `export function HeroExperience()` and the same rAF behavior + custom props.

- [ ] **Step 1: Add the two flipping tokens to `app/globals.css`**

Insert this block after the base `body { … }` rule (anywhere at top level is fine; keep it near the top):

```css
/* Hero line-art tokens — flip with the DS theme. Cosmos: bright lines on the
   dark wash; Daybreak: ink lines on the light wash. Compose DS tokens only. */
:root,
[data-theme="dark"] {
  --hero-line: var(--starlight);
  --hero-scrim: var(--cosmic-black);
}
[data-theme="light"] {
  --hero-line: var(--ink);
  --hero-scrim: var(--cloud-white);
}
```

- [ ] **Step 2: Replace the layer markup in `components/hero/HeroExperience.tsx`**

Remove the entire `DuotoneFilter` function and its `<svg>` defs, and remove the `<DuotoneFilter />` usage. Replace the returned JSX layers so each layer holds a masked fill `<div>` instead of an `<img>`. The `useEffect` rAF block and `clamp01` stay exactly as they are. Final file:

```tsx
"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Pinned line-art backdrop for the hero scroll journey. Two theme-flexible
 * layers: `worm's-eye` crossfades/zooms into `interior` as the page scrolls.
 * Each layer is a solid --hero-line fill clipped by an alpha mask baked from
 * the source wireframe art; the backdrop behind is --hero-bg. Scroll drives CSS
 * custom properties via rAF; only opacity + transform animate.
 */
export function HeroExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const journey = 1.4 * window.innerHeight;
      const t = clamp01(window.scrollY / journey);
      el.style.setProperty("--l1-op", String(clamp01(1 - t / 0.6)));
      el.style.setProperty("--l1-sc", String(1 + t * 0.18));
      el.style.setProperty("--l2-op", String(clamp01((t - 0.22) / 0.55)));
      el.style.setProperty("--l2-sc", String(1.14 - t * 0.14));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.backdrop} aria-hidden="true">
      <div className={`${styles.layer} ${styles.layer1}`}>
        <div className={`${styles.lineFill} ${styles.lineWorm}`} />
      </div>
      <div className={`${styles.layer} ${styles.layer2}`}>
        <div className={`${styles.lineFill} ${styles.lineInterior}`} />
      </div>
      <div className={styles.scrim} />
    </div>
  );
}
```

- [ ] **Step 3: Update `components/hero/Hero.module.css`**

Apply these edits (only the changed rules are shown; leave everything else — `.layer`, `.layer1`, `.layer2`, `.hero`, `.overlay`, `.actions`, `.cta*`, media query — unchanged):

Replace the `.backdrop` background line:

```css
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--hero-bg); /* was: background-color: var(--cosmic-black) */
}
```

Delete the entire `.layerImg { … }` rule and add a `.lineFill` rule plus the two per-layer mask sources (place where `.layerImg` was):

```css
/* Solid line-color fill clipped by the baked alpha mask; the backdrop --hero-bg
   shows through the transparent (masked-out) areas. Both flip with the theme. */
.lineFill {
  position: absolute;
  inset: 0;
  background: var(--hero-line);
  -webkit-mask: var(--mask) center / cover no-repeat;
          mask: var(--mask) center / cover no-repeat;
}

.lineWorm {
  --mask: url("/hero/mask-worm.png");
}

.lineInterior {
  --mask: url("/hero/mask-interior.png");
}
```

Update the `.scrim` background to use the flipping scrim token:

```css
.scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    120% 90% at 50% 42%,
    transparent 38%,
    color-mix(in srgb, var(--hero-scrim) 60%, transparent) 100%
  );
}
```

Update the overlay text colors so they flip too — change `.heading`, `.lead`, and `.scrollCue`:

```css
.heading {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: clamp(44px, 10vw, 88px);
  line-height: var(--lh-tight);
  letter-spacing: var(--ls-display);
  color: var(--hero-text); /* was: var(--cloud-white) */
}

.lead {
  margin: 0;
  max-width: 640px;
  font-size: clamp(17px, 2.2vw, 20px);
  line-height: var(--lh-body);
  color: var(--hero-lead); /* was: var(--starlight) */
}

.scrollCue {
  position: absolute;
  bottom: clamp(16px, 4vh, 32px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  color: var(--hero-lead); /* was: var(--starlight) */
  opacity: 0.6;
}
```

Also update the header comment block at the top of the file: remove the "intentionally always-Cosmos … overlay text stays light regardless of theme" lines, since the hero now flips.

- [ ] **Step 4: Delete the now-unreferenced old raster layers**

```bash
git rm public/hero/factory-bg.png public/hero/factory-in.png
```

Expected: both files removed; no code references remain (they were only used by the old `<img src>` lines replaced in Step 2).

- [ ] **Step 5: Verify the build/lint passes**

Run: `npm run lint`
Expected: no errors (the removed `eslint-disable-next-line @next/next/no-img-element` comments are gone along with the `<img>` tags, so no dangling-directive warnings).

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 6: Manual visual verification (both themes)**

Run: `npm run dev`, open the hero.
- Default (`data-theme="dark"`): dark wash background, light (starlight) wireframe lines; scroll → worm's-eye crossfades/zooms into interior; heading/lead legible in light text.
- In devtools, set `<html data-theme="light">`: background flips to the light Daybreak wash, wireframe lines become ink (dark), heading/lead become ink and stay legible. Scroll journey behaves identically.
- If the light-mode lines look too heavy or too faint, this is a mask-density issue → adjust `gain`/`offset` in `scripts/bake-hero-masks.mjs` and re-run Task 1 Step 5–6. (Color itself is fixed by tokens and should not need CSS changes.)

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/hero/HeroExperience.tsx components/hero/Hero.module.css
git commit -m "feat(hero): theme-flexible line-art backdrop via alpha masks"
```

---

## Notes for the implementer

- The old duotone SVG filter (`#ds-duotone`) is fully removed; nothing else references it (verify with a repo search for `ds-duotone` after Task 2 — expect zero hits).
- Do not touch the rAF math or the four `--l*` custom props; the crossfade timing is intentional and already tuned.
- `cover` on the mask matches the previous `object-fit: cover` framing, so the composition/crop is unchanged.
- Keep source inputs `bg (2).png` and `in-factory.png` at the project root — they are the re-bake inputs. Do not delete them.
