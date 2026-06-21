import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1117",
        surface: "#1A1D27",
        border: "#2A2D3E",
        accent: "#6C63FF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: {
          primary: "#E2E8F0",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;