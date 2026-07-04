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
