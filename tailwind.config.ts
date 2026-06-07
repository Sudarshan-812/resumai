import type { Config } from "tailwindcss";

const config: Config = {
  // FIXED: Removed brackets to satisfy TypeScript's DarkModeStrategy type
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#F7F6F2',
          dark: '#F0EFE9',
          faint: '#FAFAF8',
        },
        brand: {
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
          light: '#22d3ee',
          faint: '#A5F3FC',
        },
        ink: {
          DEFAULT: '#111111',
          muted: '#6B6860',
          subtle: '#9B9890',
          faint: '#C8C4BB',
        },
        border: {
          DEFAULT: '#E5E3DC',
        },
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  // Ensure you have tailwindcss-animate installed: npm install tailwindcss-animate
  plugins: [require("tailwindcss-animate")],
};

export default config;