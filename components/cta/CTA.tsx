"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./CTA.module.css";

/**
 * Closing CTA — a lead line, a big Anurati headline ("LET'S TALK"), and an email
 * capture whose submit button is "Request demo". No backend yet: submitting shows
 * a confirmation. Anurati (all-caps display) is used only for the headline.
 */
export function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSent(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.lead}>
            If your workers are juggling between machines and shifts and you&rsquo;re
            curious how to save cost and increase productivity…
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className={styles.headline}>LET&rsquo;S TALK</h2>
        </Reveal>

        <Reveal delay={240}>
          {sent ? (
            <p className={styles.thanks}>
              Thanks — we&rsquo;ll be in touch shortly.
            </p>
          ) : (
            <form className={styles.form} onSubmit={onSubmit}>
              <label className={styles.srOnly} htmlFor="cta-email">
                Work email
              </label>
              <input
                id="cta-email"
                className={styles.input}
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className={styles.button} type="submit">
                Request demo
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
