/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // L'Imprévu — a call-sheet pinned to a gaffer-taped flight case.
        // Charcoal / ink base, caution amber + safety orange accents.
        ink: {
          DEFAULT: "#16151a", // deep charcoal
          900: "#0f0e12",
          800: "#1c1b21",
          700: "#26242c",
          600: "#322f39",
          500: "#46424f",
        },
        paper: {
          DEFAULT: "#ece6da", // call-sheet stock
          dim: "#d8d0c0",
          line: "#bdb4a0",
        },
        amber: {
          DEFAULT: "#f5a01f", // caution amber
          soft: "#ffc14d",
          deep: "#c97c0a",
        },
        safety: {
          DEFAULT: "#ff5a1f", // safety orange
          deep: "#d83e0c",
        },
        // severity ladder (1→5), low to critical
        sev: {
          1: "#5fb06a",
          2: "#a9c23a",
          3: "#f5a01f",
          4: "#ff7a1f",
          5: "#ff3b30",
        },
        // category accents (muted, on charcoal)
        cat: {
          lumiere: "#ffce4d",
          son: "#7ad0e0",
          meteo: "#76b8ff",
          logistique: "#c9a6ff",
          technique: "#ff9d6e",
          humain: "#ff8aa8",
          legal: "#9fe0a8",
          securite: "#ff5a5a",
        },
      },
      fontFamily: {
        display: ['"Oswald"', '"Arial Narrow"', "sans-serif"],
        body: ['"Archivo Narrow"', '"Arial Narrow"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        tape: "0 2px 0 0 rgba(0,0,0,0.45), 0 10px 24px -12px rgba(0,0,0,0.7)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 14px 30px -18px rgba(0,0,0,0.8)",
        lift: "0 18px 40px -20px rgba(0,0,0,0.85)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseBar: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(220%)" },
        },
        stamp: {
          "0%": { opacity: "0", transform: "scale(1.5) rotate(-9deg)" },
          "60%": { opacity: "1", transform: "scale(0.94) rotate(-9deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-9deg)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s cubic-bezier(0.2,0.8,0.2,1) both",
        pulseBar: "pulseBar 1.1s ease-in-out infinite",
        scan: "scan 2.4s linear infinite",
        stamp: "stamp 0.5s cubic-bezier(0.2,0.9,0.3,1.2) both",
      },
    },
  },
  plugins: [],
};
