# Data-Entry Waste Counter — Design

**Date:** 2026-07-07
**Status:** Approved (design)
**Branch:** hero-label-reveal

## Summary

A "data-entry time" counter in the hero's upper-left. As each carton label
reveals during the scroll sequence, the counter climbs — dramatising that
manual data entry wastes time. Four cartons add +45s each (0:45 → 3:00); the
fifth ("…") card jumps to 1:12:00, implying an entire backlog. Driven by the
same `visibleCount` signal the labels use.

## Goals

- A frosted DS card in the hero upper-left (≈ 30% / 33% of the stage), matching
  the marked box in `hero.png`.
- Hidden while the hero copy is read; fades in when labels start revealing
  (phase 2) and counts up as each label appears; releases with the stage.
- Time = `SECONDS[visibleCount]`, animated (count-up) on each change.
- Localised EN/VI; respects `prefers-reduced-motion`; conforms to the DS.

## Non-Goals

- No backend, no real timing. Static demo numbers.
- Does not change the label reveal logic — it only reads `visibleCount`.
- No new heavy dependency.

## Mechanics

`visibleCount` (0..5, already computed in `HeroReveal`) maps to seconds:

| visibleCount | 0 | 1 | 2 | 3 | 4 | 5 ("…") |
|---|---|---|---|---|---|---|
| seconds | 0 | 45 | 90 | 135 | 180 | 4320 |
| display | (hidden) | 0:45 | 1:30 | 2:15 | 3:00 | 1:12:00 |

- `SECONDS = [0, 45, 90, 135, 180, 4320]`.
- Format: `m:ss` under an hour, `h:mm:ss` at/over an hour (seconds & minutes
  zero-padded to 2). The 3:00 → 1:12:00 jump animates as a count-up.
- The card is visible when `visibleCount >= 1`; below that it is faded out.
- Count-up: animate the displayed seconds from the previous value to the new one
  over ~450ms with `--ease-out`, via rAF. Under `prefers-reduced-motion`, snap to
  the new value with no animation.

## Content (i18n EN/VI)

New `WasteCounter` namespace:
- `eyebrow`: "Data-entry time" / "Thời gian nhập liệu"
- `caption`: "manual entry, per carton" / "nhập tay, mỗi thùng"

## Visual (Design System)

- Frosted card: `--surface` + `1px solid var(--border)`, `--radius-lg`, flat (no
  shadow/glow). Larger than a label card.
- Eyebrow: `--fs-xs`, `--text-muted`, tracked/uppercase (matches DS eyebrow).
- Number: `--font-display`, clamp(40px, 6vw, 56px), `font-variant-numeric:
  tabular-nums` (no width jitter while counting), filled with `--gradient-brand`
  as gradient text (the DS "one highlight" allowance).
- Caption: `--fs-sm`, `--text-secondary`.
- No emoji. Entrance: opacity + slight translateY over `--dur-base`/`--ease`.

## Placement

- Absolutely positioned inside the sticky `.stage`, upper-left (left ≈ 8–12%,
  top ≈ 24–28%), tuned by eye. Sits above the backdrop, below/independent of the
  labels layer.
- Mobile (≤640px): move to the top of the stacked column, full-width-ish, so it
  reads before the label list.

## Architecture

- `wasteCounter.data.ts` — `SECONDS` array + `formatDuration(totalSeconds):
  string` (pure, DOM-free, **unit-tested**). Kept as `.mjs`-style pure logic so
  `formatDuration` can be tested under `node --test` (co-located `.test.mjs`), or
  as `.ts` with a `.test.mjs` — match the existing hero pattern (`heroRevealMath`).
- `WasteCounter.tsx` (`"use client"`) — presentational + count-up. Props:
  `{ visibleCount: number; eyebrow: string; caption: string }`. Runs the rAF
  count-up on `visibleCount` change; renders eyebrow / formatted number / caption.
- `WasteCounter.module.css` — DS-token styles + reduced-motion + mobile.
- `HeroReveal` renders `<WasteCounter visibleCount={visibleCount} …/>` inside the
  stage; `Hero.tsx` (server) passes the two localised strings.

## Testing

- `formatDuration`: unit tests for `0 → "0:00"`, `45 → "0:45"`, `90 → "1:30"`,
  `180 → "3:00"`, `4320 → "1:12:00"`, `3661 → "1:01:01"`.
- Visual: counter hidden at top, fades in and ticks up per label, big jump on the
  "…" card, reduced-motion snaps, mobile placement, EN/VI, theme flip.

## Open Questions

None blocking. Exact numbers (`SECONDS`), copy, and placement are easily tuned
(constants + i18n) — the user will adjust later.
