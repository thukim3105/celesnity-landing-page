/**
 * Navigation data source for the Celesnity header.
 * Content + layout follow the provided navbar reference; brand styling comes
 * entirely from the design system tokens.
 *
 * `Solution` and `Resources` are dropdowns; their `children` are intentionally
 * empty for now and will be filled once the reference for those menus arrives.
 */
export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href?: string; children?: NavChild[] };

export const NAV_ITEMS: NavItem[] = [
  { label: "Minder AI", href: "/" },
  { label: "Solution", children: [] },
  { label: "Resources", children: [] },
  { label: "About Us", href: "/about" },
];

export type LocaleCode = "EN" | "VI";
export const LOCALES: { code: LocaleCode; label: string }[] = [
  { code: "EN", label: "English" },
  { code: "VI", label: "Tiếng Việt" },
];
