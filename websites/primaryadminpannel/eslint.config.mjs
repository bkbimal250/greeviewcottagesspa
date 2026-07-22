import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/availability/**",
    "components/bookings/**",
    "components/cottages/**",
    "components/dashboard/**",
    "components/enquiries/**",
    "components/guests/**",
    "components/notifications/**",
    "components/payments/**",
    "components/property/**",
    "components/reports/**",
    "components/settings/**",
    "components/users/**",
    "components/common/ImageUpload.tsx",
  ]),
]);

export default eslintConfig;
