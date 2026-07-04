<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Celesnity Design System — the single source of truth for brand

The folder `Celesnity Design System Gradient/` is the authoritative, **locked** design system for this project. It defines all brand rules: colors, gradients, typography, spacing, radii, effects, logo, iconography, voice, and core components.

**Rules — non-negotiable:**

- **Never modify anything inside `Celesnity Design System Gradient/`.** It is read-only reference. Do not edit, rename, move, delete, reformat, or "improve" any file there (tokens, `styles.css`, components, assets, guidelines, `_source/`, etc.).
- **All UI in this project MUST conform to it.** Build only from its tokens and rules — no ad-hoc colors, fonts, spacing, or radii.
- Link `Celesnity Design System Gradient/styles.css` (or import its `tokens/*.css`) for tokens + Inter. Reference **semantic aliases** (`--surface-card`/`--surface`, `--text-primary`, `--accent`/`--gradient-brand`, etc.) — **never raw hex**.
- **Theming:** two scopes share one accent spine — Cosmos (dark, default) and Daybreak (light), driven by `[data-theme]`. Components read semantic tokens that flip automatically.
- **Type:** Inter only. Display 72/700 (−0.03em), H1 48/600, H2 32/500, Body 18/400 @ 1.7.
- **Signature gradient** (`#2D44E0 → #6E1FC6 → #B14FD0`) is used sparingly — primary buttons, one hero card, one highlight badge. Not full-page backgrounds.
- Roomy radii (inputs 16px, cards 20px, hero 28px, buttons/chips/toggles pill). **No emoji.** Calm motion (`--ease-out`, 140/220/420ms).
- Read `Celesnity Design System Gradient/readme.md` + `SKILL.md` before designing anything. When in doubt about a brand decision, consult the DS files — do not invent.
