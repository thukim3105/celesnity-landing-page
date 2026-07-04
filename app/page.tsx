import { HeroExperience } from "@/components/hero/HeroExperience";
import { Hero } from "@/components/hero/Hero";
import { HowItWorks } from "@/components/steps/HowItWorks";

export default function Home() {
  return (
    <>
      {/* Pinned static inside-factory backdrop behind the hero content. */}
      <HeroExperience />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <HowItWorks />
      </main>
    </>
  );
}
