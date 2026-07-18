import { setRequestLocale } from "next-intl/server";
import { WashingFly } from "@/components/hero/WashingFly";

/**
 * Preview route for the washing-machine lateral dolly. Scroll to fly the camera
 * left→right along the row, lens facing each machine. Visit /<locale>/wm-fly.
 */
export default async function WmFlyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <style>{`header, footer { display: none !important; }`}</style>
      <WashingFly />
    </main>
  );
}
