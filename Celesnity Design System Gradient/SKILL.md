---
name: celesnity-design
description: Use this skill to generate well-branded interfaces and assets for Celesnity, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Brand:** Celesnity — a celestial stargazing product. Mood: cosmic, calm, confident, human. "Two skies, one identity."
- **Two theme scopes:** `.cosmos` (dark, default) and `.daybreak` (light). Put one on a wrapper; components read semantic tokens that flip automatically.
- **Link** `styles.css` for all tokens + Inter. Reference semantic aliases (`--surface-card`, `--text-primary`, `--accent`, `--gradient-brand`) — never raw hex.
- **Type:** Inter only. Display 72/700 (−0.03em), H1 48/600, H2 32/500, Body 18/400 @ 1.7.
- **Signature:** the nebula gradient (`#2D44E0 → #6E1FC6 → #B14FD0`) on primary buttons / one hero card / one highlight badge — used sparingly. Big-number readouts. Pill buttons. Roomy 20–28px card radii. Cosmos surfaces glow; Daybreak surfaces cast soft cool shadows.
- **Logo:** `assets/logo-mark-*.png` via the `Logo` component (`tone="dark"` = white mark on cosmos, `tone="light"` = ink mark). Clearspace ¼ mark height.
- **No emoji.** Iconography is a flagged 2px line set (see README) — not part of the brand kit.

## Files
- `readme.md` — full brand guide (content voice, visual foundations, iconography, manifest).
- `styles.css` + `tokens/` — CSS custom properties and fonts.
- `components/core/` — Button, IconButton, Badge, Card, StatBlock, Input, Switch, Logo (React).
- `ui_kits/celesnity-app/` — interactive stargazing app recreation.
- `assets/` — logo marks.
