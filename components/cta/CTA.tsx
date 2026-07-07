"use client";

import { useState } from "react";
import localFont from "next/font/local";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { AuroraBackground } from "@/components/background/AuroraBackground";
import styles from "./CTA.module.css";

/* Anurati — futuristic all-caps display face. DS-approved exception (Inter only,
   otherwise), used solely for the CTA headline. Loaded via next/font/local. */
const anurati = localFont({
  src: "../../public/fonts/Anurati-Regular.otf",
  display: "swap",
});

/**
 * Closing CTA — a lead line, a big Anurati headline ("LET'S TALK"), and an email
 * capture whose submit button is "Request demo". No backend yet: submitting shows
 * a confirmation. Anurati (all-caps display) is used only for the headline.
 */
export function CTA() {
  const t = useTranslations("CTA");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSent(true);
  };

  return (
    <section id="cta" className={styles.section}>
      <AuroraBackground opacity={1} />
      <div className={styles.inner}>
        <Reveal>
          <h2 className={`${styles.headline} ${anurati.className}`}>
            LET&rsquo;S TALK
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p className={styles.lead}>{t.rich("lead", { br: () => <br /> })}</p>
        </Reveal>

        <Reveal delay={240}>
          {sent ? (
            <p className={styles.thanks}>
              {t("thanks")}
            </p>
          ) : (
            <div className={styles.formWrap}>
              <form className={styles.form} onSubmit={onSubmit}>
                <label className={styles.srOnly} htmlFor="cta-email">
                  {t("emailLabel")}
                </label>
                <input
                  id="cta-email"
                  className={styles.input}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className={styles.button} type="submit">
                  {t("button")}
                </button>
              </form>
              <p className={styles.emailUs}>
                {t("emailUsPrefix")}
                <a href="mailto:start@celesnity.com">start@celesnity.com</a>
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
