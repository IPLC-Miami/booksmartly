/* eslint-disable import/no-anonymous-default-export */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["ui-sans-serif", "system-ui"],
      noto: ["Noto Sans Mono Variable", "ui-sans-serif", "system-ui"],
      inter: ["inter", "ui-sans-serif", "system-ui"],
    },
    extend: {},
  },
  plugins: [
    require("tailwindcss-animated"),
    require("@tailwindcss/typography"),
  ],
};
