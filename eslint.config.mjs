import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React's useActionState/useFormState calls action(prevState, formData)
      // positionally, so server actions that don't need one or both
      // arguments (e.g. removeAppIcon in lib/actions/assets.ts) must still
      // declare them to match the expected signature. The rule stays on
      // for every other unused variable/argument; this only recognizes
      // the leading-underscore convention already used for that case.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
