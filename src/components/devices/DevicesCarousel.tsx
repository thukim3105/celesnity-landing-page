"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import styles from "./DevicesCarousel.module.css";

const media = ["/devices/tablet.png", "/devices/phone.png", "/devices/glasses.png"];
type Device = { eyebrow: string; title: string; description: string };

export function DevicesCarousel() {
  const t = useTranslations("DevicesCarousel");
  const devices = t.raw("devices") as Device[];
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
      setActive(Math.min(devices.length - 1, Math.round(progress * (devices.length - 1))));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [devices.length]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[active] as HTMLElement | undefined;
    if (!track || !card) return;
    const position = () => {
      const x = window.innerWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      track.style.transform = `translate3d(${x}px,0,0)`;
    };
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [active]);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="devices-title">
      <div className={styles.sticky}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id="devices-title">{t("heading")}</h2>
        <p>{t("lead")}</p>
      </header>

      <div ref={trackRef} className={styles.cards}>
        {devices.map((device, index) => (
          <article key={device.title} className={styles.card} data-active={index === active}>
            <div className={styles.copy}>
              <p className={styles.cardEyebrow}>{device.eyebrow}</p>
              <h3>{device.title}</h3>
              <p className={styles.description}>{device.description}</p>
            </div>
            <div className={styles.media}>
              <Image src={media[index]} alt="" fill sizes="(max-width: 900px) 92vw, 30vw" className={styles.image} />
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
