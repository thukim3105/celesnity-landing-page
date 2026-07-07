# Hero Scrubbable Playback — Design

**Date:** 2026-07-07
**Status:** Approved (build-first, user will adjust)
**Branch:** landing-v2

## Summary

Replace the timer-only, scroll-locked hero sequence with a **scrubbable
playhead**. While the hero is pinned, wheel/touch input moves a virtual playhead
`t` (ms) instead of scrolling the page: scroll down = advance, scroll up =
**rewind** (re-watch), and if the user is idle ~1s the playhead **auto-advances**
(so passive viewers still see everything). This solves "it auto-plays too fast" —
users who fall behind scroll up to review, without restarting from the beginning.

Scenes 1–3 (labels → message → CTA → installing → configuring) are driven by the
playhead. Scene 4 (the voice demo) is a terminal **station**: it plays
interactively/auto for those who linger, but **scrolling down past it skips it**
— it is not a gate.

## Goals

- Wheel/touch scrubs the sequence (down = forward, up = rewind); page stays pinned.
- Idle ~1s → auto-advance at 1× to the end (passive viewing unchanged).
- Users can rewind to re-watch any earlier moment; no restart-from-zero.
- Scene 4 is skippable by scrolling; not forced to complete.
- Release page scroll at both ends (up past t=0, down past Scene 4).
- Preserve DS look; localized; reduced-motion friendly.

## Non-Goals

- No draggable progress-bar UI (a thin non-interactive progress hint is optional).
- No change to the scene *content* (labels, waste counter, message, CTA, status
  lines, voice form) — only how the timeline is driven.
- Scene 4 is not scrubbed frame-by-frame; it's a station reached at the playhead
  end (keeps its press-hold interaction intact).

## Model

**One virtual playhead `t` (ms)** spanning the auto part (label reveal → message →
CTA → Scene 2 → Scene 3). `T_END` = when Scene 4 begins.

- **Input (while pinned, t within [0, T_END]):** intercept `wheel` and touch drag;
  `t = clamp(t + deltaY * SCRUB_GAIN, 0, T_END)`. Page does not scroll (Lenis stays
  stopped, as today). This replaces the current "swallow scroll" lock with "use
  scroll to scrub".
- **Auto-advance:** if no scrub input for `IDLE_MS` (~1000ms), a rAF advances `t`
  at 1× real time toward `T_END`. Any scrub input cancels/pauses it.
- **Derivation:** a pure `sceneState(t)` → `{ hideT, labels, step }` where
  `hideT` = content fade 0..1, `labels` = 0..TOTAL_BOXES revealed, `step` = which
  of message(1)/cta(2)/click(3)/scene2(4)/scene3(5) is active. Everything the UI
  shows is a function of `t` — so scrubbing back naturally un-reveals labels, hides
  the message, etc. (reversible; the old monotonic reveal is dropped).
- **Ends / handoff:**
  - `t <= 0` and the user scrolls up → release the lock upward (normal page scroll
    to the top of the hero / above).
  - `t >= T_END` → **Scene 4 station**. Scene 4 activates (interactive + its own
    auto-fallback). A further scroll-down here → release the lock downward and
    scroll to Capabilities (skip allowed, whether or not Scene 4 was completed).
    Scene 4 completing its form also arms the down-release + shows the scroll cue.

## Scene 4 as a station (not a gate)

- Reached at `t = T_END`; the voice scene is shown and can be triggered
  (press-hold) or auto-plays after its idle fallback.
- The scroll lock's down-release condition becomes: **playhead at T_END AND a
  further scroll-down intent** (or Scene 4 completed). So scrolling straight
  through skips Scene 4; lingering lets the user interact.
- The existing scroll cue (down-arrow + "Scroll to explore") still appears when
  Scene 4 completes; but the user can also just scroll to leave at any time.

## Input handling & Lenis

- During the pinned sequence, Lenis is already stopped (the current lock). Add a
  `wheel` listener (`{ passive: false }`, `preventDefault`) and touch
  `touchstart`/`touchmove` handlers that translate movement into `deltaY` and feed
  the playhead. Keyboard: PageUp/Down / arrows nudge `t` for accessibility.
- The lock/scrub is engaged when the hero sequence is active and disengaged
  (Lenis restarted, listeners removed) at either release edge. Reuse the existing
  `hero:lock` / `hero:unlock` events; the wheel-scrub listeners live in HeroReveal
  (they need the playhead), the page lock stays in SmoothScroll.

## Architecture

- `heroPlayback.mjs` — pure, DOM-free, **unit-tested**:
  - phase thresholds (reuse/rename the existing `OUTRO_*` + a label-reveal span).
  - `sceneState(t)` → `{ hideT, labels, step }`.
  - `T_END` constant (Scene-4 start on the playhead).
  - `advance(t, dtMs)` / `scrub(t, deltaY, gain)` clamped helpers.
- `HeroReveal` — owns `t` (ref) + auto-advance rAF + wheel/touch/keyboard scrub;
  derives `sceneState(t)` each frame and drives content fade (DOM), `visibleCount`,
  `step` (state) exactly as today, but from `t` instead of wall-clock. Manages the
  two release edges.
- `HeroVoiceScene` — unchanged except it activates at the station and its
  completion arms the down-release (already calls `onComplete`).
- Existing scene components (labels, counter, outro, scene lines) unchanged — they
  still take `visibleCount` / `step` / `dimmed`.
- Optional: a thin progress hint bar + a one-time "scroll ↑ to rewind" nudge.

## Accessibility / reduced-motion

- `prefers-reduced-motion`: skip scrubbing physics; auto-advance instantly to the
  end state (or a fast pass), Scene 4 shows filled. Keyboard still nudges `t`.
- Respect the OS setting; the sequence remains skippable by scroll/keys.

## Testing

- `sceneState(t)`: boundaries — t=0 (content full, 0 labels), across each label
  reveal, at each step threshold, at T_END (step 5 / scene-4 edge). Reversibility:
  `sceneState` is a pure function of `t` (scrubbing back gives the earlier state).
- `scrub`/`advance`: clamp at [0, T_END]; delta sign maps down=forward.
- Visual: wheel down advances, wheel up rewinds and re-shows earlier scenes; idle
  auto-plays; Scene 4 reached, skippable by scrolling; releases at both ends;
  reduced-motion; touch drag on mobile.

## Open Questions

- Scrub gain / idle delay / auto-speed are tuning constants.
- Whether to show the optional progress hint — default: a subtle bar, tunable.
