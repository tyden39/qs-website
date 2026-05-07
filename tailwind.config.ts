import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper:   { DEFAULT: "#fafaf7", 2: "#f3efe6" },
        ink:     { DEFAULT: "#0e0e0c", 2: "#1a1815", 3: "#2a2520" },
        muted:   "#8a8680",
        line:    "#dedacc",
        gold:    { 1: "#7a4a1f", 2: "#c9a35a", 3: "#e8c878", DEFAULT: "#c9a35a" },
        rust:    "#c8553d",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter Tight", "sans-serif"],
        sans:    ["var(--font-sans)", "Inter", "sans-serif"],
        mono:    ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      maxWidth: { wrap: "1280px" },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #7a4a1f 0%, #c9a35a 50%, #e8c878 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
