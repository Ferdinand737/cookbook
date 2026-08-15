import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        panel: "#161b22",
        panel2: "#010409",
        border: "#30363d",
        text: "#e6edf3",
        muted: "#8b949e",
        accent: "#79c0ff",
        ok: "#3fb950",
        bad: "#f85149",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
