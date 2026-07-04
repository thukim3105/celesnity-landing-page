import { HeroExperience } from "@/components/hero/HeroExperience";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <>
      {/* Pinned image backdrop; scroll pulls the intro scene up into interior. */}
      <HeroExperience />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />

        {/* Transparent journey space — the pull-up plays out here as the
            user scrolls from the intro scene into the factory interior,
            then holds on the interior image at the bottom. */}
        <section style={{ minHeight: "150vh" }} aria-hidden="true" />
      </main>
    </>
  );
}
