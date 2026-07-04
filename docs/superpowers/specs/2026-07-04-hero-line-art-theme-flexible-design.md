# Hero line-art theme-flexible (luminance mask) — Design

**Date:** 2026-07-04
**Status:** Approved (pending spec review)

## Problem

The hero backdrop uses two raster wireframe images (`factory-bg` worm's-eye → `factory-in`
interior) recolored with a fixed DS-duotone SVG filter. It is intentionally always-Cosmos
(dark): the images only read on a dark background, so the hero cannot follow the Daybreak
(light) theme. The user wants to keep the *line drawing* of the images but drive the
background — and the line color — from DS theme tokens so the hero flips light/dark.

The user rephrased the goal precisely: **"lấy nét vẽ của ảnh, background sẽ theo màu quy
định, linh hoạt"** — take the image's lines, let the background follow the defined (token)
color, flexibly.

## Approach (chosen: CSS luminance mask)

Reuse each raster line-art image as a **luminance mask** rather than a painted pixel layer.
The image's bright wireframe becomes the visible (masked-in) area; its near-black
background becomes transparent. Behind the mask sits a solid DS token background. Both the
line color and the background color are theme tokens, so the whole hero flips automatically
via `[data-theme]`.

Rejected alternatives:
- **Hand-authored SVG** — too labor-intensive and cannot match the dense wireframe detail.
- **`mix-blend-mode` (screen/multiply)** — only reads in dark mode; lines vanish on a light
  background. Not truly theme-flexible.

## Scope

Applies to **both** hero layers so light mode is coherent:
- Layer 1 (worm's-eye): masked from the new brand-gradient render `bg (2).png`.
- Layer 2 (interior): masked from `in-factory.png` (already copied to `factory-in.png`).

## Design

### New/updated source images
- `bg (2).png` (project root) — new worm's-eye render, becomes worm's-eye layer source.
- `in-factory.png` (project root) — already copied to `public/hero/factory-in.png`.

### Asset prep — baked masks
Bake two high-contrast **white-line-on-black** PNGs to serve as clean luminance masks
(the source blue/gradient strokes have modest luminance and would mask softly):
- `public/hero/mask-worm.png` from `bg (2).png`
- `public/hero/mask-interior.png` from `factory-in.png`

Method: a small Node script (Node v22 available; no ImageMagick). Per pixel, compute
Rec.709 luminance, apply a threshold/gain curve, and write it to all of R/G/B (white lines
on black). No alpha needed — `mask-mode: luminance` reads brightness. Dependency: use a
zero-config PNG codec already resolvable in the project (`pngjs`); if absent, add it as a
dev dependency. Keep the script under `scripts/bake-hero-masks.mjs` for repeatability.

The masks are the **sole hero art** — there is no raster fallback layer. The source
`bg (2).png` is only read once by the bake script to produce `mask-worm.png`; it does not
need to be moved into `public/hero/`. The old `public/hero/factory-bg.png` and
`factory-in.png` raster layers are no longer referenced by the component and can be removed
after the masks exist.

### Tokens (in `app/globals.css`, NOT the DS folder)
Add a theme-flipping line-color token alongside the existing theme scopes:
- Cosmos (default / `[data-theme="cosmos"]`): `--hero-line: var(--starlight)` (#C9CEE8),
  bright on the dark wash.
- Daybreak (`[data-theme="daybreak"]`): `--hero-line: var(--ink)` (#1C2240), dark ink on
  the light wash.

Existing DS tokens already flip and are reused as-is: `--hero-bg`, `--hero-text`,
`--hero-lead`.

### Component: `components/hero/HeroExperience.tsx`
- Remove `DuotoneFilter` and the `<svg>` defs; the duotone recolor is obsolete.
- Each layer wraps a `.lineFill` element:
  ```
  <div class="layer layer1"><div class="lineFill lineWorm" /></div>
  <div class="layer layer2"><div class="lineFill lineInterior" /></div>
  ```
- `.lineFill` carries `background: var(--hero-line)` and the mask; the per-layer class
  supplies its own `mask-image` URL.
- rAF scroll logic and the four custom props (`--l1-op/--l1-sc/--l2-op/--l2-sc`) are
  UNCHANGED. Opacity/scale stay on the outer `.layer`, so the crossfade + zoom journey
  behaves exactly as before.

### Styles: `components/hero/Hero.module.css`
- `.backdrop` background: `var(--cosmic-black)` → `var(--hero-bg)`.
- `.layerImg`/`filter: url(#ds-duotone)` removed.
- `.lineFill`:
  ```
  position:absolute; inset:0;
  background: var(--hero-line);
  -webkit-mask: var(--mask) center / cover no-repeat;
          mask: var(--mask) center / cover no-repeat;
  -webkit-mask-mode: luminance; mask-mode: luminance;
  ```
  Per-layer classes set `--mask: url("/hero/mask-worm.png")` and
  `url("/hero/mask-interior.png")`.
- `.scrim` radial gradient: swap `var(--cosmic-black)` → `var(--hero-bg)` so edge darkening
  follows the theme.
- Overlay text: `.heading` `color: var(--cloud-white)` → `var(--hero-text)`;
  `.lead`/`.scrollCue` `var(--starlight)` → `var(--hero-lead)`. Remove the "always dark"
  comments.

### Data flow
Scroll position → rAF → sets `--l1-*/--l2-*` on `.backdrop` root → CSS opacity/scale on the
two `.layer`s → crossfade worm's-eye → interior. Theme (`[data-theme]` on an ancestor) →
`--hero-bg`/`--hero-line`/`--hero-text` resolve → line + background + text colors flip. The
two systems are independent (motion vs. theme), which keeps each unit reasoning-simple.

## Edge cases / risks
- **Mask contrast:** if a baked mask still masks softly, tune the threshold/gain in the bake
  script; the fill color is solid so crispness comes entirely from the mask.
- **`mask-mode` support:** modern evergreen browsers support `mask-mode: luminance`;
  `-webkit-mask` prefix included for Safari. Acceptable for this project.
- **Gradient loss:** masking + flat token fill drops `bg (2).png`'s blue→purple gradient.
  Accepted — theme-flexibility is the priority; brand gradient stays reserved for buttons/
  one hero card per DS rules.
- **DS folder untouched:** all token additions live in `app/globals.css`. The
  `Celesnity Design System Gradient/` folder is read-only and not modified.

## Testing / verification
- Manual: load hero in Cosmos → dark wash, light wireframe; toggle `[data-theme="daybreak"]`
  → light wash, ink wireframe. Both layers flip; text stays legible in both.
- Scroll: worm's-eye crossfades/zooms into interior exactly as before, in both themes.
- Reduced motion: unchanged (`prefers-reduced-motion` still only affects the CTA).

## Out of scope
- Redrawing either scene as hand-authored SVG.
- Re-timing or redesigning the scroll journey.
- Any change to navbar, Hero content copy, or other sections.
