import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
  {
    files: ["src/components/admin/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}", "src/app/(panel)/**/*.{ts,tsx}", "src/app/(dealer-portal)/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#(4f6bed|eef1fd|d97706|008a43)/i]",
          message: "Use semantic design tokens from tokens.css instead of hard-coded hex.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(amber|red|blue|indigo|purple|rose|emerald)-\\d{2,3}\\b/]",
          message: "Use semantic tokens (success/warning/danger/info) instead of raw Tailwind palette colors in panel UI.",
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXText[value=/—/]",
          message: "Em dash is banned in site/panel copy. Use a period, comma, colon, or restructure the sentence.",
        },
        {
          selector: "Literal[value=/—/]",
          message: "Em dash is banned in site/panel copy. Use a period, comma, colon, or restructure the sentence.",
        },
        {
          selector: "TemplateElement[value.raw=/—/]",
          message: "Em dash is banned in site/panel copy. Use a period, comma, colon, or restructure the sentence.",
        },
      ],
    },
  },
]);

export default eslintConfig;
