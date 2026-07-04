# Celesnity Design System

**Celesnity** is a celestial consumer brand — a stargazing / astronomy product that helps
people track tonight's planets, meteor showers and the moon. Its identity is built on a single
idea: **two skies, one identity.** The same cosmic palette lives in two modes —

- **Cosmos** (dark) — the night: deep cosmic indigo lit by a cobalt → violet → magenta nebula. Used for app UI, hero moments, product.
- **Daybreak** (light) — sunrise: the same hues lifted into airy, near-white surfaces with the accents held intact. Used for marketing, docs, daylight UI.

Everything is set in **Inter** — one versatile family carrying both the geometric confidence of the
display cuts and the calm readability of body copy.

---

## Sources

This system was reverse-engineered from the brand kit supplied in `Brand Indentity/`:

- `Celesnity Brand Kit Inter.html` — English "Visual Identity System · v1.0" brand guidelines (essence, logo, color, typography, in-use).
- `Celesnity Brand Kit Inter VI.html` — the same guidelines in Vietnamese ("BỘ NHẬN DIỆN"). No new content — a localization of the first.

Both were self-contained bundles with embedded PNG + Inter woff2 assets. Extracted originals are kept
in `_source/` (raw bundles, decoded assets, reference screenshots) for provenance; nothing there ships to consumers.

> **Font note / flag:** the brand ships Inter as embedded `.woff2` files. Rather than guess the
> weight mapping of 14 unnamed font binaries, this system loads the **identical Inter cut from Google
> Fonts** (`tokens/fonts.css`). It is the real brand typeface, not a substitute — but if you'd prefer
> self-hosted files, send the named weights and I'll swap them in.

---

## Content fundamentals

How Celesnity writes:

- **Voice:** calm, evocative, a little poetic — celestial without being mystical. "Two skies, one identity." "Reach the stars." "The brand in motion."
- **Person:** speaks *to* the user and about the sky in the second/implied person ("Plan my dawn", "Start stargazing"). Not corporate "we".
- **Casing:** Sentence case for headings and body. **Eyebrows are UPPERCASE, widely tracked** (`01 — ESSENCE`, `03 — COLOR`), often numbered.
- **Numbers as heroes:** big, confident readouts carry meaning — *98% clear*, *02:14*, *12 visible planets*, *4.2° moon altitude*. Pair a large value with a quiet lowercase label.
- **Length:** headlines are short (2–5 words). Body is one generous paragraph, warm and inviting, never dense.
- **Emoji:** none. The celestial mood is carried by type, color and the orbit mark — not emoji.
- **Vibe words:** cosmic, celestial, nebula, daybreak, starlight, confident, modern, human.

Example copy: *"Celesnity moves between two states of the same sky. Dark mode is the night — deep cosmic indigo lit by cobalt blue, violet and magenta nebulae. Light mode is daybreak — the same cosmic hues lifted into airy, near-white surfaces, accents held intact."*

---

## Visual foundations

- **Color:** two theme scopes off one accent spine (cobalt `#2D44E0` → violet → nebula magenta). Cosmos surfaces sit on Cosmic Black `#05060F` / Deep Indigo `#1A0E4D`; Daybreak on Cloud White `#F8F9FE` / Lavender Mist `#EEECF8`. Text is Starlight `#C9CEE8` on dark, Ink `#1C2240` on light. Reference **semantic aliases** (`--surface-card`, `--text-primary`, `--accent`, `--gradient-brand`) — they flip automatically between `.cosmos` and `.daybreak`.
- **Type:** Inter only. Display 72/700 (tracking −0.03em), H1 48/600, H2 32/500, Body 18/400 at **1.7 line-height**. Display cuts tuck in tight; body breathes.
- **Gradients:** the signature move. **Nebula gradient** (`#2D44E0 → #6E1FC6 → #B14FD0`, ~120°) on dark; **Daybreak gradient** (`#2D44E0 → #8739E0 → #BC67D5`) on light. A radial **Cosmos wash** sits behind logos and hero cards. Gradients are used with restraint — primary buttons, one hero card, a single highlight badge — not as full-page backgrounds.
- **Backgrounds:** deep flat cosmic fills or the radial cosmos wash. No photography, no textures, no noise. Light mode is near-white and airy.
- **Corners:** roomy and soft. Inputs `--radius-md` 16px, cards `--radius-lg` 20px, hero cards/panels `--radius-xl` 28px, buttons & chips & toggles fully round (`--radius-pill`).
- **Cards:** Cosmos cards are translucent glass (`rgba(255,255,255,0.04)` + hairline border + inner starlight rim + blur); hero cards use the cosmos wash with depth shadow; gradient cards use the nebula wash. Daybreak cards are Lavender Mist with soft cool shadows.
- **Elevation & emphasis:** gradient-filled elements (buttons, hero/gradient cards, gradient badge) are **borderless** — the fill defines the edge. Quiet grouping surfaces (`surface`/`outline` cards, tonal badges) use a 1px low-opacity hairline. Depth comes from a soft `--shadow-cosmos` on Cosmos and soft, low, cool-tinted shadows (`--shadow-sm/md/lg`) on Daybreak.
- **Motion:** calm and settled. `--ease-out` (cubic-bezier .22,1,.36,1), 140/220/420ms. Hover **brightens/lifts** (surface lightens, accent brightens, −3px lift on cards); press **shrinks** to `scale(0.97)`. No bounces, no infinite decorative loops.
- **Borders / hairlines:** 1px at low opacity — `rgba(201,206,232,0.12)` on dark, `rgba(28,34,64,0.10)` on light.
- **Transparency & blur:** used for glass surfaces and floating chrome on Cosmos; sparing on Daybreak.
- **Focus:** 3px cobalt ring (`--focus-shadow`).

---

## Iconography

The brand kit shipped **no icon set** — only the logo mark. Iconography here is therefore a
substitution, **flagged for review**:

- **UI glyphs:** a thin **2px line set** (Lucide-style geometry) defined inline in `ui_kits/celesnity-app/icons.jsx` — star, moon, sun, compass, telescope, bell, calendar, location, etc. Chosen for the minimal, celestial feel. Swap for a licensed set on request.
- **The one true brand asset** is the **logo mark**: an orbiting-star "spark" inside two elliptical orbit rings. Shipped as PNG in `assets/` — `logo-mark-ink.png` (indigo, for light surfaces) and `logo-mark-white.png` (reversed, for cosmic surfaces). Use via the `Logo` component. Clearspace = ¼ mark height.
- **No emoji, no unicode-as-icon.** Stroke weight is consistent (2px); fills reserved for the star mark.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (imports only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `assets/` — `logo-mark-ink.png`, `logo-mark-white.png`.
- `SKILL.md` — Agent-Skill wrapper. · `readme.md` — this file. · `_source/` — provenance (not shipped).

**Components** (`components/core/`, namespace `window.CelesnityDesignSystem_…`)
- `Button` · `IconButton` · `Badge` · `Card` · `StatBlock` · `Input` · `Switch` · `Logo`
- Each: `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`; demo cards `buttons/badges/cards/forms.card.html` + `logo.card.html`.

**UI kit** (`ui_kits/celesnity-app/`)
- `index.html` — interactive stargazing app (login → Tonight → Explore → Plan → Settings, Cosmos ⇄ Daybreak toggle). Built from `app.jsx`, `screens.jsx`, `icons.jsx`.

**Design System tab cards** — Colors (Cosmos, Daybreak, Gradients), Type (Display, Body), Spacing (Scale, Radii), Brand (Logo, Elevation), Components, Celesnity App.
