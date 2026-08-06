"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import styles from "./PlanningSection.module.css";

type Capability = { title: string; description: string };

export function PlanningSection() {
  const t = useTranslations("PlanningSection");
  const items = t.raw("items") as Capability[];
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      setActive(Math.min(items.length - 1, Math.round(progress * (items.length - 1))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  const item = items[active];
  const progress = items.length > 1 ? (active / (items.length - 1)) * 100 : 0;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="capabilities-title">
      <div className={styles.sticky}>
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>{t("sectionLabel")}</p>
          <h2 id="capabilities-title" className={styles.sectionHeading}>{t("sectionHeading")}</h2>
          <p className={styles.sectionDescription}>{t("sectionDescription")}</p>
        </div>
        <div className={styles.layout} style={{ "--progress": `${progress}%` } as React.CSSProperties}>
          <div className={styles.stage}>
            <span className={styles.rail} aria-hidden="true"><i /></span>
            <div key={`stage-${active}`} className={styles.reveal}>
              <h3 className={styles.title}>{item.title}</h3>
            </div>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.mascotGlow} />
            <Image src="/minder.png" alt="" width={1024} height={1024} className={styles.mascot} />
          </div>

          <div className={styles.copy}>
            <p key={`copy-${active}`} className={styles.reveal} aria-live="polite">{item.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
