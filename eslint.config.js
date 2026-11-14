import js from "@eslint/js";
import globals from "globals";
export default [
  {
    ignores: [
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "dist/fonts/**",
    ],
  },
  js.configs.recommended,
  { files: ["dist/**/*.js"], languageOptions: { globals: globals.browser } },
  {
    files: ["scripts/**/*.mjs", "tests/**/*.js", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["tests/e2e/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
