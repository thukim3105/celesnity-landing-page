import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import styles from "./about.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  return (
    <main className={styles.main}>
      <section className={styles.section}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.heading}>{t("heading")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
      </section>
    </main>
  );
}
