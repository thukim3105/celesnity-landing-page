import { HeroSequence } from "./HeroSequence";

/**
 * Minder AI hero — an interactive scrollytelling sequence. Scroll drives the
 * mouse-look factory scene, the carton data-reveal, and the "manual data entry
 * eats the day" problem; the Try button opens a voice-capture demo that ends by
 * handing off to the rest of the page. All choreography lives in <HeroSequence/>
 * (client); copy comes from the HeroSequence i18n namespace.
 */
export function Hero() {
  return <HeroSequence />;
}
