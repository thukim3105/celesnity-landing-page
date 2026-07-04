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
