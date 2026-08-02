import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Always serve English at "/" — do not auto-switch to Vietnamese based on the
  // browser's Accept-Language. Users opt into Vietnamese via the switcher (/vi).
  localeDetection: false,
});
