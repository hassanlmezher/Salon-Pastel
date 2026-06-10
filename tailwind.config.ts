import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7EFE6",
        surface: "#FFF9F4",
        "surface-muted": "#F3E4D6",
        "surface-raised": "#E6D1BD",
        text: "#221814",
        "text-secondary": "#6E5C4F",
        stroke: "#D7C6B4",
        "gold-soft": "#F2D39A",
        "gold-deep": "#6D3F1F",
        "gold-rich": "#B78643",
        success: "#355B4B",
        error: "#8A4545",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        luxe: "0 28px 80px rgba(48, 30, 19, 0.14)",
        float: "0 18px 36px rgba(48, 30, 19, 0.14)",
        soft: "0 12px 26px rgba(48, 30, 19, 0.07)"
      },
      backgroundImage: {
        "button-gradient": "linear-gradient(135deg, #B78643 0%, #E0B85F 48%, #F7E1A4 100%)",
        "editorial-panel":
          "linear-gradient(180deg, rgba(255,253,249,0.98) 0%, rgba(247,241,234,0.98) 100%)",
        "dark-panel":
          "linear-gradient(180deg, rgba(30,22,17,0.98) 0%, rgba(56,38,27,0.96) 100%)",
        "shell-wash":
          "radial-gradient(circle at top left, rgba(183,134,67,0.14), transparent 28%), radial-gradient(circle at top right, rgba(255,255,255,0.9), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.24), transparent 42%)"
      },
    },
  },
  plugins: [],
} satisfies Config;
