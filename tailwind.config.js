/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080D18",
        surface: "#0e131e",
        "surface-dim": "#0e131e",
        "surface-bright": "#343946",
        "surface-container-lowest": "#090e19",
        "surface-container-low": "#161b27",
        "surface-container": "#1b1f2b",
        "surface-container-high": "#252a36",
        "surface-container-highest": "#303541",
        "on-surface": "#dee2f2",
        "on-surface-variant": "#bdc8d1",
        outline: "#87929a",
        "outline-variant": "#3e484f",
        primary: {
          DEFAULT: "#38bdf8",
          light: "#8ed5ff",
          container: "#38bdf8",
        },
        "on-primary": "#00354a",
        "on-primary-container": "#004965",
        secondary: {
          DEFAULT: "#bdc2ff",
          container: "#2f3aa3",
        },
        tertiary: {
          DEFAULT: "#4ee6aa",
          container: "#22c990",
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
