import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#163a6b', deep: '#0d2545', light: '#1e4f8a' },
        blue: '#3a7cc5',
        sky: { DEFAULT: '#7dbce0', pale: '#bddaef' },
        coral: { DEFAULT: '#e2725b', soft: '#ef9a86', pale: '#f7cec4' },
        gold: { DEFAULT: '#c6a048', light: '#ddc578', pale: '#f0e4c0' },
        cream: '#f8f4ee',
        warm: { DEFAULT: '#fdfaf5', dark: '#f2ece3' },
        text: { DEFAULT: '#1a2940', soft: '#5e7086', faint: '#8a97a8' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
