# Hero Scene 1 Ending + Scene Transition — Design

**Date:** 2026-07-07
**Status:** Approved (build-first, user will adjust)
**Branch:** landing-v2

## Summary

After the carton labels finish revealing, Scene 1 plays a short auto timeline:
the labels + waste counter fade out, a message appears, a "Try Minder AI" CTA
appears below it, then a visual auto-click effect plays on the CTA. The auto-click
transitions (crossfade) to **Scene 2** — a placeholder line "Đang cài đặt phần
cứng…" that the user will later flesh out (integrating How-it-works). The
backdrop stays pinned throughout.

This is NOT the page outro. It is the seam between two hero scenes.

## Goals

- When all 5 labels are shown, auto-play (no scroll needed): labels+counter fade,
  message in, CTA in, auto-click, then crossfade to Scene 2.
- Auto-click is purely visual (fake cursor + ripple + button press) — no
  navigation. The CTA is still a real, focusable button (real click scrolls to the
  demo CTA section; easily changed later).
- Scene 2 is a minimal centered placeholder for now.
- DS-conformant, localized EN/VI, respects `prefers-reduced-motion`.

## Non-Goals

- Not building Scene 2's real content (How-it-works integration comes later).
- No routing/navigation from the auto-click.
- No new heavy dependency.

## Timeline (auto, triggered when visibleCount === TOTAL_BOXES)

Elapsed since all labels shown → step (via pure `outroStep(elapsedMs)`):

| elapsed (ms) | step | state |
|---|---|---|
| 0–1499 | 0 | labels + counter fully shown |
| 1500–2799 | 1 | labels + counter fade out; message fades in |
| 2800–4499 | 2 | CTA button fades in |
| 4500–5399 | 3 | auto-click effect on the CTA (cursor + ripple + press) |
| ≥ 5400 | 4 | crossfade to Scene 2 |

Thresholds are constants (easy to tune). If the user scrolls back above phase 2,
the timeline + scene reset (consistent with the existing reveal reset).

## Content (i18n EN/VI)

- `HeroOutro.message`: "Việc nhập liệu tốn thời gian, gây giảm hiệu suất làm việc…"
  / "Manual data entry eats time and drags down productivity…"
- `HeroOutro.cta`: "Dùng thử Minder AI" / "Try Minder AI"
- `HeroScene2.line`: "Đang cài đặt phần cứng…" / "Installing the hardware…"

## Visual (Design System)

- Message: `--font-display`, clamp(28px, 5vw, 40px), `--text-primary`, centred,
  max-width ~640px.
- CTA: DS primary button — `--gradient-brand`, pill, flat (mirrors the existing
  hero CTA). Real click scrolls to the `CTA` section.
- Fake cursor: small inline SVG pointer; animates toward the button, a ripple
  circle expands, and the button gets a brief pressed state (scale
  `--press-scale`). Motion via `--ease`, `--dur-base`/420ms. No emoji.
- Scene 2 placeholder: centred line, `--font-display`, `--text-primary`.
- Scene crossfade: opacity over ~420ms `--ease`.

## Accessibility / reduced-motion

- `prefers-reduced-motion`: skip the fake cursor + press animation; the timeline
  still advances (message → CTA → Scene 2) but as instant state changes (no
  transforms). The CTA is always keyboard-focusable and real-clickable.

## Architecture

- `heroOutro.mjs` — pure `outroStep(elapsedMs): 0|1|2|3|4` + exported threshold
  constants. DOM-free, **unit-tested** (matches heroRevealMath/wasteCounter).
- `HeroOutro.tsx` (client, presentational) — props `{ step, message, ctaLabel,
  onCtaClick }`. Renders the message, CTA, and fake-cursor/click effect keyed off
  `step` (message at ≥1, cta at ≥2, click at ===3).
- `HeroScene2.tsx` (client, presentational) — props `{ shown, line }`. The
  placeholder; kept tiny so the user can grow it.
- `HeroReveal` — owns a `scene` state (1|2) and the outro timeline: when
  `visibleCount === TOTAL_BOXES`, record a start time and drive `outroStep` each
  frame (reusing the existing rAF loop + `performance.now()`); fade labels+counter
  when step ≥ 1 (new `dimmed` prop on `HeroLabels`/`WasteCounter`); at step 4 set
  `scene = 2`. Crossfade the Scene 1 layer vs `HeroScene2`.
- i18n: `HeroOutro` + `HeroScene2` namespaces; `Hero.tsx` passes the strings.

## Testing

- `outroStep`: unit tests at each boundary (0→0, 1500→1, 2800→2, 4500→3, 5400→4,
  large→4) and just-below boundaries.
- Visual: after labels, auto-plays message→CTA→click→Scene 2; reduced-motion
  snaps without cursor; EN/VI; theme flip; scroll-back resets.

## Open Questions

- Scene 2's real content (How-it-works integration) — deferred to the user.
- Exact copy, thresholds, and whether the auto-click loops — all constants/i18n,
  tunable later.
