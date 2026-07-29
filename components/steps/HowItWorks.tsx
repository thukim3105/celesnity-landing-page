"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "./HowItWorks.module.css";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// easeOutQuad — decelerating arrival, matching the reveal feel.
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

type StepMeta = { n: string; img?: string };

const STEP_META: StepMeta[] = [
  { n: "01", img: "/steps/install-hardware.png" },
  { n: "02", img: "/steps/config.png" },
  { n: "03", img: "/steps/using-minder.jpg" },
];

const LEAD = 0.16; // scroll fraction over which the heading climbs into place
const CONTENT = 0.2; // frame + steps begin here — a short beat after the heading settles

/**
 * "How it works" — a pinned section. Left column: the heading shows first, then
 * slides up and fades out as you scroll in, replaced (in place) by a fixed image
 * frame whose picture cross-fades 01 -> 02 -> 03 to match the step on the right.
 * Right column: each step's lines cascade in (fade + slide + blur) and are pulled
 * up line by line to hand off to the next; the last step stays. Scroll drives it
 * all via rAF. Reduced motion unpins and shows everything.
 */
export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = (t.raw("steps") as { title: string; points: string[] }[]).map(
    (s, i) => ({ ...s, n: STEP_META[i].n, img: STEP_META[i].img }),
  );

  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Small screens and reduced motion use the static stacked layout (no pin).
    if (
      window.matchMedia("(max-width: 860px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.dataset.reduced = "true";
      return;
    }

    const heading = el.querySelector<HTMLElement>("[data-heading]");
    const frame = el.querySelector<HTMLElement>("[data-frame]");
    const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-slide]"));
    const stepLines = Array.from(
      el.querySelectorAll<HTMLElement>("[data-step]"),
    ).map((step) => Array.from(step.querySelectorAll<HTMLElement>("[data-line]")));

    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, travel));

      // Left: the heading appears from the middle (fade + blur), climbs up to its
      // pinned top-left spot over the lead-in, then STAYS there (no fade-out).
      const travelProg = clamp01(p / LEAD);
      if (heading) {
        const appear = easeOut(clamp01(travelProg / 0.3));
        heading.style.opacity = String(appear);
        heading.style.transform = `translateY(${(1 - travelProg) * 34}vh)`;
        heading.style.filter = `blur(${(1 - appear) * 8}px)`;
      }
      // Frame reveals with the same feel as the heading (fade + slide-up + blur)
      // once the content phase begins, then holds.
      if (frame) {
        const fEnter = easeOut(clamp01((p - CONTENT) / 0.06));
        frame.style.opacity = String(fEnter);
        frame.style.transform = `translateY(${(1 - fEnter) * 28}px)`;
        frame.style.filter = `blur(${(1 - fEnter) * 10}px)`;
      }

      // Left: cross-fade the image to the active step. Each image is centred on
      // its step's segment (so it holds while that step's text is fully shown),
      // and the first/last images hold at the ends so the frame is never blank.
      const seg = (1 - CONTENT) / STEP_META.length;
      const activeF = (p - CONTENT) / seg; // fractional step index
      slides.forEach((slide, i) => {
        const center = i + 0.5;
        let dist = Math.abs(activeF - center);
        if (i === 0 && activeF < center) dist = 0;
        if (i === slides.length - 1 && activeF > center) dist = 0;
        const op = easeOut(clamp01((0.65 - dist) / 0.3));
        slide.style.opacity = String(op);
      });

      // Right: each step's lines cascade in, then get pulled up to hand off.
      const stagger = 0.05;
      const width = 0.2;
      stepLines.forEach((lines, i) => {
        const isLast = i === stepLines.length - 1;
        const local = (p - CONTENT - i * seg) / seg;
        lines.forEach((line, j) => {
          let op = 0;
          let ty = 24;
          if (local >= 0 && (isLast || local <= 1)) {
            const fadeIn = clamp01((local - j * stagger) / width);
            const fadeOut = isLast
              ? 1
              : clamp01((1 - local - j * stagger) / width);
            const entering = fadeIn <= fadeOut;
            op = easeOut(Math.min(fadeIn, fadeOut));
            ty = entering ? (1 - op) * 24 : -(1 - op) * 24;
          }
          line.style.opacity = String(op);
          line.style.transform = `translateY(${ty}px)`;
          line.style.filter = `blur(${(1 - op) * 10}px)`;
        });
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.section}>
      <div className={styles.sticky}>
        {/* Title appears from the middle, climbs to the top-left, then stays. */}
        <h2 className={styles.heading} data-heading>
          {t("headingLine1")}
          <br />
          {t("headingLine2")}
        </h2>

        <div className={styles.grid}>
          <div className={styles.mediaCol}>
            {/* Image frame stays fixed; the picture inside cross-fades per step. */}
            <div className={styles.frame} data-frame aria-hidden="true">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className={styles.slide}
                  data-slide
                  style={
                    s.img
                      ? { backgroundImage: `url("${s.img}")` }
                      : undefined
                  }
                >
                  {!s.img && (
                    <>
                      <span className={styles.slideNum}>{s.n}</span>
                      <span className={styles.slideLabel}>{s.title}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.stage}>
            {steps.map((s) => (
              <article key={s.n} className={styles.step} data-step>
                {s.img && (
                  <div
                    className={styles.stepMedia}
                    style={{ backgroundImage: `url("${s.img}")` }}
                    aria-hidden="true"
                  />
                )}
                <div className={styles.stepHead}>
                  <span className={`${styles.badge} ${styles.line}`} data-line>
                    {s.n}
                  </span>
                  <h3 className={`${styles.stepTitle} ${styles.line}`} data-line>
                    {s.title}
                  </h3>
                </div>
                <ul className={styles.points}>
                  {s.points.map((pt) => (
                    <li key={pt} className={styles.line} data-line>
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
