# Bilingual Landing Page (next-intl) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Celesnity / Minder AI landing page fully bilingual (English default + Vietnamese) using next-intl with locale-prefixed routing.

**Architecture:** Adopt next-intl the way `SecureScribeWeb` does — `i18n/{routing,navigation,request}.ts` + `middleware.ts` + `i18n/messages/{en,vi}.json`. Move the landing page and About under `app/[locale]/`, where a single `app/[locale]/layout.tsx` becomes the root layout (renders `<html lang>`, the design-system imports, the theme script, and `NextIntlClientProvider`). Every visible string is read from message files via `useTranslations` (client) / `getTranslations` (server).

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, next-intl, CSS Modules, Celesnity Design System (locked).

## Global Constraints

- **Library:** `next-intl` only. No other i18n library.
- **Locales:** exactly `['en', 'vi']`. `defaultLocale: 'en'`. `localePrefix: 'as-needed'` (`/` = English, `/vi` = Vietnamese).
- **Do NOT modify** anything under `Celesnity Design System Gradient/`. Reference DS tokens only.
- **Preserve existing English copy verbatim** (including the `’` right-single-quote and existing `—` em-dashes in current strings). This task adds Vietnamese; it does not rewrite English.
- **Not translated (stay hardcoded):** the CTA Anurati headline `LET’S TALK`, the `Celesnity` wordmark in `Logo`, the `Minder AI` product name, email address `start@celesnity.com`, step/item numbers (`01`–`06`), image paths.
- **Next 16 App Router:** route `params` is a `Promise` — always `await params`. Add `setRequestLocale(locale)` in every localized page/layout for static rendering.
- **Testing approach:** this repo has **no unit-test runner** (scripts are only `dev`/`build`/`lint`). Verification per task is therefore: `npm run build` (type + route compile), `npm run lint`, and **route-content checks** (`curl` the running dev server and grep for the expected rendered string). This is the correct test cycle for a routing/config/content refactor — do not add a unit-test framework.

---

### Task 1: Install next-intl and wire the config plugin

**Files:**
- Modify: `package.json` (adds dependency)
- Modify: `next.config.ts`

**Interfaces:**
- Produces: the `next-intl` package available for import; `next.config.ts` wrapped so `./i18n/request.ts` is loaded as the request config.

- [ ] **Step 1: Install the package**

Run:
```bash
npm install next-intl
```
Expected: `package.json` gains `"next-intl"` under dependencies; install completes with no error.

- [ ] **Step 2: Wrap next.config with the next-intl plugin**

Replace the entire contents of `next.config.ts` with:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Verify it still type-checks / builds the config**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors from `next.config.ts` (there may be pre-existing errors elsewhere; `next.config.ts` and `next-intl/plugin` must resolve cleanly).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore(i18n): install next-intl and wire config plugin"
```

---

### Task 2: i18n core files (routing, navigation, request) and middleware

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/navigation.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`

**Interfaces:**
- Produces:
  - `routing` (from `i18n/routing.ts`) — a next-intl routing config with `locales: ['en','vi']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'`.
  - `i18n/navigation.ts` exports `Link, redirect, usePathname, useRouter, getPathname` — locale-aware navigation bound to `routing`.
  - `i18n/request.ts` default export — resolves the active locale and loads `./messages/${locale}.json`.
  - `middleware.ts` — locale routing middleware + matcher.

- [ ] **Step 1: Create the routing config**

Create `i18n/routing.ts`:
```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
```

- [ ] **Step 2: Create the navigation helpers**

Create `i18n/navigation.ts`:
```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 3: Create the request config**

Create `i18n/request.ts`:
```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Create the middleware**

Create `middleware.ts` (repo root):
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, Next internals, and any file with a
  // dot (static assets, DS images under /public, favicon, etc.).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 5: Verify type-check passes**

Run:
```bash
npx tsc --noEmit
```
Expected: no new errors from the four created files. (`i18n/request.ts` imports `./messages/en.json`/`vi.json` dynamically — a string template, so no compile error even before Task 3 creates them.)

- [ ] **Step 6: Commit**

```bash
git add i18n/routing.ts i18n/navigation.ts i18n/request.ts middleware.ts
git commit -m "feat(i18n): add next-intl routing, navigation, request config, middleware"
```

---

### Task 3: Message files (en.json + vi.json)

**Files:**
- Create: `i18n/messages/en.json`
- Create: `i18n/messages/vi.json`

**Interfaces:**
- Produces: two message catalogs with identical key structure across these namespaces: `Meta`, `Nav`, `Header`, `LanguageSwitcher`, `ThemeToggle`, `Hero`, `HowItWorks`, `Capabilities`, `CTA`, `Footer`, `About`. Consumed by every component task (5–8) and the layout (Task 4).

- [ ] **Step 1: Create the English catalog**

Create `i18n/messages/en.json`:
```json
{
  "Meta": {
    "homeTitle": "Celesnity — Minder AI",
    "homeDescription": "Celesnity — an AI company. Reach the stars with Minder AI and more.",
    "aboutTitle": "About Us — Celesnity",
    "aboutDescription": "Celesnity — an AI company building Minder AI."
  },
  "Nav": {
    "minderAI": "Minder AI",
    "solution": "Solution",
    "resources": "Resources",
    "about": "About Us",
    "comingSoon": "Coming soon"
  },
  "Header": {
    "brandHome": "Celesnity home",
    "primaryNav": "Primary",
    "openMenu": "Open menu",
    "menu": "Menu",
    "closeMenu": "Close menu"
  },
  "LanguageSwitcher": {
    "label": "Select language"
  },
  "ThemeToggle": {
    "label": "Switch between dark and light theme"
  },
  "Hero": {
    "heading": "Minder AI",
    "leadLine1": "Increase workforce productivity, capture every action as data,",
    "leadLine2": "and make operations instantly searchable.",
    "cta": "Request a demo"
  },
  "HowItWorks": {
    "headingLine1": "Easy to set up,",
    "headingLine2": "simple to use",
    "steps": [
      {
        "title": "Install the Hardware",
        "points": [
          "Set up Minder AI in the work area",
          "Celesnity engineers deploy and configure the system on-site",
          "Gather factory-specific operational information"
        ]
      },
      {
        "title": "Configure the Software",
        "points": [
          "Connect Minder AI to existing processes",
          "Define user roles and permissions",
          "Customize terminology, workflows, and operational stages"
        ]
      },
      {
        "title": "Start Using Minder AI",
        "points": [
          "Workers log in and interact using voice commands",
          "AI supports daily operations immediately",
          "Continuous learning and optimization from usage"
        ]
      }
    ]
  },
  "Capabilities": {
    "sectionTitle": "One Platform for the Entire Operation",
    "items": [
      "Onboard new hires fast",
      "Catch errors in the workflow",
      "Capture production data automatically",
      "Reporting on demand",
      "Scheduling",
      "Ask the operation anything, in plain language"
    ]
  },
  "CTA": {
    "lead": "If your workers are juggling between machines and shifts and you’re curious how to save cost and increase productivity.",
    "thanks": "Thanks — we’ll be in touch shortly.",
    "emailLabel": "Work email",
    "emailPlaceholder": "your@email.com",
    "button": "Request a demo",
    "emailUsPrefix": "Or email us directly at "
  },
  "Footer": {
    "minderAI": "Minder AI",
    "solution": "Solution",
    "manufacturing": "Manufacturing",
    "logistics": "Logistics",
    "resources": "Resources",
    "blogs": "Blogs",
    "caseStudy": "Case Study",
    "guides": "Guides",
    "glossary": "Glossary",
    "about": "About Us",
    "copyright": "© 2026 Celesnity Ltd · Minder AI · All rights reserved."
  },
  "About": {
    "eyebrow": "About Us",
    "heading": "Reach the stars.",
    "lead": "Celesnity is an AI company building Minder AI — turning the factory floor into searchable, actionable data so teams work smarter, catch errors sooner, and scale without the chaos."
  }
}
```

- [ ] **Step 2: Create the Vietnamese catalog**

Create `i18n/messages/vi.json`:
```json
{
  "Meta": {
    "homeTitle": "Celesnity — Minder AI",
    "homeDescription": "Celesnity — công ty AI. Vươn tới những vì sao cùng Minder AI và hơn thế nữa.",
    "aboutTitle": "Về chúng tôi — Celesnity",
    "aboutDescription": "Celesnity — công ty AI xây dựng Minder AI."
  },
  "Nav": {
    "minderAI": "Minder AI",
    "solution": "Giải pháp",
    "resources": "Tài nguyên",
    "about": "Về chúng tôi",
    "comingSoon": "Sắp ra mắt"
  },
  "Header": {
    "brandHome": "Celesnity trang chủ",
    "primaryNav": "Điều hướng chính",
    "openMenu": "Mở menu",
    "menu": "Menu",
    "closeMenu": "Đóng menu"
  },
  "LanguageSwitcher": {
    "label": "Chọn ngôn ngữ"
  },
  "ThemeToggle": {
    "label": "Chuyển giữa giao diện tối và sáng"
  },
  "Hero": {
    "heading": "Minder AI",
    "leadLine1": "Tăng năng suất lao động, ghi lại mọi thao tác thành dữ liệu,",
    "leadLine2": "và giúp toàn bộ vận hành có thể tìm kiếm tức thì.",
    "cta": "Yêu cầu demo"
  },
  "HowItWorks": {
    "headingLine1": "Dễ cài đặt,",
    "headingLine2": "đơn giản để dùng",
    "steps": [
      {
        "title": "Lắp đặt phần cứng",
        "points": [
          "Lắp đặt Minder AI tại khu vực làm việc",
          "Kỹ sư Celesnity triển khai và cấu hình hệ thống tại chỗ",
          "Thu thập thông tin vận hành riêng của nhà máy"
        ]
      },
      {
        "title": "Cấu hình phần mềm",
        "points": [
          "Kết nối Minder AI với các quy trình hiện có",
          "Thiết lập vai trò và quyền của người dùng",
          "Tùy chỉnh thuật ngữ, quy trình và các giai đoạn vận hành"
        ]
      },
      {
        "title": "Bắt đầu dùng Minder AI",
        "points": [
          "Công nhân đăng nhập và tương tác bằng lệnh giọng nói",
          "AI hỗ trợ vận hành hằng ngày ngay lập tức",
          "Liên tục học hỏi và tối ưu từ quá trình sử dụng"
        ]
      }
    ]
  },
  "Capabilities": {
    "sectionTitle": "Một nền tảng cho toàn bộ vận hành",
    "items": [
      "Đào tạo nhân viên mới nhanh chóng",
      "Phát hiện lỗi trong quy trình",
      "Tự động ghi lại dữ liệu sản xuất",
      "Báo cáo theo yêu cầu",
      "Lập lịch",
      "Hỏi bất cứ điều gì về vận hành, bằng ngôn ngữ tự nhiên"
    ]
  },
  "CTA": {
    "lead": "Nếu công nhân của bạn phải xoay xở giữa nhiều máy móc và ca kíp, và bạn muốn biết cách tiết kiệm chi phí và tăng năng suất.",
    "thanks": "Cảm ơn bạn, chúng tôi sẽ liên hệ trong thời gian ngắn.",
    "emailLabel": "Email công việc",
    "emailPlaceholder": "your@email.com",
    "button": "Yêu cầu demo",
    "emailUsPrefix": "Hoặc gửi email trực tiếp cho chúng tôi tại "
  },
  "Footer": {
    "minderAI": "Minder AI",
    "solution": "Giải pháp",
    "manufacturing": "Sản xuất",
    "logistics": "Hậu cần",
    "resources": "Tài nguyên",
    "blogs": "Bài viết",
    "caseStudy": "Nghiên cứu điển hình",
    "guides": "Hướng dẫn",
    "glossary": "Thuật ngữ",
    "about": "Về chúng tôi",
    "copyright": "© 2026 Celesnity Ltd · Minder AI · Bảo lưu mọi quyền."
  },
  "About": {
    "eyebrow": "Về chúng tôi",
    "heading": "Vươn tới những vì sao.",
    "lead": "Celesnity là công ty AI xây dựng Minder AI, biến sàn nhà máy thành dữ liệu có thể tìm kiếm và hành động, để các đội ngũ làm việc thông minh hơn, phát hiện lỗi sớm hơn và mở rộng quy mô mà không hỗn loạn."
  }
}
```

- [ ] **Step 3: Verify both files parse and have identical key structure**

Run:
```bash
node -e "const en=require('./i18n/messages/en.json'),vi=require('./i18n/messages/vi.json');const keys=o=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?keys(v).map(s=>k+'.'+s):[k]);const a=keys(en).sort(),b=keys(vi).sort();const diff=[...a.filter(k=>!b.includes(k)),...b.filter(k=>!a.includes(k))];if(diff.length){console.error('KEY MISMATCH:',diff);process.exit(1)}console.log('OK: '+a.length+' keys match')"
```
Expected: `OK: <n> keys match` (no `KEY MISMATCH`).

- [ ] **Step 4: Commit**

```bash
git add i18n/messages/en.json i18n/messages/vi.json
git commit -m "feat(i18n): add en/vi message catalogs for the landing page"
```

---

### Task 4: App restructure — move pages under [locale], new root layout, delete scaffolding

**Files:**
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx` (moved from `app/page.tsx`)
- Create: `app/[locale]/about/page.tsx` (moved from `app/about/page.tsx`)
- Create: `app/[locale]/about/about.module.css` (moved from `app/about/about.module.css`)
- Delete: `app/layout.tsx`, `app/page.tsx`, `app/about/` (old location)
- Delete: empty scaffolding `app/[locale]/{auth,bots,chat,dashboard,files,meetings,privacy,profile,projects,tasks,terms-of-service}`

**Interfaces:**
- Consumes: `routing` (Task 2), `Meta` namespace (Task 3).
- Produces: `app/[locale]/layout.tsx` as the root layout providing `<html lang={locale}>`, DS imports, theme script, and `NextIntlClientProvider`; localized routes `/` (+ `/vi`) and `/about` (+ `/vi/about`). Later component tasks assume they render inside `NextIntlClientProvider`.

- [ ] **Step 1: Move the About page files to the new location**

Run:
```bash
mkdir -p "app/[locale]/about"
git mv "app/about/page.tsx" "app/[locale]/about/page.tsx"
git mv "app/about/about.module.css" "app/[locale]/about/about.module.css"
git mv "app/page.tsx" "app/[locale]/page.tsx"
```
Expected: files relocated; `app/about/` now empty.

- [ ] **Step 2: Create the localized root layout**

Create `app/[locale]/layout.tsx` (absorbs the old `app/layout.tsx`; DS import paths go up two levels now):
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

// --- Celesnity Design System (LOCKED source of truth) ---
import "../../Celesnity Design System Gradient/tokens/fonts.css";
import "../../Celesnity Design System Gradient/tokens/colors.css";
import "../../Celesnity Design System Gradient/tokens/typography.css";
import "../../Celesnity Design System Gradient/tokens/spacing.css";
import "../../Celesnity Design System Gradient/tokens/effects.css";
import "../globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

// Applies the saved theme before first paint to avoid a flash of the wrong sky.
const themeScript = `(function(){try{var t=localStorage.getItem("celesnity-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..700;1,14..32,400..700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <SmoothScroll />
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add setRequestLocale to the moved Home page**

Replace the contents of `app/[locale]/page.tsx` with:
```tsx
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { HowItWorks } from "@/components/steps/HowItWorks";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { CTA } from "@/components/cta/CTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <Hero />
      <HowItWorks />
      <Capabilities />
      <CTA />
    </main>
  );
}
```

- [ ] **Step 4: Delete the old root layout and empty About dir**

Run:
```bash
git rm app/layout.tsx
rmdir "app/about" 2>/dev/null || true
```
Expected: `app/layout.tsx` removed; `app/about/` gone.

- [ ] **Step 5: Delete the unused empty [locale] scaffolding**

Run (bash):
```bash
for d in auth bots chat dashboard files meetings privacy profile projects tasks terms-of-service; do rm -rf "app/[locale]/$d"; done
find "app/[locale]" -maxdepth 2 -type d
```
Expected: the listing shows only `app/[locale]`, `app/[locale]/about` (no auth/bots/chat/etc.).

- [ ] **Step 6: Build to verify routing + layout compile**

Run:
```bash
npm run build
```
Expected: build succeeds; output route list includes `/[locale]` and `/[locale]/about` (or `/` and `/vi`). No "root layout" error.

- [ ] **Step 7: Smoke-check both locales render (English still hardcoded in components at this point)**

Run:
```bash
npm run dev &
sleep 6
curl -s http://localhost:3000/ | grep -o "One Platform for the Entire Operation" | head -1
curl -s http://localhost:3000/vi | grep -o "One Platform for the Entire Operation" | head -1
kill %1 2>/dev/null || true
```
Expected: both `curl`s print `One Platform for the Entire Operation` (components not yet translated — proves both routes render and the layout/provider work).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(i18n): move landing + about under app/[locale] with next-intl root layout"
```

---

### Task 5: LanguageSwitcher + nav.config (real locale switching)

**Files:**
- Modify: `components/layout/nav.config.ts`
- Modify: `components/layout/LanguageSwitcher.tsx`

**Interfaces:**
- Consumes: `useRouter`, `usePathname` from `@/i18n/navigation` (Task 2); `useLocale` from `next-intl`; `LanguageSwitcher` namespace + `Nav` labels (Task 3).
- Produces:
  - `nav.config.ts` exports `NAV_ITEMS` with `labelKey`/`href` (labels resolved via translations), plus `LOCALES: { code: LocaleCode; route: 'en'|'vi'; label: string }[]`.
  - `LanguageSwitcher` that navigates `/` <-> `/vi` preserving the current path.

- [ ] **Step 1: Restructure nav.config to translation keys + locale routes**

Replace the entire contents of `components/layout/nav.config.ts` with:
```ts
/**
 * Navigation data source for the Celesnity header. Labels are translation keys
 * resolved in NavLinks via the `Nav` namespace; hrefs are locale-relative
 * (next-intl Link prefixes the active locale).
 */
export type NavChild = { labelKey: string; href: string };
export type NavItem = { labelKey: string; href?: string; children?: NavChild[] };

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "minderAI", href: "/" },
  { labelKey: "solution", children: [] },
  { labelKey: "resources", children: [] },
  { labelKey: "about", href: "/about" },
];

export type LocaleCode = "EN" | "VI";
export const LOCALES: { code: LocaleCode; route: "en" | "vi"; label: string }[] = [
  { code: "EN", route: "en", label: "English" },
  { code: "VI", route: "vi", label: "Tiếng Việt" },
];
```

- [ ] **Step 2: Rewrite LanguageSwitcher to switch the locale route**

Replace the entire contents of `components/layout/LanguageSwitcher.tsx` with:
```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "./icons";
import { LOCALES } from "./nav.config";
import { useDismiss } from "./useDismiss";
import styles from "./Header.module.css";

/**
 * Language switcher (globe + current locale + chevron). Replaces the active
 * locale on the current path via next-intl navigation, so /about <-> /vi/about.
 */
export function LanguageSwitcher({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  const t = useTranslations("LanguageSwitcher");
  const activeRoute = useLocale(); // "en" | "vi"
  const pathname = usePathname(); // path without the locale prefix
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const current = LOCALES.find((l) => l.route === activeRoute) ?? LOCALES[0];

  return (
    <div
      ref={ref}
      className={variant === "drawer" ? styles.langSwitcherDrawer : styles.langSwitcher}
    >
      <button
        type="button"
        className={styles.langButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="globe" size={18} />
        <span className={styles.langCode}>{current.code}</span>
        <span className={open ? styles.chevronOpen : styles.chevron}>
          <Icon name="chevronDown" size={16} />
        </span>
      </button>

      {open && (
        <ul className={styles.menu} role="menu">
          {LOCALES.map((l) => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.route === activeRoute}
                className={l.route === activeRoute ? styles.menuItemActive : styles.menuItem}
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: l.route });
                }}
              >
                <span className={styles.localeCode}>{l.code}</span>
                <span className={styles.localeLabel}>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build to catch type errors (NavLinks still uses old shape — expected to fail here)**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -i "nav.config\|NavLinks\|labelKey\|label" | head
```
Expected: TypeScript flags `NavLinks.tsx` using `item.label` (now `labelKey`). This is expected — Task 6 fixes `NavLinks`. Proceed; do not commit a broken build alone — **Task 5 and Task 6 are committed together after Task 6’s verification.**

- [ ] **Step 4: (No commit yet — continue to Task 6)**

`NAV_ITEMS`/`LanguageSwitcher` changes compile only once `NavLinks` is updated. Commit at the end of Task 6.

---

### Task 6: Header + NavLinks translations

**Files:**
- Modify: `components/layout/NavLinks.tsx`
- Modify: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `NAV_ITEMS` with `labelKey` (Task 5); `Nav` + `Header` namespaces (Task 3); `Link`, `usePathname` from `@/i18n/navigation` (Task 2).
- Produces: fully localized header/nav; commit that makes Tasks 5+6 build cleanly.

- [ ] **Step 1: Update NavLinks to resolve labels via translations and use next-intl Link**

Replace the entire contents of `components/layout/NavLinks.tsx` with:
```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { Icon } from "./icons";
import { NAV_ITEMS, type NavItem } from "./nav.config";
import { useDismiss } from "./useDismiss";
import styles from "./Header.module.css";

/** Whether a nav href is the current route. */
function useIsActive() {
  const pathname = usePathname();
  return (href?: string) => !!href && href !== "#" && href === pathname;
}

function DropdownPanel({ item, label }: { item: NavItem; label: string }) {
  const t = useTranslations("Nav");
  const children = item.children ?? [];
  return (
    <ul className={styles.menu} role="menu" aria-label={label}>
      {children.length === 0 ? (
        <li role="none" className={styles.menuEmpty}>
          {t("comingSoon")}
        </li>
      ) : (
        children.map((child) => (
          <li key={child.labelKey} role="none">
            <a role="menuitem" className={styles.menuItem} href={child.href}>
              {t(child.labelKey)}
            </a>
          </li>
        ))
      )}
    </ul>
  );
}

/** Horizontal nav links for the bar (>=768px). */
function BarNav() {
  const t = useTranslations("Nav");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLUListElement>(null);
  const close = useCallback(() => setOpenIndex(null), []);
  useDismiss(ref, openIndex !== null, close);
  const isActive = useIsActive();

  return (
    <ul ref={ref} className={styles.navList}>
      {NAV_ITEMS.map((item, index) =>
        item.children ? (
          <li key={item.labelKey} className={styles.navItem}>
            <button
              type="button"
              className={styles.navTrigger}
              aria-haspopup="menu"
              aria-expanded={openIndex === index}
              onClick={() => setOpenIndex((v) => (v === index ? null : index))}
            >
              {t(item.labelKey)}
              <span className={openIndex === index ? styles.chevronOpen : styles.chevron}>
                <Icon name="chevronDown" size={16} />
              </span>
            </button>
            {openIndex === index && <DropdownPanel item={item} label={t(item.labelKey)} />}
          </li>
        ) : (
          <li key={item.labelKey} className={styles.navItem}>
            <Link
              className={
                isActive(item.href)
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
              href={item.href ?? "#"}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

/** Vertical nav for the mobile drawer (<768px). */
function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("Nav");
  const isActive = useIsActive();
  return (
    <ul className={styles.drawerNavList}>
      {NAV_ITEMS.map((item) => (
        <li key={item.labelKey} className={styles.drawerNavItem}>
          {item.children ? (
            <>
              <span className={styles.drawerGroupLabel}>{t(item.labelKey)}</span>
              {item.children.length === 0 ? (
                <span className={styles.drawerEmpty}>{t("comingSoon")}</span>
              ) : (
                <ul className={styles.drawerSubList}>
                  {item.children.map((child) => (
                    <li key={child.labelKey}>
                      <a className={styles.drawerSubLink} href={child.href} onClick={onNavigate}>
                        {t(child.labelKey)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Link
              className={
                isActive(item.href)
                  ? `${styles.drawerNavLink} ${styles.drawerNavLinkActive}`
                  : styles.drawerNavLink
              }
              href={item.href ?? "#"}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={onNavigate}
            >
              {t(item.labelKey)}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function NavLinks({
  variant = "bar",
  onNavigate,
}: {
  variant?: "bar" | "drawer";
  onNavigate?: () => void;
}) {
  return variant === "drawer" ? (
    <DrawerNav onNavigate={onNavigate ?? (() => {})} />
  ) : (
    <BarNav />
  );
}
```

- [ ] **Step 2: Localize the Header aria labels**

In `components/layout/Header.tsx`, add the translations hook and replace the hardcoded aria strings.

Add after the existing imports:
```tsx
import { useTranslations } from "next-intl";
```
Inside `Header()`, immediately after `const closeDrawer = ...`, add:
```tsx
  const t = useTranslations("Header");
```
Then replace these attributes:
- `aria-label="Celesnity home"` → `aria-label={t("brandHome")}`
- `aria-label="Primary"` → `aria-label={t("primaryNav")}`
- `aria-label="Open menu"` → `aria-label={t("openMenu")}`
- `aria-label="Menu"` (the drawer `role="dialog"`) → `aria-label={t("menu")}`
- `aria-label="Close menu"` → `aria-label={t("closeMenu")}`

- [ ] **Step 3: Build to verify Tasks 5+6 compile**

Run:
```bash
npm run build
```
Expected: build succeeds (no `labelKey`/`label` type errors).

- [ ] **Step 4: Verify nav is translated on /vi**

Run:
```bash
npm run dev &
sleep 6
echo "EN:"; curl -s http://localhost:3000/ | grep -o "About Us" | head -1
echo "VI:"; curl -s http://localhost:3000/vi | grep -o "Về chúng tôi" | head -1
kill %1 2>/dev/null || true
```
Expected: EN prints `About Us`; VI prints `Về chúng tôi`.

- [ ] **Step 5: Commit (Tasks 5 + 6 together)**

```bash
git add components/layout/nav.config.ts components/layout/LanguageSwitcher.tsx components/layout/NavLinks.tsx components/layout/Header.tsx
git commit -m "feat(i18n): localize header/nav and wire real EN/VI locale switching"
```

---

### Task 7: Localize the server components (Hero, Footer, About)

**Files:**
- Modify: `components/hero/Hero.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `app/[locale]/about/page.tsx`

**Interfaces:**
- Consumes: `getTranslations` from `next-intl/server`; `Hero`, `Footer`, `About`, `Meta` namespaces (Task 3).
- Produces: three localized server components.

- [ ] **Step 1: Localize Hero (make it an async server component)**

In `components/hero/Hero.tsx`, add the import at the top:
```tsx
import { getTranslations } from "next-intl/server";
```
Change the function signature to async and read translations:
```tsx
export async function Hero() {
  const t = await getTranslations("Hero");
```
Replace the heading, lead, and CTA JSX with:
```tsx
        <Reveal>
          <h1 className={styles.heading}>{t("heading")}</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className={styles.lead}>
            {t("leadLine1")}
            <br />
            {t("leadLine2")}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className={styles.actions}>
            <a className={styles.cta} href="#">
              {t("cta")}
            </a>
          </div>
        </Reveal>
```

- [ ] **Step 2: Localize Footer (make it async, resolve labels from the Footer namespace)**

Replace the entire contents of `components/layout/Footer.tsx` with:
```tsx
import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

type Group = { labelKey: string; href?: string; links?: { labelKey: string; href: string }[] };

const GROUPS: Group[] = [
  { labelKey: "minderAI", href: "#" },
  {
    labelKey: "solution",
    links: [
      { labelKey: "manufacturing", href: "#" },
      { labelKey: "logistics", href: "#" },
    ],
  },
  {
    labelKey: "resources",
    links: [
      { labelKey: "blogs", href: "#" },
      { labelKey: "caseStudy", href: "#" },
      { labelKey: "guides", href: "#" },
      { labelKey: "glossary", href: "#" },
    ],
  },
  { labelKey: "about", href: "#" },
];

/** Site footer — brand lockup, nav groups, copyright. DS tokens only. */
export async function Footer() {
  const t = await getTranslations("Footer");
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
          </div>

          {GROUPS.map((g) => (
            <div key={g.labelKey} className={styles.col}>
              {g.links ? (
                <span className={styles.colHead}>{t(g.labelKey)}</span>
              ) : (
                <a className={styles.colHead} href={g.href}>
                  {t(g.labelKey)}
                </a>
              )}
              {g.links && (
                <ul className={styles.colLinks}>
                  {g.links.map((l) => (
                    <li key={l.labelKey}>
                      <a href={l.href}>{t(l.labelKey)}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <p className={styles.copyright}>{t("copyright")}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Localize the About page**

Replace the entire contents of `app/[locale]/about/page.tsx` with:
```tsx
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import styles from "./about.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  return (
    <main className={styles.main}>
      <section className={styles.section}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.heading}>{t("heading")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 5: Verify Hero/Footer/About translate on /vi**

Run:
```bash
npm run dev &
sleep 6
echo "Hero VI:"; curl -s http://localhost:3000/vi | grep -o "Tăng năng suất lao động" | head -1
echo "Footer VI:"; curl -s http://localhost:3000/vi | grep -o "Bảo lưu mọi quyền" | head -1
echo "About VI:"; curl -s http://localhost:3000/vi/about | grep -o "Vươn tới những vì sao" | head -1
echo "About EN:"; curl -s http://localhost:3000/about | grep -o "Reach the stars" | head -1
kill %1 2>/dev/null || true
```
Expected: the three VI greps print the Vietnamese strings; About EN prints `Reach the stars`.

- [ ] **Step 6: Commit**

```bash
git add components/hero/Hero.tsx components/layout/Footer.tsx "app/[locale]/about/page.tsx"
git commit -m "feat(i18n): localize hero, footer, and about (server components)"
```

---

### Task 8: Localize the client components (HowItWorks, Capabilities, CTA, ThemeToggle)

**Files:**
- Modify: `components/steps/HowItWorks.tsx`
- Modify: `components/capabilities/Capabilities.tsx`
- Modify: `components/cta/CTA.tsx`
- Modify: `components/layout/ThemeToggle.tsx`

**Interfaces:**
- Consumes: `useTranslations` from `next-intl`; `HowItWorks`, `Capabilities`, `CTA`, `ThemeToggle` namespaces (Task 3). `t.raw(...)` returns arrays for `steps`/`items`.
- Produces: the four localized client components; site fully bilingual.

- [ ] **Step 1: HowItWorks — pull titles/points/heading from translations**

In `components/steps/HowItWorks.tsx`:

Add the import:
```tsx
import { useTranslations } from "next-intl";
```
Change the `STEPS` constant to hold only the non-translatable `n` + `img` (keep this exact array):
```tsx
type StepMeta = { n: string; img?: string };

const STEP_META: StepMeta[] = [
  { n: "01", img: "/steps/install-hardware.png" },
  { n: "02", img: "/steps/config.png" },
  { n: "03", img: "/steps/using-minder.jpg" },
];
```
At the top of the `HowItWorks()` function body, add:
```tsx
  const t = useTranslations("HowItWorks");
  const steps = (t.raw("steps") as { title: string; points: string[] }[]).map(
    (s, i) => ({ ...s, n: STEP_META[i].n, img: STEP_META[i].img }),
  );
```
Then, throughout the JSX, replace every use of `STEPS` with `steps`, and update the heading. Specifically:
- Heading block becomes:
```tsx
        <h2 className={styles.heading} data-heading>
          {t("headingLine1")}
          <br />
          {t("headingLine2")}
        </h2>
```
- `STEPS.map((s) => ( ...frame slides... ))` → `steps.map((s) => ( ... ))` (unchanged body; `s.n`, `s.img`, `s.title` all still valid).
- `STEPS.map((s) => ( ...stage articles... ))` → `steps.map((s) => ( ... ))`.
- In the effect, `const seg = (1 - CONTENT) / STEPS.length;` → `const seg = (1 - CONTENT) / STEP_META.length;` (use the stable meta length; the effect must not depend on the render-scoped `steps`).

Leave all animation/effect logic otherwise unchanged.

- [ ] **Step 2: Capabilities — pull section title + item titles from translations**

In `components/capabilities/Capabilities.tsx`:

Add the import:
```tsx
import { useTranslations } from "next-intl";
```
Change the `ITEMS` constant to hold only `n` + `img`:
```tsx
type ItemMeta = { n: string; img?: string };

const ITEM_META: ItemMeta[] = [
  { n: "01", img: "/capabilities/onboard-new-hires.png" },
  { n: "02", img: "/capabilities/catch-errors.png" },
  { n: "03", img: "/capabilities/capture-data.png" },
  { n: "04", img: "/capabilities/reporting.png" },
  { n: "05", img: "/capabilities/scheduling.png" },
  { n: "06", img: "/capabilities/ask-anything.png" },
];
```
At the top of `Capabilities()`:
```tsx
  const t = useTranslations("Capabilities");
  const items = (t.raw("items") as string[]).map((title, i) => ({
    title,
    n: ITEM_META[i].n,
    img: ITEM_META[i].img,
  }));
```
Then:
- Section title: `One Platform for the Entire Operation` → `{t("sectionTitle")}`.
- `ITEMS.map((it) => ...)` (titles list) → `items.map((it) => ...)` (body unchanged; `it.title`, `it.n`, `it.img` valid).
- `ITEMS.map((it) => ...)` (track panels) → `items.map((it) => ...)`.

Leave the effect logic unchanged (it reads DOM nodes, not `ITEMS`).

- [ ] **Step 3: CTA — localize lead, form, thanks, button, email prefix**

In `components/cta/CTA.tsx`:

Add the import:
```tsx
import { useTranslations } from "next-intl";
```
At the top of `CTA()`:
```tsx
  const t = useTranslations("CTA");
```
Replace the JSX strings (keep the Anurati `LET’S TALK` headline hardcoded):
- Lead: `<p className={styles.lead}> ...existing text... </p>` → `<p className={styles.lead}>{t("lead")}</p>`
- Thanks: `Thanks — we&rsquo;ll be in touch shortly.` → `{t("thanks")}`
- srOnly label text `Work email` → `{t("emailLabel")}`
- input `placeholder="your@email.com"` → `placeholder={t("emailPlaceholder")}`
- submit button text `Request a demo` → `{t("button")}`
- The email-us line becomes:
```tsx
              <p className={styles.emailUs}>
                {t("emailUsPrefix")}
                <a href="mailto:start@celesnity.com">start@celesnity.com</a>
              </p>
```

- [ ] **Step 4: ThemeToggle — localize the aria-label**

In `components/layout/ThemeToggle.tsx`:

Add the import:
```tsx
import { useTranslations } from "next-intl";
```
At the top of `ThemeToggle()`:
```tsx
  const t = useTranslations("ThemeToggle");
```
Replace `aria-label="Switch between dark and light theme"` → `aria-label={t("label")}`.

- [ ] **Step 5: Build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 6: Verify all four translate on /vi**

Run:
```bash
npm run dev &
sleep 6
echo "Steps VI:"; curl -s http://localhost:3000/vi | grep -o "Lắp đặt phần cứng" | head -1
echo "Caps VI:"; curl -s http://localhost:3000/vi | grep -o "Một nền tảng cho toàn bộ vận hành" | head -1
echo "CTA VI:"; curl -s http://localhost:3000/vi | grep -o "Yêu cầu demo" | head -1
echo "Steps EN:"; curl -s http://localhost:3000/ | grep -o "Install the Hardware" | head -1
kill %1 2>/dev/null || true
```
Expected: the three VI greps print the Vietnamese strings; Steps EN prints `Install the Hardware`.

- [ ] **Step 7: Commit**

```bash
git add components/steps/HowItWorks.tsx components/capabilities/Capabilities.tsx components/cta/CTA.tsx components/layout/ThemeToggle.tsx
git commit -m "feat(i18n): localize how-it-works, capabilities, cta, theme toggle"
```

---

### Task 9: Full bilingual verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–8.
- Produces: confidence the site is fully bilingual and builds clean.

- [ ] **Step 1: Clean production build**

Run:
```bash
npm run build
```
Expected: succeeds; route list shows the `[locale]` routes.

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: no new errors introduced by the i18n changes.

- [ ] **Step 3: End-to-end route + switch check**

Run:
```bash
npm run dev &
sleep 6
echo "== EN home =="; curl -s http://localhost:3000/ | grep -o "One Platform for the Entire Operation\|Install the Hardware\|About Us" | sort -u
echo "== VI home =="; curl -s http://localhost:3000/vi | grep -o "Một nền tảng cho toàn bộ vận hành\|Lắp đặt phần cứng\|Về chúng tôi" | sort -u
echo "== VI about =="; curl -s http://localhost:3000/vi/about | grep -o "Vươn tới những vì sao"
echo "== html lang vi =="; curl -s http://localhost:3000/vi | grep -o '<html lang="vi"' | head -1
echo "== html lang en =="; curl -s http://localhost:3000/ | grep -o '<html lang="en"' | head -1
kill %1 2>/dev/null || true
```
Expected: EN block prints the three English phrases; VI block prints the three Vietnamese phrases; `/vi/about` prints the VI heading; `<html lang="vi">` and `<html lang="en">` both print.

- [ ] **Step 4: Manual browser check (record result)**

Open `http://localhost:3000/`, use the language switcher to go to Vietnamese, confirm:
- URL becomes `/vi`, all sections render Vietnamese, no flash of wrong theme.
- Switching on `/about` preserves the path (`/vi/about` <-> `/about`).
- No hydration warnings in the browser console.

- [ ] **Step 5: Final commit (if any doc/notes updated)**

```bash
git add -A
git commit -m "chore(i18n): verify bilingual EN/VI build" --allow-empty
```

---

## Self-Review

**Spec coverage:**
- next-intl + config plugin → Task 1. ✓
- routing/navigation/request/middleware (en default, as-needed) → Task 2. ✓
- en/vi messages, namespaced, all sections → Task 3. ✓
- Move landing + about under `[locale]`, new root layout absorbing `app/layout.tsx`, `generateStaticParams`, per-locale `generateMetadata`, delete empty scaffolding → Task 4. ✓
- LanguageSwitcher real switching + nav.config → Task 5. ✓
- Header/NavLinks translations + next-intl `Link` → Task 6. ✓
- All section components translated (Hero, HowItWorks, Capabilities, CTA, Footer, About, ThemeToggle) → Tasks 6–8. ✓
- SEO: `<html lang>`, per-locale metadata → Task 4 (home) + Task 7 (about). ✓
- Anurati headline / Celesnity wordmark / Minder AI / email not translated → honored in Tasks 3 & 8. ✓
- Edge case unknown locale → `notFound()` via `hasLocale` in Task 4. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every verification step shows exact commands + expected output.

**Type consistency:** `NAV_ITEMS` uses `labelKey` in Task 5 and is consumed as `item.labelKey`/`child.labelKey` in Task 6. `LOCALES` gains `route` in Task 5, consumed as `l.route` in Task 5's switcher. `STEP_META`/`ITEM_META` naming consistent within Task 8. `t.raw('steps')`/`t.raw('items')` shapes match the JSON authored in Task 3. `Meta` namespace used by both layout (Task 4) and about (Task 7).

**Note on alternates.languages:** the spec mentioned optional `alternates.languages`. It is omitted to keep metadata simple (not required for function); add later if SEO hreflang is needed. Flagged here rather than silently dropped.
