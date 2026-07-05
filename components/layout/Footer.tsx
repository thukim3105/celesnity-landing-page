import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

type Group = { labelKey: string; href?: string; links?: { labelKey: string; href: string }[] };

const GROUPS: Group[] = [
  { labelKey: "minderAI", href: "#" },
  {
    labelKey: "solution",
    links: [
      { labelKey: "manufacturing", href: "#" },
      { labelKey: "logistics", href: "#" },
    ],
  },
  {
    labelKey: "resources",
    links: [
      { labelKey: "blogs", href: "#" },
      { labelKey: "caseStudy", href: "#" },
      { labelKey: "guides", href: "#" },
      { labelKey: "glossary", href: "#" },
    ],
  },
  { labelKey: "about", href: "#" },
];

/** Site footer — brand lockup, nav groups, copyright. DS tokens only. */
export async function Footer() {
  const t = await getTranslations("Footer");
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
          </div>

          {GROUPS.map((g) => (
            <div key={g.labelKey} className={styles.col}>
              {g.links ? (
                <span className={styles.colHead}>{t(g.labelKey)}</span>
              ) : (
                <a className={styles.colHead} href={g.href}>
                  {t(g.labelKey)}
                </a>
              )}
              {g.links && (
                <ul className={styles.colLinks}>
                  {g.links.map((l) => (
                    <li key={l.labelKey}>
                      <a href={l.href}>{t(l.labelKey)}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <p className={styles.copyright}>{t("copyright")}</p>
      </div>
    </footer>
  );
}
