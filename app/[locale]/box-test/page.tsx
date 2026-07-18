import { setRequestLocale } from "next-intl/server";
import { BoxFlyTest } from "@/components/test/BoxFlyTest";

/**
 * Throwaway real-time weight test. Loads test.glb into a live Three.js scene and
 * flies the camera around it, with an on-screen HUD (FPS / draw calls / bytes) so
 * we can judge whether a real-time 3D page would be too heavy. Visit /<locale>/box-test.
 */
export default async function BoxTestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <style>{`header, footer { display: none !important; }`}</style>
      <BoxFlyTest />
    </main>
  );
}
