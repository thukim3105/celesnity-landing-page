import { setRequestLocale } from "next-intl/server";
import { HeroFly } from "@/components/hero/HeroFly";

/**
 * Experimental preview route for the fly-around hero. Kept separate from the
 * production hero so we can iterate without touching the live narrative hero.
 * Visit /<locale>/hero-fly (e.g. /en/hero-fly).
 */
export default async function HeroFlyPreview({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ copy?: string }>;
}) {
  const { locale } = await params;
  const { copy } = await searchParams;
  setRequestLocale(locale);
  // Copy is hidden by default while we tune the effect; add ?copy=1 to preview it.
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      {/* Hide the site navbar/footer on this preview route so only the effect shows. */}
      <style>{`header, footer { display: none !important; }`}</style>
      <HeroFly showCopy={copy != null} />
      <section
        style={{
          minHeight: "60svh",
          display: "grid",
          placeItems: "center",
          padding: "10svh 24px",
          textAlign: "center",
          color: "var(--text-secondary, #c9cee8)",
          background: "var(--bg-base, #05060f)",
        }}
      >
        <p style={{ maxWidth: 520, fontSize: 18, lineHeight: 1.7 }}>
          Next section placeholder. The fly-around ends low among the buildings —
          the reserved handoff point for the interior segment (model coming
          later).
        </p>
      </section>
    </main>
  );
}
