"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./icons";
import styles from "./Header.module.css";

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Frosted-glass navbar: transparent while the hero is in view, blurred once
  // scrolled past it. IntersectionObserver on the hero — no scroll listener.
  // Pages without a hero keep the bar readable (scrolled = true).
  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      setScrolled(true);
      return;
    }
    setScrolled(false);
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  // Close the drawer once the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!drawerOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [drawerOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <a className={styles.brand} href="#" aria-label={t("brandHome")}>
          <Logo />
        </a>

        <nav className={styles.navCluster} aria-label={t("primaryNav")}>
          <NavLinks variant="bar" />
        </nav>

        <div className={styles.controls}>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-label={t("openMenu")}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={t("menu")}>
          <div className={styles.drawerBackdrop} onClick={closeDrawer} />
          <div className={styles.drawerPanel}>
            <div className={styles.drawerHeader}>
              <Logo />
              <button
                type="button"
                className={styles.iconButton}
                aria-label={t("closeMenu")}
                onClick={closeDrawer}
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            <NavLinks variant="drawer" onNavigate={closeDrawer} />
            <div className={styles.drawerFooter}>
              <LanguageSwitcher variant="drawer" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
