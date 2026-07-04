import { Hero } from "@/components/hero/Hero";
import { HowItWorks } from "@/components/steps/HowItWorks";
import { Capabilities } from "@/components/capabilities/Capabilities";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <Hero />
      <HowItWorks />
      <Capabilities />
    </main>
  );
}
