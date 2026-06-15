import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Disable react-hooks/set-state-in-effect — legitimate patterns like
    // closing a menu on route change and loading state from localStorage on mount
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sanity schema .js files use CommonJS require()
    "sanity/schemas/**",
    "sanity/schemaTypes/**",
    // Standalone Node.js scripts use CommonJS require()
    "scripts/**",
    // ML recommender API is Python
    "recommender-api/**",
    // Deprecated eslintignore
    ".eslintignore",
  ]),
]);

export default eslintConfig;
