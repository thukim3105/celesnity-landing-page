# Bilingual landing page with next-intl (EN default + VI)

Date: 2026-07-05
Status: Approved (design)

## Goal

Make the Celesnity / Minder AI landing page fully bilingual (English + Vietnamese)
by adopting the `i18n/` setup from the `FUAIHCM-AICapstone/SecureScribeWeb` repo
(next-intl), adapted to this project.

## Decisions (locked)

- **Library:** `next-intl` (same as the reference).
- **Routing:** locale-prefixed via next-intl middleware.
- **Default locale:** `en`, with a **clean root URL** — `localePrefix: 'as-needed'`.
  - `/` serves English (no prefix).
  - `/vi` serves Vietnamese.
  - (Reference used `vi` default + always-prefixed; we intentionally diverge.)
- **Locales:** `['en', 'vi']`.
- **Scope:** the whole landing page **and** the About page are translated — every
  visible string (Hero, HowItWorks, Capabilities, CTA, Header/Nav, Footer, About,
  ThemeToggle, LanguageSwitcher).
- **Vietnamese copy:** drafted by the assistant, reviewed/refined by the user.
- **Not translated:** the Anurati display headline (brand wordmark) stays as-is.

## Current state (audit)

- `next-intl` is **not** installed (`package.json` has only `next`).
- `i18n/` exists but is **empty** (`i18n/messages/` has no files).
- `app/[locale]/` contains **empty scaffolding folders** (auth, bots, chat,
  dashboard, files, meetings, projects, tasks, ... — 0 files), leftover from the
  SecureScribe structure and unused.
- The actual landing page lives at **`app/page.tsx`** (root); About at `app/about/`.
- `app/layout.tsx` holds `<html>`, DS token imports, the pre-paint theme script,
  `Header`, `Footer`, `SmoothScroll`, and metadata.
- `components/layout/LanguageSwitcher.tsx` is an explicit **stub** (local `useState`
  only; comment: "Real i18n routing is deferred to a later section"). Locales come
  from `nav.config` (`LOCALES`, `LocaleCode`, displayed as "EN"/...).
- No `middleware.ts`; `next.config.ts` is empty.

## Reference plumbing (SecureScribeWeb, gathered)

- `i18n/request.ts` (verbatim): `getRequestConfig` → `import('./messages/${locale}.json')`.
- `i18n/navigation.ts`: `createNavigation()`, `locales = ['en','vi']`, exports
  `Link, redirect, usePathname, useRouter, getPathname`.
- `middleware.ts`: `createMiddleware` (default `vi`), matcher on `(vi|en)` + public
  paths excluding api/static, plus a 404 rewrite.
- `i18n/messages/{en,vi}.json`: nested, namespaced by feature area (`Header`,
  `LanguageSwitcher`, `ThemeToggle`, `Common`, ...).

## Design

### 1. Dependencies & config
- Install `next-intl`.
- `next.config.ts`: wrap export with `createNextIntlPlugin('./i18n/request.ts')`.

### 2. i18n core files
- **`i18n/routing.ts`** — `defineRouting({ locales: ['en','vi'], defaultLocale: 'en', localePrefix: 'as-needed' })`.
- **`i18n/navigation.ts`** — `createNavigation(routing)` → `Link, redirect, usePathname, useRouter, getPathname`.
- **`i18n/request.ts`** — `getRequestConfig`: resolve `requestLocale`, fall back to
  `routing.defaultLocale` if unknown, load `./messages/${locale}.json`.
- **`middleware.ts`** — `createMiddleware(routing)`; matcher excludes `/api`,
  `/_next`, static files, and the DS asset paths; matches `/` and `/(en|vi)/:path*`.

### 3. Messages
- **`i18n/messages/en.json`** and **`vi.json`**, namespaced:
  `Nav`, `Header`, `LanguageSwitcher`, `ThemeToggle`, `Hero`, `HowItWorks`,
  `Capabilities`, `CTA`, `Footer`, `About`, `Common`.
- English extracted verbatim from current components; Vietnamese drafted then
  reviewed by the user.

### 4. App restructure
- Move `app/page.tsx` → **`app/[locale]/page.tsx`**; `app/about/` → **`app/[locale]/about/`**.
- **`app/[locale]/layout.tsx`** becomes the root layout:
  - `generateStaticParams` from `routing.locales`.
  - `setRequestLocale(locale)`; `notFound()` for unknown locale.
  - `<html lang={locale}>` + `<body>`, DS token imports, pre-paint theme script.
  - `NextIntlClientProvider` wrapping `Header` / `{children}` / `Footer` / `SmoothScroll`.
  - Per-locale `generateMetadata` (translated title/description; `alternates.languages`
    for `en`/`vi`).
- Old `app/layout.tsx` is absorbed into `app/[locale]/layout.tsx` and removed.
- **Delete** the empty, unused `app/[locale]/{auth,bots,chat,dashboard,files,meetings,
  projects,tasks,privacy,profile,terms-of-service,...}` scaffolding folders.

### 5. Wire the UI
- Rewrite **`LanguageSwitcher`**: `useLocale()` for current, `useRouter()` +
  `usePathname()` from `i18n/navigation` to replace the locale on the current path.
  Keep the "EN"/"VI" display, route with `en`/`vi`; reconcile `nav.config` `LOCALES`
  to carry both the display code and the route locale.
- **Header / NavLinks**: `useTranslations('Nav')`; use next-intl `Link` for
  locale-aware hrefs (active-state logic uses `usePathname` from `i18n/navigation`).
- **Section components** (Hero, HowItWorks, Capabilities, CTA, Footer, About,
  ThemeToggle): replace hardcoded strings with `useTranslations('<Section>')`;
  server components use `getTranslations`.

### 6. SEO / metadata
- `<html lang={locale}>`.
- `generateMetadata` translates title/description per locale.
- `alternates.languages` maps `en` → `/`, `vi` → `/vi`.

## Edge cases
- Unknown locale → `notFound()`.
- DS assets (`Celesnity Design System Gradient/...`, `public/...`) excluded from the
  middleware matcher so they are not locale-rewritten.
- Anurati wordmark headline is not run through translations.
- Theme pre-paint script must still run before first paint inside the new layout.

## Verification
- `/` renders English; `/vi` renders Vietnamese.
- Switching language preserves the current path (e.g. `/vi/about` <-> `/about`).
- No hydration mismatch; theme applies pre-paint with no flash.
- `next build` passes; all sections show translated copy in both locales.

## Out of scope
- Additional locales beyond en/vi.
- Translating any product-app routes (the deleted `[locale]` scaffolding).
- Locale-based number/date formatting beyond what copy needs.
