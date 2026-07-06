"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import styles from "./PhoneDemo.module.css";

type Step = "setup" | "phone" | "listening" | "transcribing" | "order";

const HOLD_MS = 1000;

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" width="26" height="26">
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="18" height="18" fill="none">
      <path
        d="M5 12.5 10 17.5 19 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneDemo({
  onExplore,
  reduced,
}: {
  onExplore: () => void;
  reduced: boolean;
}) {
  const t = useTranslations("HeroSequence");
  const [step, setStep] = useState<Step>("setup");
  const [holding, setHolding] = useState(false);
  const [typed, setTyped] = useState("");
  const holdTimer = useRef<number | undefined>(undefined);
  const transcript = t("transcript");

  // Act 4: setup confirmations, then reveal the phone.
  useEffect(() => {
    const delay = reduced ? 0 : 1700;
    const id = window.setTimeout(() => setStep("phone"), delay);
    return () => window.clearTimeout(id);
  }, [reduced]);

  // Act 6: type the transcript out, then bloom into the order card.
  useEffect(() => {
    if (step !== "transcribing") return;
    if (reduced) {
      const id = window.setTimeout(() => {
        setTyped(transcript);
        setStep("order");
      }, 250);
      return () => window.clearTimeout(id);
    }
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setTyped(transcript.slice(0, i));
      if (i >= transcript.length) {
        window.clearInterval(tick);
        window.setTimeout(() => setStep("order"), 500);
      }
    }, 26);
    return () => window.clearInterval(tick);
  }, [step, transcript, reduced]);

  const beginCapture = () => {
    setHolding(false);
    setStep("listening");
    window.setTimeout(() => {
      setTyped("");
      setStep("transcribing");
    }, reduced ? 0 : 650);
  };

  const startHold = () => {
    if (step !== "phone") return;
    setHolding(true);
    holdTimer.current = window.setTimeout(beginCapture, reduced ? 0 : HOLD_MS);
  };
  const endHold = () => {
    setHolding(false);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
  };

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const orderFields = [
    { k: t("order.boxNo"), v: t("order.boxNoValue"), cls: styles.fMono },
    { k: t("order.qty"), v: t("order.qtyValue"), cls: styles.fBig },
    { k: t("order.handler"), v: t("order.handlerValue"), cls: styles.fHandler },
    { k: t("order.condition"), v: t("order.conditionValue"), cls: styles.fWarn },
    { k: t("order.location"), v: t("order.locationValue"), cls: styles.fChip },
    { k: t("order.note"), v: t("order.noteValue"), cls: styles.fNote },
  ];

  return (
    <div className={styles.wrap}>
      {/* Act 4 — setup confirmations */}
      <AnimatePresence>
        {step === "setup" && (
          <motion.ul
            className={styles.setup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {[t("setup.hardware"), t("setup.config")].map((line, i) => (
              <motion.li
                key={line}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.25 + i * 0.55 }}
              >
                <span className={styles.setupCheck}>
                  <Check />
                </span>
                {line}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Acts 5–6 — the phone */}
      {step !== "setup" && (
        <motion.div
          className={styles.phone}
          initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.notch} />
          <div className={styles.screen}>
            <div className={styles.appbar}>
              <span className={styles.appdot} />
              {t("phone.app")}
            </div>

            <div className={styles.screenBody}>
              <AnimatePresence mode="wait">
                {(step === "phone" || step === "listening") && (
                  <motion.div
                    key="capture"
                    className={styles.capture}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className={styles.prompt}>
                      {step === "listening"
                        ? t("phone.listening")
                        : t("phone.prompt")}
                    </p>
                    <button
                      type="button"
                      className={`${styles.voice} ${holding ? styles.voiceHold : ""} ${
                        step === "listening" ? styles.voiceLive : ""
                      }`}
                      onPointerDown={startHold}
                      onPointerUp={endHold}
                      onPointerLeave={endHold}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          beginCapture();
                        }
                      }}
                      aria-label={t("phone.prompt")}
                    >
                      <span className={styles.voiceRing} />
                      <MicIcon />
                    </button>
                    <span className={styles.holdHint}>{t("phone.holdHint")}</span>
                  </motion.div>
                )}

                {step === "transcribing" && (
                  <motion.div
                    key="transcribing"
                    className={styles.transcribe}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className={styles.waveform} aria-hidden>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />
                      ))}
                    </span>
                    <p className={styles.transcriptText}>
                      {typed}
                      <span className={styles.caret} />
                    </p>
                  </motion.div>
                )}

                {step === "order" && (
                  <motion.div
                    key="order"
                    className={styles.order}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className={styles.orderHead}>
                      <span className={styles.orderBadge}>{t("order.title")}</span>
                      <p className={styles.orderSub}>{t("order.subtitle")}</p>
                    </div>
                    <div className={styles.fields}>
                      {orderFields.map((f, i) => (
                        <motion.div
                          key={f.k}
                          className={`${styles.field} ${f.cls}`}
                          initial={reduced ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: reduced ? 0 : i * 0.09 }}
                        >
                          <span className={styles.fieldKey}>{f.k}</span>
                          <span className={styles.fieldVal}>{f.v}</span>
                        </motion.div>
                      ))}
                    </div>
                    <p className={styles.orderHint}>{t("order.hint")}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Act 7 — hand-off */}
      <AnimatePresence>
        {step === "order" && (
          <motion.button
            type="button"
            className={styles.explore}
            onClick={onExplore}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.7 }}
          >
            {t("handoff.cta")}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none">
              <path
                d="M12 5v14M6 13l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
