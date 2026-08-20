import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dnk-maroon": "#801C1C",
        "dnk-yellow": "#FFC72C",
        "usps-navy": "#003366",
        "usps-slate": "#336699",
        "postal-bg": "#F4F6F8",
        "postal-border": "#E2E8F0",
        "escrow-green": "#059669",
        "ink-dark": "#0F172A",
        "ink-muted": "#64748B",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
