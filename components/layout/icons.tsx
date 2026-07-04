import type { ReactNode, SVGProps } from "react";

/**
 * Celesnity icon set — a thin 2px line set (Lucide-style geometry) matching the
 * design system's iconography rule. `sun` and `moon` reuse the exact DS
 * geometry (ui_kits/celesnity-app/icons.jsx); the rest are DS-consistent 2px
 * substitutions (the brand kit ships no icon system — flagged in the DS README).
 */
export type IconName = "sun" | "moon" | "globe" | "chevronDown" | "menu" | "close";

const PATHS: Record<IconName, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
} & Omit<SVGProps<SVGSVGElement>, "name" | "stroke">;

export function Icon({ name, size = 20, stroke = 2, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "none" }}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
