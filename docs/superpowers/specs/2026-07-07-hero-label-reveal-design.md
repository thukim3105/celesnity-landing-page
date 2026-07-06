# Hero Label Reveal — Design

**Date:** 2026-07-07
**Status:** Approved (design)
**Author:** Celesnity / Claude

## Summary

On the landing page, the current hero renders as-is on load. As the user scrolls,
the hero **content** (heading + lede) scrolls away while the hero **backdrop stays
unchanged and pinned**. On the pinned backdrop, callout **labels** then reveal one
at a time — nearest box first — driven by both an auto-timer (~1s each) and scroll
progress. Each label represents one carton on the line-art conveyor and shows
demo shipment info. After all labels are shown, the pin releases and the page
continues to the next section.

No Three.js is used. The Three.js `hero-label.png` board was inspiration only; the
final implementation is HTML/CSS labels overlaid on the existing 2D line-art
backdrop.

## Goals

- Enter page → current hero visible, unchanged.
- Scroll → hero content fades/rises away; **backdrop does not change** (stays pinned).
- Labels reveal sequentially over the pinned backdrop, nearest → farthest box.
- Labels are anchored onto the boxes in the line-art and read as callouts.
- Fully conforms to the Celesnity Design System (tokens only, no ad-hoc styles).
- Localized EN/VI via next-intl.
- Respects `prefers-reduced-motion`.

## Non-Goals

- Do NOT modify the hero backdrop rendering (`HeroExperience` / the masked
  line-art). "Không đổi nền" is a hard requirement.
- Do NOT add Three.js or any 3D scene.
- Do NOT add a heavy scroll library (GSAP, etc.). Lenis (already present) plus a
  self-computed scroll progress is sufficient.
- No pixel-perfect box tracking on mobile portrait (see Mobile section).

## Current State (as explored)

- Stack: Next 16, React 19, next-intl, Tailwind 4, **Lenis** smooth scroll.
  Three.js is **not** installed and will not be added.
- Hero is a **server component** (`components/hero/Hero.tsx`) rendering a localized
  heading + lede over `HeroExperience` (`components/hero/HeroExperience.tsx`), a 2D
  line-art factory backdrop: `--gradient-brand` fill clipped by a baked alpha mask
  (`/hero/mask-interior.png`, 1536×1024, 3:2) using `center / cover`, plus an
  animated sheen and a scrim. Styles in `components/hero/Hero.module.css`.
- The line-art depicts box/bubble outlines receding in perspective: one large box
  near-left, a row shrinking toward the upper-right → a natural nearest→farthest
  conveyor. These are the anchor targets.
- Currently the backdrop scrolls away WITH the content. This design changes that:
  the backdrop is **pinned** while content scrolls and labels reveal.

## Approach

**Chosen: A — Pinned hero via CSS `sticky` + a client reveal overlay.**

Rejected alternatives:
- **B — IntersectionObserver, no pin:** when the hero scrolls out, backdrop +
  labels leave the viewport together, so labels are barely seen. Contradicts
  "labels reveal on an unchanged, visible backdrop." Rejected.
- **C — GSAP ScrollTrigger:** adds a heavy dependency for what A already achieves
  with Lenis + a computed progress value. Rejected (YAGNI).

## Architecture

Units, each with a single purpose and a clear interface:

- **`Hero.tsx`** (server, existing): keeps next-intl usage; fetches translated
  strings + label data and passes them as props into the client reveal component.
  Continues to render `HeroExperience` (backdrop) unchanged.
- **`HeroReveal.tsx`** (`"use client"`, new): the orchestrator. Owns the tall
  scroll section, the `sticky` stage, scroll-progress computation, the reveal
  timer, and reveal-count state. Renders the (passed-in) heading/lede and the
  labels. Depends only on its props — knows nothing about the rest of the page.
  - Props: `{ heading, lead1, lead2, boxes: LabelBox[] }`.
- **`HeroLabels.tsx` + `LabelCard`** (new): pure presentational. Given the anchor
  positions and the current reveal count, renders the DS label cards. `LabelCard`
  renders one carton callout.
- **`heroLabels` data**: 5 boxes. Boxes 1–4 carry demo shipment info; box 5 is the
  ellipsis-only card. Anchor coordinates live here in the mask's native
  1536×1024 space.
- **CSS**: a new CSS module for the reveal/label layer. `Hero.module.css` is only
  touched to make the section tall + the stage sticky (backdrop visuals untouched).

## Reveal Model

The tall section maps scroll to a `progress` value in `[0, 1]` (computed from the
section's bounding rect vs. viewport; no scroll library needed).

- **Phase 1 (progress 0 → ~0.35):** heading + lede reduce `opacity` and
  `translateY` upward; set `pointer-events: none` once faded.
- **Phase 2 (progress ~0.35 → ~0.90):** labels reveal. The number of visible
  labels is:

  `visibleCount = max(timerIndex, scrollIndex)` — **monotonic** (never decreases;
  once a label is shown it stays, so scrolling up does not hide/flicker).

  - `scrollIndex`: derived by mapping phase-2 progress across the 5 boxes.
  - `timerIndex`: once phase 2 is entered (backdrop pinned & on-screen), a timer
    reveals one more label every ~1000ms, in nearest→farthest order (box 1 → 5).
  - Effect: scroll fast → labels appear immediately; stop → the timer finishes the
    sequence on its own.
- **progress > ~0.90:** the sticky stage releases; the page scrolls on to the next
  section (`HowItWorks`). Backdrop remains unchanged throughout.

Reveal order: nearest (large, left) → farthest (small, upper-right). Box 5 is the
ellipsis card, revealed last.

## Label Anchoring (key technical detail)

The backdrop is `background: var(--gradient-brand)` masked by a 1536×1024 image
sized `center / cover`, so on-screen box positions shift with viewport aspect
ratio. To keep labels on their boxes:

- Overlay an **SVG** across the hero stage with `viewBox="0 0 1536 1024"` and
  `preserveAspectRatio="xMidYMid slice"` — the SVG equivalent of `cover`, matching
  the background exactly.
- Place 5 invisible **anchor markers** at the boxes' native coordinates inside that
  SVG.
- JS reads each anchor's client rect (recomputed on resize, and per-frame while the
  stage is pinned — cheap for 5 points) and positions each label (at a **fixed font
  size**) at that point. Labels therefore track the boxes across viewports while
  their text stays readable (does not scale with the background).

Anchor coordinates are tuned by eye against the line-art during implementation.

## Content & i18n

Localized via next-intl (EN default at `/`, VI). Demo data lives in the message
catalogs.

- **Boxes 1–4** each show: **Product name · Product code ‹number string› ·
  Quantity · …**
  - The trailing `…` signals "more fields exist in this carton."
- **Box 5** shows only **…** — signals "and more cartons beyond."
- Product names are translated EN/VI; codes and quantities are literal demo values.

## Label Visual (Design System)

Strictly DS tokens; no ad-hoc colors/spacing/radii. Follows `ds-interaction-rules`
(cards are flat — no lift/glow/shadow).

- `--surface-card` frosted background, `--radius-card` (20px), thin `--border`,
  **flat** (no shadow/glow).
- Inter typography: product name heavier; code/quantity smaller in
  `--text-secondary`. **No emoji.**
- A small CSS "leg"/pointer from the card down to its box (callout style), colored
  from tokens.
- Signature brand gradient used **sparingly** — one accent dot or a thin accent
  border, never the whole card fill.
- Appear transition: `opacity` + `translateY(6px)` + `scale(0.98 → 1)` over
  **220ms `--ease-out`**.

## Motion & Accessibility

- `prefers-reduced-motion: reduce`: disable the auto-timer and all transforms;
  show all labels statically once phase 2 is entered. Content fade becomes an
  instant state change.
- Anchor SVG and label layer are decorative: `aria-hidden` where appropriate; the
  hero heading/lede remain the accessible content.

## Mobile (portrait)

On portrait viewports `cover` crops the sides, so 5-box anchoring drifts. Instead:

- Drop anchoring; render the labels as a **vertical stacked list** revealed with
  the same timer/scroll sequence. Preserves the intent without misaligned callouts.
- Breakpoint aligns with the existing DS/site responsive rules.

## Testing

- Reveal-count logic (`max(timerIndex, scrollIndex)`, monotonic) is pure and unit-
  testable in isolation from the DOM.
- Manual/visual verification: labels sit on the boxes across desktop aspect ratios;
  timer completes the sequence when scrolling stops; scrolling advances it;
  reduced-motion shows all labels with no animation; mobile shows the stacked list;
  backdrop never changes; pin releases cleanly into `HowItWorks`.

## Open Questions

None blocking. Anchor coordinates and exact phase thresholds are tuning values,
finalized during implementation.
