import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F1EA",
        surface: "#FFFDF9",
        "surface-muted": "#F2E8DD",
        "surface-raised": "#E5D7C8",
        text: "#181311",
        "text-secondary": "#62564C",
        stroke: "#D4C4B2",
        "gold-soft": "#C9A27B",
        "gold-deep": "#8A6340",
        "gold-rich": "#3D2B1F",
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
        "button-gradient": "linear-gradient(135deg, #2B1D14 0%, #6B4A32 55%, #B7895F 100%)",
        "editorial-panel":
          "linear-gradient(180deg, rgba(255,253,249,0.98) 0%, rgba(247,241,234,0.98) 100%)",
        "dark-panel":
          "linear-gradient(180deg, rgba(30,22,17,0.98) 0%, rgba(56,38,27,0.96) 100%)",
        "shell-wash":
          "radial-gradient(circle at top left, rgba(201,162,123,0.2), transparent 28%), radial-gradient(circle at top right, rgba(255,255,255,0.88), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.24), transparent 42%)"
      },
    },
  },
  plugins: [],
} satisfies Config;
