# Hero Sequence — Interactive Scrollytelling Hero

**Branch:** `landing-v2` · **Date:** 2026-07-06 · **Scope:** replace the static Minder AI hero with an interactive, scroll + click driven sequence that dramatizes the core problem ("manual data entry is slow") and the Minder AI answer (voice capture of messy, non-uniform data).

## Goal

Restructure the top-of-page storytelling for a broad audience (everyone). Establish the *problem* before the product, then let the visitor *feel* the solution through a guided interactive demo, then hand off to "explore Minder AI features". Design System (Cosmos/Daybreak, brand gradient, Inter) is the locked authority — all values come from DS semantic tokens.

## The sequence (7 acts)

| # | State | Mechanic |
|---|-------|----------|
| 1 | Idle hero — factory line-art scene "looks around" following the cursor | mouse-look parallax (pointermove → CSS vars) |
| 2 | Scroll → carton boxes reveal labels: *packing time · inspection time · data-entry time*; corner HUD tallies a growing **total data-entry time** | scroll-scrub (Framer `useScroll`/`useTransform`) |
| 3 | Problem lands: **"Manual data entry eats the day"** + **[Try Minder AI]** button | scroll-scrub |
| 4 | Click → confirmations: *Hardware installed ✓ · Configured to your workflow ✓* | click → state machine |
| 5 | A **phone** with a voice button appears; caption *"press & hold 1s"* | state machine |
| 6 | Hold → transcript line types out *"Box no. XXX, …"*, then blooms into a **full order card** whose fields are deliberately **non-uniform** (shows the messy complexity that justifies voice over rigid forms) | state machine + `AnimatePresence` |
| 7 | Hand-off CTA: **"Explore Minder AI"** → scrolls into the rest of the page | — |

## Architecture

- **`HeroSequence.tsx`** (client) — orchestrator. Tall scroll container (~300–400vh) with an inner `position: sticky` stage pinned to the viewport. Scroll progress (Framer `useScroll` on the container, mapped with `useTransform`) drives acts 1–3. A React state machine (`idle → problem → setup → phone → transcript → order`) drives acts 4–6, entered by the [Try Minder AI] click.
- **`useParallax.ts`** — small hook: pointermove → normalized `-1..1` → CSS vars `--px/--py` on the stage; layers translate by depth. No library. Disabled on touch + reduced-motion.
- **`CartonScene.tsx`** — line-art factory backdrop (reuse existing `mask-interior.png` fill technique) + foreground **SVG carton boxes** drawn in the same line language (stroke = brand gradient / text color). Each box is a DOM element → individually lit / labelled / parallaxed. Owns the reveal labels + the corner HUD counter.
- **`PhoneDemo.tsx`** — CSS/SVG phone frame (no raster; theme-flips), voice button with press-and-hold (1s) interaction, typed transcript, and the non-uniform order card. May reuse product dashboard screenshots (`capture-data.png`, etc.) as texture behind/within the "explore features" hand-off.
- **Wiring** — `Hero.tsx` renders `HeroSequence`. Copy via `useTranslations("HeroSequence")`.

## Reuse of existing assets

No existing image has an addressable row of cartons, so: **backdrop** reuses the line-art interior; **cartons** are built as SVG (only viable path for per-box lighting/labels, also lightest); **product screenshots** (`capture-data.png`, `catch-errors.png`, `config.png`) are reused for the order/features payoff where real UI is appropriate.

## Constraints

- **Library:** add `motion` (Framer Motion) — the single new dependency; handles both scroll-linked and state-machine animation in one React-idiomatic model; integrates with existing Lenis smooth scroll.
- **DS only:** every color/gradient/radius/space/duration/easing from DS tokens. Inter. No raw hex, no emoji. Roomy radii, calm motion (140/220/350ms, `--ease`).
- **i18n:** all strings → `i18n/messages/en.json` + `vi.json` under a `HeroSequence` namespace.
- **Mobile:** reduced sequence — no mouse-look; tap (not hold); shorter scroll; single-column phone.
- **`prefers-reduced-motion`:** static fallback — scene + problem statement + CTA, no scrubbing/typing.

## Out of scope (this pass)

Restructuring the sections below the hero (HowItWorks/Capabilities/CTA) — the hero hands off to them unchanged for now.
