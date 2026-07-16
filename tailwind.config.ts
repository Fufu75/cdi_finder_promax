import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Émeraude : accent de l'interface (boutons, liens, états actifs).
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(28 25 23 / 0.04), 0 1px 3px 0 rgb(28 25 23 / 0.06)",
        lift: "0 4px 12px -2px rgb(28 25 23 / 0.08), 0 2px 6px -2px rgb(28 25 23 / 0.05)",
        // Ombre teintée : donne du relief aux surfaces émeraude.
        brand: "0 1px 2px 0 rgb(5 150 105 / 0.2), 0 4px 10px -2px rgb(5 150 105 / 0.25)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.25s ease-out both",
        "slide-in": "slide-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
