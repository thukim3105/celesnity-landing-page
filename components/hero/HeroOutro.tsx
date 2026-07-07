"use client";

import styles from "./HeroOutro.module.css";

type HeroOutroProps = {
  /** Timeline step from outroStep(): 0 labels, 1 message, 2 cta, 3 click, 4 scene2. */
  step: number;
  message: string;
  ctaLabel: string;
  onCtaClick: () => void;
};

/**
 * Scene-1 ending: the "manual entry wastes time" message and the "Try Minder AI"
 * CTA, plus a purely-visual auto-click effect (fake cursor + ripple + press)
 * that plays at step 3. Presentational — driven entirely by `step`.
 */
export function HeroOutro({ step, message, ctaLabel, onCtaClick }: HeroOutroProps) {
  const messageShown = step >= 1;
  const ctaShown = step >= 2;
  const clicking = step === 3;

  return (
    <div className={styles.outro}>
      <p className={`${styles.message} ${messageShown ? styles.messageShown : ""}`}>
        {message}
      </p>
      <div
        className={`${styles.ctaWrap} ${ctaShown ? styles.ctaShown : ""} ${
          clicking ? styles.clicking : ""
        }`}
      >
        <button type="button" className={styles.cta} onClick={onCtaClick}>
          {ctaLabel}
        </button>
        <span className={styles.ripple} aria-hidden="true" />
        <svg
          className={styles.cursor}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 3l14 7-6 2-2 6-6-15z" />
        </svg>
      </div>
    </div>
  );
}
