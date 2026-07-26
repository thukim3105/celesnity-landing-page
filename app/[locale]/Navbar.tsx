"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import styles from "./navbar.module.css";

type Theme = "dark" | "light";

const NAV_ITEMS = ["1", "2", "3", "4", "5", "6"];

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = window.localStorage.getItem("celesnity-theme");
    const initialTheme: Theme = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = initialTheme;
    const frame = requestAnimationFrame(() => setTheme(initialTheme));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("celesnity-theme", nextTheme);
    setTheme(nextTheme);
  };

  const toggleLocale = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Primary navigation">
        <a className={styles.brand} href={`/${locale === "en" ? "" : locale}`}>
          <span className={styles.logo}>
            <Image
              className={styles.logoDark}
              src="/brand/logo-mark-white.png"
              alt=""
              width={32}
              height={32}
              priority
            />
            <Image
              className={styles.logoLight}
              src="/brand/logo-mark-ink.png"
              alt=""
              width={32}
              height={32}
              priority
            />
          </span>
          <span className={styles.brandName}>Celesnity</span>
        </a>

        <div className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <a key={item} className={styles.link} href={`#section-${item}`}>
              {item}
            </a>
          ))}
        </div>

        <div className={styles.controls}>
          <button
            className={styles.control}
            type="button"
            onClick={toggleLocale}
            disabled={isPending}
            aria-label={
              locale === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"
            }
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>
          <button
            className={styles.themeControl}
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to Daybreak theme"
                : "Switch to Cosmos theme"
            }
          >
            <span className={styles.themeTrack} aria-hidden="true">
              <i />
            </span>
            <span className={styles.themeLabel}>
              {theme === "dark" ? "Cosmos" : "Daybreak"}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
