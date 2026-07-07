import { getTranslations } from "next-intl/server";
import { HeroReveal } from "./HeroReveal";
import type { LabelBox } from "./heroLabels.types";

/**
 * Server hero: fetches localized copy + demo carton data and hands them to the
 * client <HeroReveal/>, which pins the line-art backdrop, scrolls the content
 * away, and reveals the labels. The backdrop itself (<HeroExperience/>) is
 * rendered inside HeroReveal and remains visually unchanged.
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  const tl = await getTranslations("HeroLabels");
  const tw = await getTranslations("WasteCounter");
  const to = await getTranslations("HeroOutro");
  const ts = await getTranslations("HeroScene2");
  const ts3 = await getTranslations("HeroScene3");
  const tv = await getTranslations("HeroVoice");
  const boxes = tl.raw("boxes") as LabelBox[];

  const first = boxes[0];
  const voiceFields = [
    { label: tv("nameLabel"), value: first.name },
    { label: tv("codeLabel"), value: first.code },
    { label: tv("qtyLabel"), value: first.qty },
  ];

  return (
    <HeroReveal
      heading={t("heading")}
      lead1={t("leadLine1")}
      lead2={t("leadLine2")}
      boxes={boxes}
      codeLabel={tl("codeLabel")}
      qtyLabel={tl("qtyLabel")}
      wasteEyebrow={tw("eyebrow")}
      wasteCaption={tw("caption")}
      outroMessage={to("message")}
      outroCta={to("cta")}
      scene2Line={ts("line")}
      scene3Line={ts3("line")}
      voiceHint={tv("hint")}
      voiceProcessing={tv("processing")}
      voiceFields={voiceFields}
    />
  );
}
