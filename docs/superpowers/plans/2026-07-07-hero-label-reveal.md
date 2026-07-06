# Hero Label Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pin the hero backdrop while the hero content scrolls away, then reveal five DS-styled callout labels one at a time over the unchanged 2D line-art (timer + scroll driven).

**Architecture:** A tall hero `<section>` (240svh) contains a `position: sticky` stage holding the existing line-art backdrop, the (fading) heading/lede, and a labels overlay. A client orchestrator (`HeroReveal`) reads scroll progress each frame, fades the content, and drives a monotonic reveal count `= max(scrollIndex, timerIndex)`. Labels are HTML cards positioned onto the boxes via an SVG overlay (`viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice"`) that matches the backdrop's `cover` scaling. Pure math lives in a DOM-free ESM module so it is unit-testable.

**Tech Stack:** Next 16 (server + client components), React 19, next-intl (EN default/VI), Lenis (already mounted), CSS Modules, Celesnity Design System tokens. Node's built-in test runner (`node --test`) on `.mjs` files, matching the existing `scripts/*.test.mjs` convention.

## Global Constraints

- **No Three.js**, no 3D, no new heavy dependency (no GSAP). Use Lenis (already present) + self-computed progress. — verbatim from spec Non-Goals.
- **Never modify `Celesnity Design System Gradient/`.** Reference semantic tokens only; never raw hex.
- **Do NOT change the backdrop rendering** (`HeroExperience` / the masked line-art visuals). "Không đổi nền" is a hard requirement. `HeroExperience.tsx` and the `.backdrop/.layer/.lineFill/.scrim` CSS rules stay byte-for-byte unchanged; only their container changes (`.hero` → `.stage`).
- **DS values:** card radius `--radius-lg` (20px); frosted card surface `--surface` + `1px solid var(--border)`, **flat** (no shadow/glow); text `--text-primary` / `--text-secondary` / `--text-muted`; type Inter via `--font-sans`, sizes `--fs-sm` (15px) / `--fs-xs` (13px); motion `--dur-base` (220ms) + `--ease`; signature `--gradient-brand` used **sparingly** (one small accent dot only). **No emoji.**
- **Accessibility:** respect `prefers-reduced-motion: reduce` — no auto-timer, no transforms, labels shown statically. Labels are decorative (`aria-hidden`); heading/lede remain the accessible content.
- **Keep `data-hero`** on the outer hero section (the navbar's IntersectionObserver in `components/layout/Header.tsx:24` depends on it).
- Node 22.17, `tsconfig` has `allowJs: true` — importing `./*.mjs` into `.tsx` is supported.

---

### Task 1: Pure reveal math module

DOM-free functions for progress → content fade → reveal counts, plus the anchor→stage position helper. Plain ESM so `node --test` runs it directly and the TSX components import it.

**Files:**
- Create: `components/hero/heroRevealMath.mjs`
- Test: `components/hero/heroRevealMath.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `clamp(n, min, max): number`
  - `computeProgress(rectTop, rectHeight, viewportH): number` → 0..1
  - `contentHideT(progress, p1End): number` → 0..1 (0 shown → 1 hidden)
  - `scrollRevealCount(progress, count, p2Start, p2End): number` → 0..count
  - `timerRevealCount(elapsedMs, count, intervalMs): number` → 0..count
  - `revealCount(scrollCount, timerCount, count): number` → 0..count
  - `toStagePercent(anchorRect, stageRect): { left: number, top: number }` (percent of stage)

- [ ] **Step 1: Write the failing test**

Create `components/hero/heroRevealMath.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test components/hero/heroRevealMath.test.mjs`
Expected: FAIL — `Cannot find module './heroRevealMath.mjs'`.

- [ ] **Step 3: Write minimal implementation**

Create `components/hero/heroRevealMath.mjs`:

```js
// Pure, DOM-free math for the hero label-reveal. Plain ESM so it runs directly
// under `node --test` (matches scripts/*.test.mjs) and imports cleanly into the
// TSX components (tsconfig allowJs). No React, no window.

/** Clamp n into [min, max]. */
export function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n;
}

/**
 * Scroll progress of the pinned hero section: 0 (just pinned) -> 1 (about to
 * release). Derived from the section's top offset vs. how far it can scroll
 * while its sticky stage stays pinned (sectionHeight - viewportHeight).
 * @param {number} rectTop     section.getBoundingClientRect().top
 * @param {number} rectHeight  section height in px
 * @param {number} viewportH   viewport height in px
 * @returns {number} 0..1
 */
export function computeProgress(rectTop, rectHeight, viewportH) {
  const scrollable = rectHeight - viewportH;
  if (scrollable <= 0) return 0;
  return clamp(-rectTop / scrollable, 0, 1);
}

/**
 * How far the hero content is through its exit: 0 (fully shown) -> 1 (fully
 * hidden), reaching 1 at `p1End`. Caller maps this to opacity (1 - t) and an
 * upward translate (t * rise).
 * @returns {number} 0..1
 */
export function contentHideT(progress, p1End) {
  if (p1End <= 0) return progress > 0 ? 1 : 0;
  return clamp(progress / p1End, 0, 1);
}

/**
 * Labels revealed by SCROLL position, 0..count. Zero until phase 2 begins
 * (p2Start); reaches `count` by p2End.
 * @returns {number} integer 0..count
 */
export function scrollRevealCount(progress, count, p2Start, p2End) {
  if (progress <= p2Start) return 0;
  const span = p2End - p2Start;
  if (span <= 0) return count;
  const t = clamp((progress - p2Start) / span, 0, 1);
  return clamp(Math.ceil(t * count), 0, count);
}

/**
 * Labels revealed by the AUTO TIMER, 0..count. One more every `intervalMs` of
 * elapsed phase-2 time.
 * @returns {number} integer 0..count
 */
export function timerRevealCount(elapsedMs, count, intervalMs) {
  if (intervalMs <= 0) return count;
  return clamp(Math.floor(elapsedMs / intervalMs), 0, count);
}

/**
 * Combined reveal count: whichever source (scroll/timer) is further along,
 * capped at count.
 * @returns {number} integer 0..count
 */
export function revealCount(scrollCount, timerCount, count) {
  return clamp(Math.max(scrollCount, timerCount), 0, count);
}

/**
 * Centre of an anchor's client rect expressed as a percent of the stage box,
 * so a label can be placed with left/top %. Rects are `{left, top, width,
 * height}` (DOMRect-shaped).
 * @returns {{ left: number, top: number }}
 */
export function toStagePercent(anchorRect, stageRect) {
  const cx = anchorRect.left + anchorRect.width / 2 - stageRect.left;
  const cy = anchorRect.top + anchorRect.height / 2 - stageRect.top;
  return {
    left: (cx / stageRect.width) * 100,
    top: (cy / stageRect.height) * 100,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test components/hero/heroRevealMath.test.mjs`
Expected: PASS — 8 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add components/hero/heroRevealMath.mjs components/hero/heroRevealMath.test.mjs
git commit -m "feat(hero): pure reveal math (progress, reveal counts, anchor position)"
```

---

### Task 2: Localized label content

Add the `HeroLabels` namespace (4 demo boxes + field labels) to both locales, with a shape test so EN/VI stay in sync.

**Files:**
- Modify: `i18n/messages/en.json` (insert after the `"Hero"` block, line 33)
- Modify: `i18n/messages/vi.json` (insert after the `"Hero"` block, line 33)
- Test: `i18n/heroLabels.test.mjs`

**Interfaces:**
- Produces: `messages.HeroLabels = { codeLabel: string, qtyLabel: string, boxes: { name, code, qty }[] }` with exactly 4 boxes, consumed by `Hero.tsx` (Task 5) as `LabelBox[]`.

- [ ] **Step 1: Write the failing test**

Create `i18n/heroLabels.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test i18n/heroLabels.test.mjs`
Expected: FAIL — `HeroLabels namespace exists` (or a TypeError reading `.boxes` of undefined).

- [ ] **Step 3: Add the EN content**

In `i18n/messages/en.json`, the `"Hero"` object currently ends at line 33:

```json
    "cta": "Request a demo"
  },
```

Change it to append the new namespace (add the comma after `}` and insert the block):

```json
    "cta": "Request a demo"
  },
  "HeroLabels": {
    "codeLabel": "Code",
    "qtyLabel": "Qty",
    "boxes": [
      { "name": "Ceramic bearing 6204", "code": "MHX-204817", "qty": "1,200" },
      { "name": "Copper busbar A2", "code": "MHX-330052", "qty": "640" },
      { "name": "PET resin pellets", "code": "MHX-119043", "qty": "3,000" },
      { "name": "Nitrile gloves M", "code": "MHX-778120", "qty": "5,000" }
    ]
  },
```

- [ ] **Step 4: Add the VI content**

In `i18n/messages/vi.json`, the `"Hero"` object ends with `"cta": "Yêu cầu demo"` (line 32). Append the same namespace, localized:

```json
    "cta": "Yêu cầu demo"
  },
  "HeroLabels": {
    "codeLabel": "Mã hàng",
    "qtyLabel": "Số lượng",
    "boxes": [
      { "name": "Vòng bi gốm 6204", "code": "MHX-204817", "qty": "1.200" },
      { "name": "Thanh đồng A2", "code": "MHX-330052", "qty": "640" },
      { "name": "Hạt nhựa PET", "code": "MHX-119043", "qty": "3.000" },
      { "name": "Găng tay nitrile M", "code": "MHX-778120", "qty": "5.000" }
    ]
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test i18n/heroLabels.test.mjs`
Expected: PASS — 2 tests, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add i18n/messages/en.json i18n/messages/vi.json i18n/heroLabels.test.mjs
git commit -m "feat(i18n): hero label demo content (EN/VI)"
```

---

### Task 3: Label presentation (types, anchors, cards, styles)

Presentational pieces: the `LabelBox` type, the box anchor coordinates, the `LabelCard` (one carton callout), the `HeroLabels` overlay (SVG anchors + positioned cards), and the label CSS. No scroll logic here — `visibleCount` is a prop.

**Files:**
- Create: `components/hero/heroLabels.types.ts`
- Create: `components/hero/heroLabels.data.ts`
- Create: `components/hero/LabelCard.tsx`
- Create: `components/hero/HeroLabels.tsx`
- Create: `components/hero/HeroLabels.module.css`

**Interfaces:**
- Consumes: `toStagePercent` from `./heroRevealMath.mjs` (Task 1); `LabelBox` shape from message data (Task 2).
- Produces:
  - `type LabelBox = { name: string; code: string; qty: string }` (export from `heroLabels.types.ts`)
  - `BOX_ANCHORS: ReadonlyArray<{ x: number; y: number }>` and `TOTAL_BOXES: number` (export from `heroLabels.data.ts`)
  - `HeroLabels(props: { stageRef: React.RefObject<HTMLDivElement | null>; boxes: LabelBox[]; codeLabel: string; qtyLabel: string; visibleCount: number })` — consumed by `HeroReveal` (Task 4).

- [ ] **Step 1: Create the type**

Create `components/hero/heroLabels.types.ts`:

```ts
/** One carton's label content. Sourced from the HeroLabels i18n namespace. */
export type LabelBox = {
  name: string;
  code: string;
  qty: string;
};
```

- [ ] **Step 2: Create the anchor data**

Create `components/hero/heroLabels.data.ts`:

```ts
/**
 * Anchor points for the conveyor boxes, in the backdrop mask's NATIVE
 * 1536x1024 space (matches /hero/mask-interior.png). They are rendered through
 * an SVG overlay with preserveAspectRatio="xMidYMid slice", the exact SVG
 * equivalent of the backdrop's `center / cover`, so the labels track the boxes
 * across viewport aspect ratios.
 *
 * Order = nearest -> farthest. Index 4 (the farthest, smallest box) is the
 * ellipsis-only card. These are initial estimates tuned by eye against the
 * line-art in Task 5 — adjust live in the browser.
 */
export const BOX_ANCHORS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 470, y: 640 }, // 1 - large, lower-left (nearest)
  { x: 900, y: 470 }, // 2
  { x: 1085, y: 405 }, // 3
  { x: 1220, y: 365 }, // 4
  { x: 1320, y: 335 }, // 5 - smallest (ellipsis card, farthest)
];

/** Total labels including the trailing ellipsis card. */
export const TOTAL_BOXES = BOX_ANCHORS.length; // 5
```

- [ ] **Step 3: Create the LabelCard**

Create `components/hero/LabelCard.tsx`:

```tsx
import styles from "./HeroLabels.module.css";

type LabelCardProps = {
  left: number; // percent of stage width
  top: number; // percent of stage height
  shown: boolean;
  /** The farthest box shows only an ellipsis (signals "more cartons"). */
  ellipsis?: boolean;
  name?: string;
  code?: string;
  qty?: string;
  codeLabel: string;
  qtyLabel: string;
};

/**
 * One carton callout: a flat frosted DS card that sits above its box with a
 * short leg + accent dot pointing down to the anchor. Decorative (aria-hidden).
 */
export function LabelCard({
  left,
  top,
  shown,
  ellipsis,
  name,
  code,
  qty,
  codeLabel,
  qtyLabel,
}: LabelCardProps) {
  const className = [
    styles.card,
    shown ? styles.shown : "",
    ellipsis ? styles.ellipsisCard : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden="true"
    >
      {ellipsis ? (
        <span className={styles.ellipsis}>…</span>
      ) : (
        <>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>
            <span className={styles.metaLabel}>{codeLabel}</span>
            {code}
          </span>
          <span className={styles.meta}>
            <span className={styles.metaLabel}>{qtyLabel}</span>
            {qty}
          </span>
          <span className={styles.more}>…</span>
        </>
      )}
      <span className={styles.leg} aria-hidden="true" />
    </div>
  );
}
```

- [ ] **Step 4: Create the HeroLabels overlay**

Create `components/hero/HeroLabels.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LabelCard } from "./LabelCard";
import { BOX_ANCHORS } from "./heroLabels.data";
import { toStagePercent } from "./heroRevealMath.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./HeroLabels.module.css";

type HeroLabelsProps = {
  stageRef: React.RefObject<HTMLDivElement | null>;
  boxes: LabelBox[]; // 4 data boxes; a 5th ellipsis card is appended
  codeLabel: string;
  qtyLabel: string;
  visibleCount: number; // 0..TOTAL_BOXES
};

/**
 * The label overlay. An invisible SVG (sliced to match the backdrop's cover
 * scaling) carries one anchor per box; on mount/resize we read each anchor's
 * screen position and place a fixed-size card there. Card text does NOT scale
 * with the backdrop, so it stays readable. `visibleCount` gates which cards show.
 */
export function HeroLabels({
  stageRef,
  boxes,
  codeLabel,
  qtyLabel,
  visibleCount,
}: HeroLabelsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<{ left: number; top: number }[]>(
    [],
  );

  useEffect(() => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage) return;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const anchors = Array.from(svg.querySelectorAll("[data-anchor]"));
      setPositions(
        anchors.map((a) => toStagePercent(a.getBoundingClientRect(), stageRect)),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef]);

  return (
    <div className={styles.layer} aria-hidden="true">
      <svg
        ref={svgRef}
        className={styles.anchorSvg}
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMid slice"
      >
        {BOX_ANCHORS.map((p, i) => (
          <circle key={i} data-anchor="" cx={p.x} cy={p.y} r={1} fill="none" />
        ))}
      </svg>

      {positions.map((pos, i) => {
        const isEllipsis = i >= boxes.length; // index 4 -> ellipsis
        const box = boxes[i];
        return (
          <LabelCard
            key={i}
            left={pos.left}
            top={pos.top}
            shown={i < visibleCount}
            ellipsis={isEllipsis}
            name={box?.name}
            code={box?.code}
            qty={box?.qty}
            codeLabel={codeLabel}
            qtyLabel={qtyLabel}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Create the label styles**

Create `components/hero/HeroLabels.module.css`:

```css
/* ============================================================
   Hero label overlay. Flat frosted DS cards anchored onto the
   line-art conveyor boxes via a sliced SVG coordinate layer.
   Cards are decorative and never intercept pointer events.
   ============================================================ */

.layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

/* Sliced to match the backdrop's `center / cover`; carries the anchor points. */
.anchorSvg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* One carton callout — flat, frosted, no shadow/glow (DS interaction rules).
   Positioned by inline left/top %; sits ABOVE its box with a 16px gap for the
   leg. Enters with fade + slight rise + scale. */
.card {
  position: absolute;
  transform: translate(-50%, calc(-100% - 16px)) translateY(8px) scale(0.98);
  opacity: 0;
  transition:
    opacity var(--dur-base) var(--ease),
    transform var(--dur-base) var(--ease);
  min-width: 168px;
  max-width: 220px;
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  font-family: var(--font-sans);
  text-align: left;
}

.shown {
  opacity: 1;
  transform: translate(-50%, calc(-100% - 16px)) translateY(0) scale(1);
}

.name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.meta {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  display: flex;
  gap: 6px;
}

.metaLabel {
  color: var(--text-muted);
}

.more {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  line-height: 1;
}

/* Leg down to the anchor + a single small brand-gradient dot (sparing accent). */
.leg {
  position: absolute;
  left: 50%;
  bottom: -16px;
  width: 1px;
  height: 16px;
  background: var(--border);
  transform: translateX(-50%);
}

.leg::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -3px;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  transform: translateX(-50%);
  background: var(--gradient-brand);
}

/* Farthest box: ellipsis only, tighter. */
.ellipsisCard {
  min-width: 0;
  padding: var(--space-2) var(--space-3);
}

.ellipsis {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  line-height: 1;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}

/* Mobile portrait: `cover` crops the sides, so anchoring drifts. Drop it and
   stack the cards as a vertical list in the lower area; JS still sets inline
   left/top but these rules override. */
@media (max-width: 640px) {
  .layer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-6);
    padding-bottom: 18svh;
  }
  .anchorSvg {
    display: none;
  }
  .card {
    position: relative;
    left: auto !important;
    top: auto !important;
    transform: translateY(8px) scale(0.98);
    width: min(320px, 88vw);
    max-width: none;
  }
  .shown {
    transform: translateY(0) scale(1);
  }
  .leg {
    display: none;
  }
}
```

- [ ] **Step 6: Verify it compiles (build type-check)**

Run: `npm run build`
Expected: build completes with no TypeScript errors. (`HeroLabels` is not yet rendered anywhere; it must still type-check. If the build reports the `.mjs` import as untyped, confirm `allowJs` in `tsconfig.json` — it is present.)

- [ ] **Step 7: Commit**

```bash
git add components/hero/heroLabels.types.ts components/hero/heroLabels.data.ts components/hero/LabelCard.tsx components/hero/HeroLabels.tsx components/hero/HeroLabels.module.css
git commit -m "feat(hero): label cards + sliced-SVG anchor overlay (presentational)"
```

---

### Task 4: Reveal orchestrator + pinned stage

The client component that pins the backdrop, fades the content, and drives `visibleCount`. Adds the tall-section + sticky-stage CSS. Reads scroll each frame via rAF; writes content fade straight to the DOM (no per-frame React re-render) and only `setState`s `visibleCount` when it changes.

**Files:**
- Create: `components/hero/HeroReveal.tsx`
- Modify: `components/hero/Hero.module.css` (replace the `.hero` rule with `.section` + `.stage`; add `will-change` to `.overlay`)

**Interfaces:**
- Consumes: math from `./heroRevealMath.mjs` (Task 1); `TOTAL_BOXES` from `./heroLabels.data` and `HeroLabels` from `./HeroLabels` (Task 3); `LabelBox` (Task 3); `HeroExperience` (existing, unchanged).
- Produces: `HeroReveal(props: { heading: string; lead1: string; lead2: string; boxes: LabelBox[]; codeLabel: string; qtyLabel: string })` — consumed by `Hero.tsx` (Task 5).

- [ ] **Step 1: Replace `.hero` with `.section` + `.stage` in Hero.module.css**

In `components/hero/Hero.module.css`, replace the entire `.hero { ... }` block (currently lines 87–102) with:

```css
/* Tall scroll track: the sticky stage stays pinned while the page scrolls
   through this height, giving room for the content exit + label reveal. */
.section {
  position: relative;
  height: 240svh;
}

/* Pinned stage — holds the (unchanged) backdrop, the fading content, and the
   labels. Backdrop `inset: 0` fills this 100svh box. */
.stage {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--header-h, 68px);
  padding-bottom: clamp(56px, 12vh, 140px);
}
```

- [ ] **Step 2: Add `will-change` to `.overlay`**

In `components/hero/Hero.module.css`, the `.overlay` rule (currently starting line 105) sets `position: relative; z-index: 1; ...`. Add a `will-change` line inside it so the per-frame opacity/transform stays GPU-composited:

```css
.overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 820px;
  padding-inline: clamp(20px, 5vw, 40px);
  text-align: center;
  will-change: opacity, transform;
}
```

- [ ] **Step 3: Create the orchestrator**

Create `components/hero/HeroReveal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { HeroExperience } from "./HeroExperience";
import { HeroLabels } from "./HeroLabels";
import { TOTAL_BOXES } from "./heroLabels.data";
import {
  computeProgress,
  contentHideT,
  scrollRevealCount,
  timerRevealCount,
  revealCount,
} from "./heroRevealMath.mjs";
import type { LabelBox } from "./heroLabels.types";
import styles from "./Hero.module.css";

// Phase thresholds over the section's 0..1 scroll progress.
const P1_END = 0.3; // content fully faded by here
const P2_START = 0.32; // labels start revealing
const P2_END = 0.85; // all labels revealed by here
const TIMER_INTERVAL_MS = 900; // auto-reveal cadence (~1s each)
const CONTENT_RISE_PX = 48; // how far the content slides up as it exits

type HeroRevealProps = {
  heading: string;
  lead1: string;
  lead2: string;
  boxes: LabelBox[];
  codeLabel: string;
  qtyLabel: string;
};

/**
 * Pins the hero backdrop while the content scrolls away, then reveals the
 * labels. Reveal count = max(scrollIndex, timerIndex), kept monotonic so a
 * scroll-up never hides an already-shown label. Under reduced motion the timer
 * is off and all labels appear at once when phase 2 is entered.
 */
export function HeroReveal({
  heading,
  lead1,
  lead2,
  boxes,
  codeLabel,
  qtyLabel,
}: HeroRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  // Mutable frame state kept in refs so the rAF loop never re-subscribes.
  const maxRevealedRef = useRef(0);
  const lastSetRef = useRef(0);
  const phase2StartRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    const tick = () => {
      const section = sectionRef.current;
      const overlay = overlayRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const progress = computeProgress(
          rect.top,
          rect.height,
          window.innerHeight,
        );

        // Content fade + rise, written straight to the DOM (no re-render).
        if (overlay) {
          const t = contentHideT(progress, P1_END);
          overlay.style.opacity = String(1 - t);
          overlay.style.transform = `translateY(${-t * CONTENT_RISE_PX}px)`;
          overlay.style.pointerEvents = t > 0.95 ? "none" : "";
        }

        // Phase-2 clock: start when entered, reset if we scroll back above it.
        if (progress >= P2_START) {
          if (phase2StartRef.current === null) {
            phase2StartRef.current = performance.now();
          }
        } else {
          phase2StartRef.current = null;
          maxRevealedRef.current = 0;
        }

        let target: number;
        if (reducedRef.current) {
          target = progress >= P2_START ? TOTAL_BOXES : 0;
        } else {
          const sCount = scrollRevealCount(
            progress,
            TOTAL_BOXES,
            P2_START,
            P2_END,
          );
          const tCount =
            phase2StartRef.current === null
              ? 0
              : timerRevealCount(
                  performance.now() - phase2StartRef.current,
                  TOTAL_BOXES,
                  TIMER_INTERVAL_MS,
                );
          target = revealCount(sCount, tCount, TOTAL_BOXES);
        }

        // Monotonic: never un-reveal on scroll-up (unless we left phase 2).
        maxRevealedRef.current = Math.max(maxRevealedRef.current, target);
        if (maxRevealedRef.current !== lastSetRef.current) {
          lastSetRef.current = maxRevealedRef.current;
          setVisibleCount(maxRevealedRef.current);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-hero>
      <div ref={stageRef} className={styles.stage}>
        <HeroExperience />
        <div className={styles.overlay} ref={overlayRef}>
          <h1 className={styles.heading}>{heading}</h1>
          <p className={styles.lead}>
            {lead1}
            <br />
            {lead2}
          </p>
        </div>
        <HeroLabels
          stageRef={stageRef}
          boxes={boxes}
          codeLabel={codeLabel}
          qtyLabel={qtyLabel}
          visibleCount={visibleCount}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: build completes, no TypeScript errors. (`HeroReveal` is still not rendered — Task 5 wires it. It must type-check now.)

- [ ] **Step 5: Commit**

```bash
git add components/hero/HeroReveal.tsx components/hero/Hero.module.css
git commit -m "feat(hero): pinned stage + scroll/timer reveal orchestrator"
```

---

### Task 5: Wire the server hero + full verification

Point the server `Hero` at `HeroReveal`, feeding it localized strings + label data. Then verify the whole behavior (build, dev, reduced-motion, mobile, both themes/locales) and tune the anchor coordinates against the real line-art.

**Files:**
- Modify: `components/hero/Hero.tsx` (replace body)
- Possibly modify: `components/hero/heroLabels.data.ts` (anchor tuning)

**Interfaces:**
- Consumes: `HeroReveal` (Task 4); `getTranslations` + `t.raw` (next-intl server); `LabelBox` (Task 3).
- Produces: the final rendered hero. No new exports.

- [ ] **Step 1: Replace Hero.tsx**

Replace the entire contents of `components/hero/Hero.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { HeroReveal } from "./HeroReveal";
import type { LabelBox } from "./heroLabels.types";

/**
 * Server hero: fetches localized copy + demo carton data and hands them to the
 * client <HeroReveal/>, which pins the line-art backdrop, scrolls the content
 * away, and reveals the labels. The backdrop itself (<HeroExperience/>) is
 * rendered inside HeroReveal and remains visually unchanged.
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  const tl = await getTranslations("HeroLabels");
  const boxes = tl.raw("boxes") as LabelBox[];

  return (
    <HeroReveal
      heading={t("heading")}
      lead1={t("leadLine1")}
      lead2={t("leadLine2")}
      boxes={boxes}
      codeLabel={tl("codeLabel")}
      qtyLabel={tl("qtyLabel")}
    />
  );
}
```

- [ ] **Step 2: Run the full test + build**

Run: `node --test components/hero/heroRevealMath.test.mjs i18n/heroLabels.test.mjs && npm run build`
Expected: all unit tests PASS; build completes with no errors.

- [ ] **Step 3: Visual verification (desktop)**

Run: `npm run dev`, open `http://localhost:3000/` (EN default).
Verify, in order:
- On load: current hero (heading + lede over line-art) looks unchanged.
- Scroll down slowly: the heading/lede fade out and rise; **the backdrop stays put (pinned) and does not change**.
- After the content is gone: labels appear one at a time, nearest (large left) → farthest, ~1s apart even if you stop scrolling.
- Scrolling faster reveals them sooner; scrolling back up does NOT hide already-shown labels (until you scroll back above the reveal zone / to the top).
- Continue scrolling: the stage releases and the page moves on to HowItWorks; the navbar frosts at the handoff.

- [ ] **Step 4: Tune anchor coordinates**

If any card does not sit on its box, adjust the `{ x, y }` values in `components/hero/heroLabels.data.ts` (native 1536×1024 space; larger `x` = right, larger `y` = down) and refresh until each card's leg/dot lands on its box. Re-check at a narrow window and a wide window — the slice keeps them aligned, but confirm.

- [ ] **Step 5: Verify reduced motion, mobile, theme, locale**

- Reduced motion: in devtools, emulate `prefers-reduced-motion: reduce`. Scrolling past the content should show all labels at once with no entrance animation and no auto-timer stepping.
- Mobile: narrow the viewport below 640px. The cards should stack as a centered vertical list (no anchoring/legs) and still reveal in sequence.
- Theme: toggle light/dark — cards (surface/border/text) and the accent dot flip with the theme; no raw colors leak.
- Locale: visit `/vi` — labels show the Vietnamese product names and field labels.

- [ ] **Step 6: Commit**

```bash
git add components/hero/Hero.tsx components/hero/heroLabels.data.ts
git commit -m "feat(hero): wire label reveal into the hero + tune anchors"
```

---

## Self-Review

**Spec coverage:**
- Enter → current hero unchanged → Task 5 Step 3 (load state); backdrop untouched (Global Constraints, Task 4 keeps `HeroExperience`/backdrop CSS).
- Content scrolls away, background pinned & unchanged → Task 4 (`.section`/`.stage` sticky, content fade).
- Labels reveal sequentially nearest→far, timer + scroll, monotonic → Task 1 (`scrollRevealCount`/`timerRevealCount`/`revealCount`) + Task 4 (rAF wiring, `maxRevealedRef`).
- 4 full boxes + 5th ellipsis card → Task 2 (4 boxes) + Task 3 (`TOTAL_BOXES` = 5, ellipsis at index 4).
- Label content name/code/qty/… → Task 2 data + Task 3 `LabelCard`.
- Anchored onto boxes across viewports → Task 3 sliced SVG + `toStagePercent` (Task 1).
- DS conformance (flat frosted, radius-lg, tokens, sparing gradient, no emoji, Inter) → Task 3 CSS + Global Constraints.
- i18n EN/VI → Task 2 + Task 5.
- Reduced motion → Task 3 CSS `@media` + Task 4 `reducedRef` branch; verified Task 5 Step 5.
- Mobile stacked list → Task 3 CSS `@media (max-width: 640px)`; verified Task 5 Step 5.
- Navbar `[data-hero]` preserved → Task 4 (`data-hero` on `.section`).
- Reveal-count logic unit-tested → Task 1.

**Placeholder scan:** No TBD/TODO. Anchor coordinates are concrete initial values with an explicit tuning step (Task 5 Step 4) — real numbers, not placeholders.

**Type consistency:** `LabelBox { name, code, qty }` defined in Task 3, consumed identically in `HeroLabels`, `LabelCard`, `HeroReveal`, `Hero.tsx`. `visibleCount` / `stageRef` / `boxes` / `codeLabel` / `qtyLabel` prop names match across `HeroReveal` → `HeroLabels` → `LabelCard`. Math function names (`computeProgress`, `contentHideT`, `scrollRevealCount`, `timerRevealCount`, `revealCount`, `toStagePercent`) match between `heroRevealMath.mjs`, its test, and the consumers. `TOTAL_BOXES` (=5) used consistently in Task 3/4.
