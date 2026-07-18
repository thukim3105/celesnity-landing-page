import { setRequestLocale } from "next-intl/server";
import { FacadeFly } from "@/components/hero/FacadeFly";

/**
 * Experimental scroll fly-in built from the drone clip: aerial industrial park →
 * front door → push into the dark doorway. Visit /<locale>/fac-fly.
 */
export default async function FacFlyPreview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <style>{`header, footer { display: none !important; }`}</style>
      <FacadeFly />
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
          To be continued…
        </p>
      </section>
    </main>
  );
}
