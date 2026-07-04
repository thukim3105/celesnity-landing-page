import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us — Celesnity",
  description: "Celesnity — an AI company building Minder AI.",
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <section className={styles.section}>
        <p className={styles.eyebrow}>About Us</p>
        <h1 className={styles.heading}>Reach the stars.</h1>
        <p className={styles.lead}>
          Celesnity is an AI company building Minder AI — turning the factory
          floor into searchable, actionable data so teams work smarter, catch
          errors sooner, and scale without the chaos.
        </p>
      </section>
    </main>
  );
}
