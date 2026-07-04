# Celesnity Landing Page — Navbar + Design-System Foundation

**Date:** 2026-07-04
**Status:** Design approved (pending spec review)
**Scope:** First section of the Celesnity landing page — the top navigation bar — plus the one-time foundation that wires the locked Celesnity Design System into the Next.js app. Later sections (hero, features, …) reuse this foundation.

---

## 1. Context

- **App:** Next.js 16.2.10, React 19, Tailwind v4, TypeScript. Fresh starter; `app/` tree scaffolded as empty folders.
- **Brand:** `Celesnity Design System Gradient/` is the **locked** source of truth (see `AGENTS.md`). It must not be modified. All UI conforms to its tokens. It ships CSS tokens (`styles.css` + `tokens/*.css`, Inter) and React components (`Logo`, `Button`, `IconButton`, `Badge`, `Card`, …), plus a 2px line icon set in `ui_kits/celesnity-app/icons.jsx`.
- **Product:** Celesnity is an **AI company**; "stargazing" is the brand's visual metaphor only. **Minder AI** is the flagship product. Nav content reflects an AI/SaaS company.
- **Working mode:** section by section. User supplies a reference per section. This round's reference is `navbar.png`.

### Navbar reference (`navbar.png`) — content & layout only

- **Left:** logo mark (image) + wordmark "Celesnity".
- **Center:** links — **Minder AI**, **Solution ▾**, **Resources ▾**, **About Us** (▾ = has dropdown).
- **Right:** language switcher (globe + "EN" ▾) and a theme toggle (sun icon = Cosmos ⇄ Daybreak).

Only content and layout are taken from the image. All color/spacing/typography/radii come from the DS tokens.

---

## 2. Chosen approach

**Reference the DS in place + style new components with CSS Modules that only consume DS tokens.**

- Import the DS `styles.css` (relative path) so all `--*` tokens + Inter load globally. No duplication of tokens.
- Copy only the **PNG logo assets** out of the DS into `public/brand/` (SKILL.md explicitly allows copying assets). The DS folder itself is never modified.
- Reuse the DS `Logo` React component. Build navbar-specific pieces new, styled via CSS Modules referencing DS variables (`var(--surface)`, `var(--text-primary)`, `var(--gradient-brand)`, `var(--border)`, `var(--ease-out)`, …). **Never raw hex.**
- Tailwind v4 stays available for layout utilities (flex/spacing) only; brand values always come from DS tokens.

Rejected: (B) re-declaring DS tokens into Tailwind `@theme` — risks drift from the locked DS. (C) copying the whole DS into `app/` — duplication, drift, against the "single source of truth" rule.

---

## 3. Foundation (one-time setup)

1. **Assets:** copy `Celesnity Design System Gradient/assets/logo-mark-white.png` and `logo-mark-ink.png` → `public/brand/`.
2. **Token load:** in `app/layout.tsx`, import the DS stylesheet (relative import of `styles.css`). Keep `@import "tailwindcss"` in `app/globals.css`. Replace the default starter `globals.css` body rules (Geist/Arial, ad-hoc `--background`/`--foreground`) with DS-driven base styles: `background: var(--bg-base)`, `color: var(--text-primary)`, Inter font family from the DS.
   - If the chained relative `@import`s inside the DS `styles.css` fail to resolve through the bundler (path contains a space), fall back to importing the five `tokens/*.css` files individually. Resolved at implementation time.
3. **Theme mechanism:** DS themes are driven by `[data-theme]` on the root; default (no attribute) = **Cosmos (dark)**, `[data-theme="light"]` = **Daybreak**.
   - An inline script in `app/layout.tsx` runs before paint: reads `localStorage['celesnity-theme']` and sets `document.documentElement.dataset.theme` to avoid a flash of wrong theme.
   - A client `ThemeToggle` flips the attribute and persists the choice.

---

## 4. Navbar architecture

All files under `components/layout/` (matches the scaffolded tree):

| File | Responsibility |
|---|---|
| `Header.tsx` | Client component. Renders the 3-cluster bar; composes the pieces below; owns mobile-drawer open state. |
| `Header.module.css` | All navbar styling via CSS Module, DS tokens only. |
| `NavLinks.tsx` | Renders links from `nav.config.ts`; handles the Solution/Resources dropdowns. |
| `LanguageSwitcher.tsx` | Globe + current locale label + chevron; locale dropdown (EN/VI). |
| `ThemeToggle.tsx` | Sun/moon icon button; Cosmos ⇄ Daybreak. |
| `icons.tsx` | 2px line icons (globe, sun, moon, chevron-down, menu, close) adapted from the DS icon set. |
| `nav.config.ts` | Nav data source. |

- **Logo:** reuse the DS `Logo` component (`variant="lockup"`), `tone` following the active theme (`dark` → white mark on Cosmos, `light` → ink mark on Daybreak), `assetBase` pointing at `/brand/`.
- **Types:**
  ```ts
  type NavChild = { label: string; href: string };
  type NavItem = { label: string; href?: string; children?: NavChild[] };
  ```
- **Config (initial):**
  ```ts
  const NAV: NavItem[] = [
    { label: 'Minder AI', href: '#' },
    { label: 'Solution', children: [] },   // filled when user provides the ref
    { label: 'Resources', children: [] },  // filled when user provides the ref
    { label: 'About Us', href: '#' },
  ];
  ```

---

## 5. Layout & content

- **Bar:** sticky top, full-bleed background, solid dark **Cosmos surface** (not glass — matches the reference); hairline bottom border `var(--border)`. On Daybreak it flips to the light surface automatically via tokens.
- **Container:** inner content centered, `width: min(100% - 2*pad, 1360px)`, horizontal padding `clamp(16px, 4vw, 40px)`.
- **Height:** `clamp(60px, 8vh, 76px)`.
- **Left cluster:** `Logo` lockup (mark + "Celesnity").
- **Center cluster:** the 4 links, gap via `clamp()` so they fit from 768px up. Links rest at `--text-muted`; hover **brightens** to `--text-primary`, transition `140ms var(--ease-out)` (DS motion). Dropdown items show a chevron.
- **Right cluster:** LanguageSwitcher then ThemeToggle, ~12px apart.
- Rounded/pill controls per DS radii. **No emoji.** Icons are the 2px line set. Focus: DS focus ring (`--focus-shadow` / `--focus-ring`).

---

## 6. Behavior

- **ThemeToggle:** toggles Cosmos ⇄ Daybreak by setting `data-theme`; shows a **sun** icon on dark (tap → light) and a **moon** on light. Persists to `localStorage['celesnity-theme']`. Logo mark and all colors flip via tokens.
- **LanguageSwitcher:** dropdown with **EN / VI**. This phase is a **stub** — it only changes the displayed label and opens/closes; it does **not** implement i18n routing yet (deferred to a later section).
- **Dropdowns (Solution / Resources):** accessible trigger buttons with `aria-expanded`; click opens a panel below; closes on outside click and `Esc`; arrow-key navigation between items. Menu content is an **empty placeholder** now (structure ready to fill from `nav.config.ts` once the user provides the reference).

---

## 7. Responsive (phones → tablets → 16:9/16:10 desktop → long/ultra-wide)

Single bar, full-bleed background, contained centered content; spacing/height scale smoothly with `clamp()` rather than jumping per breakpoint.

| Screen group | Width | Navbar behavior |
|---|---|---|
| Phones | < 768px | Logo left + **hamburger** right → drawer (links + language + theme). Touch targets ≥ 44px; respect `safe-area-inset` (notch). Lock body scroll when open. |
| Tablets (portrait & up) | 768–1023px | **Full horizontal row**; gaps tightened via `clamp()` so everything fits. |
| Tablet landscape / small laptop | 1024–1439px | Full horizontal row. |
| Desktop 16:9 / 16:10 | 1440–1919px | Full row; content capped ~1360px centered; side padding grows via `clamp()`. |
| Large / long (21:9, 32:9, 4K) | ≥ 1920px | Background full-bleed; **content capped ~1360px centered** so it never over-stretches; wide side padding. |

- **Collapse breakpoint:** `< 768px` → hamburger drawer; `≥ 768px` → full row.
- **Drawer:** overlay + panel; closes on link select / outside click / `Esc`; body scroll locked while open.

---

## 8. Testing / verification

Pure UI, so primary verification is running the app and observing behavior:

1. Run `next dev`; confirm navbar content + layout match the reference at the base desktop width.
2. Toggle Cosmos ⇄ Daybreak: colors and the logo mark flip correctly; choice persists across reload with no flash.
3. Dropdowns open/close (mouse + keyboard); language switcher opens EN/VI.
4. Responsive check at **360, 768, 1024, 1440, 1920, 2560px**, in both themes; hamburger drawer works < 768px.
5. Basic a11y: visible DS focus ring, `aria-expanded` on dropdowns, keyboard operability, ≥44px touch targets on mobile.
6. **Smoke test (light):** a single test asserting `Header` renders the 4 nav labels and the theme toggle. (No test framework is installed yet; this adds a minimal setup. Can be dropped if the user prefers to keep it lean.)

---

## 9. Constraints & non-goals

- **Do not modify** anything in `Celesnity Design System Gradient/`. Copy assets only.
- No raw hex / ad-hoc fonts / spacing — DS tokens only.
- **Non-goals this round:** real i18n routing, dropdown menu contents, other page sections, backend/links wiring. Nav `href`s are placeholders (`#`).

---

## 10. Open items (deferred, not blocking)

- Contents of Solution / Resources dropdowns — await user reference.
- Final destinations for nav links.
- Whether to keep the smoke test (default: yes, minimal).
