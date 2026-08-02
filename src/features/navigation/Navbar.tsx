"use client";

import { useLocale } from "next-intl";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "@/i18n/navigation";
import styles from "./navbar.module.css";

type Theme = "dark" | "light";

const NAV_ITEMS = [
  "Minder AI",
  "Conviction",
  "Model",
  "Results",
  "Insights",
  "Contact",
];
const LANGUAGE_OPTIONS = [
  { code: "vi", label: "Tiếng Việt", enabled: true },
  { code: "en", label: "English", enabled: true },
  { code: "fr", label: "Français", enabled: false },
  { code: "de", label: "Deutsch", enabled: false },
  { code: "es", label: "Español", enabled: false },
  { code: "ja", label: "日本語", enabled: false },
  { code: "ko", label: "한국어", enabled: false },
  { code: "zh", label: "简体中文", enabled: false },
];

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(false);
  const [pageRoot, setPageRoot] = useState<HTMLElement | null>(null);
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const [leavingNavs, setLeavingNavs] = useState<Set<number>>(() => new Set());
  const [isPending, startTransition] = useTransition();
  const navbarRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const navLeaveTimers = useRef(
    new Map<number, ReturnType<typeof setTimeout>>(),
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("celesnity-theme");
    const initialTheme: Theme = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = initialTheme;
    const frame = requestAnimationFrame(() => setTheme(initialTheme));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPageRoot(document.body);
      setIsOverHero(document.documentElement.dataset.heroTone === "video");
    });
    const handleHeroTone = (event: Event) => {
      setIsOverHero((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener("celesnity:hero-tone", handleHeroTone);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("celesnity:hero-tone", handleHeroTone);
    };
  }, []);

  useLayoutEffect(() => {
    const navbar = navbarRef.current;
    const links = linksRef.current;
    if (!navbar || !links) return;

    const updateLogoOffset = () => {
      navbar.style.setProperty(
        "--menu-half-width",
        `${links.getBoundingClientRect().width / 2}px`,
      );
    };
    const observer = new ResizeObserver(updateLogoOffset);
    observer.observe(links);
    updateLogoOffset();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const closeSettings = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
        setIsLanguageOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSettings);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeSettings);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSettingsOpen]);

  useLayoutEffect(() => {
    if (!isSettingsOpen) return;
    const panel = settingsPanelRef.current;
    if (!panel) return;

    const keepPanelInViewport = () => {
      panel.style.setProperty("--settings-shift-x", "0px");
      const styles = getComputedStyle(document.documentElement);
      const viewportPadding =
        Number.parseFloat(styles.getPropertyValue("--space-4")) || 16;
      const bounds = panel.getBoundingClientRect();
      const rightOverflow = bounds.right - (window.innerWidth - viewportPadding);
      const leftOverflow = viewportPadding - bounds.left;
      const shift =
        rightOverflow > 0
          ? -rightOverflow
          : leftOverflow > 0
            ? leftOverflow
            : 0;
      panel.style.setProperty("--settings-shift-x", `${shift}px`);
    };

    keepPanelInViewport();
    window.addEventListener("resize", keepPanelInViewport);
    return () => window.removeEventListener("resize", keepPanelInViewport);
  }, [isSettingsOpen]);

  useEffect(() => {
    const leaveTimers = navLeaveTimers.current;
    return () => {
      for (const timer of leaveTimers.values()) {
        clearTimeout(timer);
      }
      leaveTimers.clear();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("celesnity-theme", nextTheme);
    setTheme(nextTheme);
  };

  const changeLocale = (nextLocale: "vi" | "en") => {
    if (nextLocale === locale) {
      setIsLanguageOpen(false);
      return;
    }
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
    setIsSettingsOpen(false);
    setIsLanguageOpen(false);
  };

  const mascotHost = pageRoot;

  return (
    <>
      <header className={styles.header} data-over-hero={isOverHero}>
        <nav
        ref={navbarRef}
        className={styles.navbar}
        aria-label="Primary navigation"
      >
        <a className={styles.brand} href={`/${locale === "en" ? "" : locale}`}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Celesnity</span>
        </a>

        <div ref={linksRef} className={styles.links}>
          <div className={styles.settingsAnchor}>
            <a
              className={styles.link}
              href="#section-1"
              aria-current="page"
              data-label={NAV_ITEMS[0]}
            >
              <span className={styles.linkBase}>{NAV_ITEMS[0]}</span>
              <span className={styles.linkGradient} aria-hidden="true">
                {NAV_ITEMS[0]}
              </span>
            </a>

          </div>

          {NAV_ITEMS.slice(1).map((item, itemIndex) => {
            const index = itemIndex + 1;
            return (
              <a
                key={item}
                className={styles.link}
                href={`#section-${index + 1}`}
                data-label={item}
                data-reveal={
                  hoveredNav === index
                    ? "enter"
                    : leavingNavs.has(index)
                      ? "leave"
                      : undefined
                }
                onMouseEnter={() => {
                  const leaveTimer = navLeaveTimers.current.get(index);
                  if (leaveTimer) clearTimeout(leaveTimer);
                  navLeaveTimers.current.delete(index);
                  setLeavingNavs((items) => {
                    const next = new Set(items);
                    next.delete(index);
                    return next;
                  });
                  setHoveredNav(index);
                }}
                onMouseLeave={() => {
                  setHoveredNav(null);
                  setLeavingNavs((items) => new Set(items).add(index));
                  const timer = setTimeout(() => {
                    setLeavingNavs((items) => {
                      const next = new Set(items);
                      next.delete(index);
                      return next;
                    });
                    navLeaveTimers.current.delete(index);
                  }, 220);
                  navLeaveTimers.current.set(index, timer);
                }}
              >
                <span className={styles.linkBase}>{item}</span>
                <span className={styles.linkGradient} aria-hidden="true">
                  {item}
                </span>
              </a>
            );
          })}
        </div>

        </nav>
      </header>

      {mascotHost &&
        createPortal(
          <div
            className={styles.mascotSettings}
            data-docked="true"
            ref={settingsRef}
          >
        <button
          className={styles.mascotTrigger}
          type="button"
          onClick={() => {
            if (isSettingsOpen) setIsLanguageOpen(false);
            setIsSettingsOpen((open) => !open);
          }}
          aria-label={locale === "vi" ? "Mở cài đặt" : "Open settings"}
          aria-expanded={isSettingsOpen}
          aria-controls="display-settings"
        />

        {isSettingsOpen && (
          <div
            ref={settingsPanelRef}
            className={styles.settingsPanel}
            id="display-settings"
          >
            <div className={styles.languageField}>
              <button
                className={styles.languageSelect}
                type="button"
                onClick={() => setIsLanguageOpen((open) => !open)}
                aria-label={locale === "vi" ? "Ngôn ngữ" : "Language"}
                aria-expanded={isLanguageOpen}
                aria-controls="language-list"
                disabled={isPending}
              >
                <span>{locale === "vi" ? "Tiếng Việt" : "English"}</span>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m6 8 4 4 4-4" />
                </svg>
              </button>

              {isLanguageOpen && (
                <div className={styles.languageList} id="language-list">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => {
                        if (language.enabled) {
                          changeLocale(language.code as "vi" | "en");
                        }
                      }}
                      aria-current={
                        locale === language.code ? "true" : undefined
                      }
                      aria-disabled={!language.enabled}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className={styles.themeRow}
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to Daybreak theme"
                  : "Switch to Cosmos theme"
              }
            >
              <span>{theme === "dark" ? "Cosmos" : "Daybreak"}</span>
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
              )}
            </button>
          </div>
        )}
          </div>,
          mascotHost,
        )}
    </>
  );
}
