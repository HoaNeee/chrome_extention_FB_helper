import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**/content.js"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: "readonly",
        Swal: "readonly",
        tippy: "readonly",
        Toastify: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-useless-catch": "off",
    },
  },
]);
