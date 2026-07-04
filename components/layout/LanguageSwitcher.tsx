"use client";

import { useCallback, useRef, useState } from "react";
import { Icon } from "./icons";
import { LOCALES, type LocaleCode } from "./nav.config";
import { useDismiss } from "./useDismiss";
import styles from "./Header.module.css";

/**
 * Language switcher (globe + current locale + chevron).
 * NOTE: stub — it only changes the displayed locale and opens/closes. Real i18n
 * routing is deferred to a later section.
 */
export function LanguageSwitcher({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("EN");
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

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
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="globe" size={18} />
        <span className={styles.langCode}>{locale}</span>
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
                aria-checked={l.code === locale}
                className={l.code === locale ? styles.menuItemActive : styles.menuItem}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
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
