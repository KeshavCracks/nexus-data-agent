import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0F1A24",
        primary: "#FFAB00",
        "primary-dark": "#E65100",
        accent: "#FF6D00",
      },
      fontFamily: {
        rajdhani: ["var(--font-rajdhani)"],
        geist: ["var(--font-geist)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
