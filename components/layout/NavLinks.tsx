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
