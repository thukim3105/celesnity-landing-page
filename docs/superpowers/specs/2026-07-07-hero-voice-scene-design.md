# Hero Scene 4 — Voice-to-Form Demo — Design

**Date:** 2026-07-07
**Status:** Approved (build-first, user will adjust)
**Branch:** landing-v2

## Summary

The climax scene of the hero sequence. After Scene 3 ("configuring…"), a mic
screen appears: a small instruction above a large microphone button ("press &
hold 1s to speak"). Pressing and holding the mic for 1s (or an auto-fallback if
nobody interacts) plays a scripted demo — a waveform animates, one carton's order
info is "spoken" as jumping transcript text, a processing bar runs, and the info
lands neatly into a 3-field form. Simulated (no real microphone). When the form
is filled, the scroll lock releases.

## Goals

- Reached automatically from Scene 3; scroll stays locked until the form fills.
- Press-and-hold-1s interaction with a progress ring; early release cancels.
- Auto-fallback: if no interaction within ~4s, the demo plays itself.
- Scripted transcript → processing → form fill, reusing one carton's data
  (Tên hàng · Mã hàng · Số lượng), consistent with the labels.
- DS-conformant, localized EN/VI, respects `prefers-reduced-motion`.

## Non-Goals

- No real microphone / Web Speech API. Fully simulated.
- No real backend/processing. Scripted timings.
- Not building further scenes beyond Scene 4 (it is the last for now).

## Placement in the sequence

Timeline steps extend by one: Scene 3 (configuring) holds ~3s, then step 6 =
Scene 4 (voice). Add `OUTRO_SCENE4_MS`. Scene 4 is interactive, so its internal
progress is a state machine, not time-based. The scroll lock is held while the
sequence is unfinished and released only when Scene 4 signals completion
(`onComplete`), replacing the old "unlock at Scene 3" rule.

## Interaction & flow (state machine inside the scene)

1. **idle** — small instruction above the mic ("Ấn giữ 1 giây để nói"), mic button
   with a gentle pulse; empty 3-field form below.
2. **holding** — on pointer-down, a 1s progress ring fills around the mic and a
   waveform animates. Pointer-up before 1s → cancel → idle. Reaching 1s → speaking.
   - Auto-fallback: if the scene has been idle ~4s with no press, auto-enter
     holding→speaking.
3. **speaking** — the order info appears as staggered "spoken" transcript chunks
   ("thùng 12… mã MHX-204817… số lượng 1200…").
4. **processing** — a thin loading/progress bar ("Đang xử lý…") runs.
5. **filled** — each transcript piece animates into its form field (Tên hàng, Mã
   hàng, Số lượng) in order, with a done/check state. On completion → `onComplete()`
   (releases the scroll lock).

## Layout (proposed; user tunes)

Centered card in the stage, vertical stack:
- small instruction text (top),
- large circular mic button (with progress ring + waveform),
- transcript line(s),
- thin processing bar,
- 3-field form (empty → filled).

DS: frosted `--surface` + `--border`, `--radius-xl` card; mic uses
`--gradient-brand` (fits the "one highlight" allowance) + progress ring; form
fields use `--surface`/`--border`, `--radius-md`; check/tick uses accent. No emoji.

## Content (i18n EN/VI)

New `HeroVoice` namespace:
- `hint`: "Press and hold 1s to speak" / "Ấn giữ 1 giây để nói"
- `processing`: "Processing…" / "Đang xử lý…"
- field labels: `nameLabel` / `codeLabel` / `qtyLabel` (reuse the label wording).
- The spoken/filled values reuse one carton from `HeroLabels.boxes[0]` (passed in),
  so there is a single source of truth for the demo data.

## Accessibility / reduced-motion

- `prefers-reduced-motion`: skip the waveform + staggered typing + fly-in; after a
  brief beat show the form already filled, then `onComplete`. The mic button is a
  real, keyboard-focusable button (Enter/Space triggers the demo).
- Decorative motion layers are `aria-hidden`; the form values remain readable text.

## Architecture

- `heroVoice.mjs` — pure, DOM-free, **unit-tested**:
  - `holdProgress(elapsedMs, holdMs)` → 0..1 fill of the ring.
  - `transcriptCount(elapsedMs, total, perChunkMs)` → 0..total chunks revealed.
  - `fillCount(elapsedMs, total, perFieldMs)` → 0..total fields filled.
- `HeroVoiceScene.tsx` (`"use client"`) — the state machine + press-hold handling
  + auto-fallback; renders mic/instruction/transcript/processing/form. Props:
  `{ active: boolean; hint; processing; fields: {label,value}[]; onComplete: () => void }`.
- `heroOutro.mjs` — add `OUTRO_SCENE4_MS`; `outroStep` returns 0..6 (6 = Scene 4).
- `HeroReveal` — render `<HeroVoiceScene active={step >= 6} .../>`; hold the lock
  until `onComplete` (a `sequenceDoneRef`), reset on scroll-out.
- `Hero.tsx` — pass `HeroVoice` strings + the first carton's values.

## Testing

- `holdProgress`: 0→0, half→0.5, ≥hold→1, clamps.
- `transcriptCount` / `fillCount`: boundaries at each chunk/field, clamps to total.
- Visual: idle hint above mic; press-hold fills ring, early release cancels; 1s
  triggers transcript→processing→form fill; auto-fallback after ~4s; reduced-motion
  shows filled form; unlock after fill; EN/VI; theme flip; mobile stack.

## Open Questions

None blocking. Copy, timings, field count, and layout are constants/i18n the user
will tune. Whether more scenes follow is deferred.
