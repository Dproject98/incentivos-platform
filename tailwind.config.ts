import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Brand colors */
        purple: { DEFAULT: "#7c3aed", light: "#9d65f5", dark: "#5b21b6" },
        pink:   { DEFAULT: "#ec4899", light: "#f472b6", dark: "#be185d" },
        cyan:   { DEFAULT: "#06b6d4", light: "#22d3ee", dark: "#0891b2" },
        space:  { DEFAULT: "#0a0e27", panel: "#1a1f3a", depth: "#252d4a" },
        /* Metal tiers */
        bronze:   { DEFAULT: "#8B6914", light: "#b8892a" },
        silver:   { DEFAULT: "#C0C0C0", light: "#e0e0e0" },
        gold:     { DEFAULT: "#FFD700", light: "#ffe033" },
        platinum: { DEFAULT: "#E5E4E2", light: "#f5f4f2" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "space-gradient": "radial-gradient(ellipse at center, #1a1f3a 0%, #0a0e27 70%)",
        "purple-glow": "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
        "brand-gradient": "linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)",
        "gold-gradient": "linear-gradient(135deg, #8B6914, #FFD700, #8B6914)",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.15)",
        "glow-cyan": "0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.15)",
        "glow-pink": "0 0 20px rgba(236,72,153,0.4), 0 0 40px rgba(236,72,153,0.15)",
        "glow-gold": "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.15)",
        "glass": "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite alternate",
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        "neon-pulse": {
          from: { boxShadow: "0 0 5px rgba(6,182,212,0.2)" },
          to:   { boxShadow: "0 0 20px rgba(6,182,212,0.6)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
