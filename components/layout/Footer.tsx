import { Logo } from "./Logo";
import styles from "./Footer.module.css";

type Group = { label: string; href?: string; links?: { label: string; href: string }[] };

const GROUPS: Group[] = [
  { label: "Minder AI", href: "#" },
  {
    label: "Solution",
    links: [
      { label: "Manufacturing", href: "#" },
      { label: "Logistics", href: "#" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Blogs", href: "#" },
      { label: "Case Study", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Glossary", href: "#" },
    ],
  },
  { label: "About Us", href: "#" },
];

/**
 * Site footer — brand lockup, the nav groups (with their sub-links), and a
 * copyright line. Content mirrors the header; styling is DS tokens only.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
          </div>

          {GROUPS.map((g) => (
            <div key={g.label} className={styles.col}>
              {g.links ? (
                <span className={styles.colHead}>{g.label}</span>
              ) : (
                <a className={styles.colHead} href={g.href}>
                  {g.label}
                </a>
              )}
              {g.links && (
                <ul className={styles.colLinks}>
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className={styles.copyright}>
        © 2026 Celesnity Ltd · Minder AI · All rights reserved.
      </p>
    </footer>
  );
}
