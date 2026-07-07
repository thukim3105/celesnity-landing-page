import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { CTA } from "@/components/cta/CTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <Hero />
      <Capabilities />
      <CTA />
    </main>
  );
}
