import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7f0e9",
        blush: "#f2e6dc",
        gold: {
          50: "#fdf7e7",
          100: "#f8ebc8",
          200: "#efd48d",
          300: "#e5bf62",
          400: "#d5a844",
          500: "#b8861f",
          600: "#94660f",
          700: "#714c0a"
        },
        ink: "#241b17",
        taupe: "#6e625a"
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        luxe: "0 24px 60px rgba(85, 56, 18, 0.12)",
        float: "0 16px 32px rgba(65, 46, 22, 0.12)",
        soft: "0 10px 24px rgba(101, 78, 57, 0.08)"
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, rgba(170,126,39,1) 0%, rgba(239,212,141,1) 55%, rgba(249,237,199,1) 100%)",
        "panel-glow":
          "radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(255,255,255,0.25) 55%, rgba(255,255,255,0.1) 100%)"
      }
    },
  },
  plugins: [],
} satisfies Config;
