"use client";

import { Icon } from "./icons";
import styles from "./Header.module.css";

/**
 * Toggles Cosmos (dark) <-> Daybreak (light) by flipping the [data-theme]
 * attribute on <html> and persisting the choice. Both icons render; CSS shows
 * the sun on Cosmos (tap -> Daybreak) and the moon on Daybreak, so the button
 * markup stays theme-independent (no hydration mismatch).
 */
export function ThemeToggle() {
  function toggle() {
    const current =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("celesnity-theme", next);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={toggle}
      aria-label="Switch between dark and light theme"
    >
      <span className={styles.iconSun}>
        <Icon name="sun" size={20} />
      </span>
      <span className={styles.iconMoon}>
        <Icon name="moon" size={20} />
      </span>
    </button>
  );
}
