import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // This React Compiler rule dominates lint time in this project. Keep the
    // regular edit loop responsive; `npm run lint:strict` enables it on demand.
    rules: {
      "react-hooks/static-components": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Locked, vendored design system — read-only reference, not our source.
    "Celesnity Design System Gradient/**",
    // Archived assets that are intentionally outside the application.
    "unuse/**",
  ]),
]);

export default eslintConfig;
