import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".next/**",
      ".output/**",
      ".turbo/**",
      "dist/**",
      "node_modules/**",
      "apps/**",
      "public/**",
      "app/routeTree.gen.ts",
    ],
  },
  js.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {},
  },
];
