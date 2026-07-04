"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { NAV_ITEMS, type NavItem } from "./nav.config";
import { useDismiss } from "./useDismiss";
import styles from "./Header.module.css";

/** Whether a nav href is the current route. */
function useIsActive() {
  const pathname = usePathname();
  return (href?: string) => !!href && href !== "#" && href === pathname;
}

function DropdownPanel({ item }: { item: NavItem }) {
  const children = item.children ?? [];
  return (
    <ul className={styles.menu} role="menu" aria-label={item.label}>
      {children.length === 0 ? (
        <li role="none" className={styles.menuEmpty}>
          Coming soon
        </li>
      ) : (
        children.map((child) => (
          <li key={child.label} role="none">
            <a role="menuitem" className={styles.menuItem} href={child.href}>
              {child.label}
            </a>
          </li>
        ))
      )}
    </ul>
  );
}

/** Horizontal nav links for the bar (>=768px). */
function BarNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLUListElement>(null);
  const close = useCallback(() => setOpenIndex(null), []);
  useDismiss(ref, openIndex !== null, close);
  const isActive = useIsActive();

  return (
    <ul ref={ref} className={styles.navList}>
      {NAV_ITEMS.map((item, index) =>
        item.children ? (
          <li key={item.label} className={styles.navItem}>
            <button
              type="button"
              className={styles.navTrigger}
              aria-haspopup="menu"
              aria-expanded={openIndex === index}
              onClick={() => setOpenIndex((v) => (v === index ? null : index))}
            >
              {item.label}
              <span className={openIndex === index ? styles.chevronOpen : styles.chevron}>
                <Icon name="chevronDown" size={16} />
              </span>
            </button>
            {openIndex === index && <DropdownPanel item={item} />}
          </li>
        ) : (
          <li key={item.label} className={styles.navItem}>
            <a
              className={
                isActive(item.href)
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          </li>
        ),
      )}
    </ul>
  );
}

/** Vertical nav for the mobile drawer (<768px). */
function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const isActive = useIsActive();
  return (
    <ul className={styles.drawerNavList}>
      {NAV_ITEMS.map((item) => (
        <li key={item.label} className={styles.drawerNavItem}>
          {item.children ? (
            <>
              <span className={styles.drawerGroupLabel}>{item.label}</span>
              {item.children.length === 0 ? (
                <span className={styles.drawerEmpty}>Coming soon</span>
              ) : (
                <ul className={styles.drawerSubList}>
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <a className={styles.drawerSubLink} href={child.href} onClick={onNavigate}>
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <a
              className={
                isActive(item.href)
                  ? `${styles.drawerNavLink} ${styles.drawerNavLinkActive}`
                  : styles.drawerNavLink
              }
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </a>
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
