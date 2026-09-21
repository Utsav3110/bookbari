/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FCFAF6",
          100: "#FAF7F2",
          200: "#F2EDE4",
          300: "#E5DDD0",
          400: "#D3C6B4",
          500: "#BBA892",
          600: "#9E8B75",
          700: "#7F6E5B",
          800: "#5D5042",
          900: "#2C2C2C",
        },
        charcoal: {
          50: "#3D3D37",
          100: "#2B2B27",
          200: "#161614",
          300: "#10100F",
          400: "#080807",
          border: "#484841",
        },
        primary: {
          DEFAULT: "#2D6A4F",
          hover: "#22533D",
          light: "#E8F4EE",
          dark: "#40916C",
        },
        terracotta: {
          DEFAULT: "#C0623A",
          hover: "#A34F2C",
          light: "#FDF2EC",
        },
        ink: {
          DEFAULT: "#2C2C2C",
          muted: "#6B655E",
          light: "#9A938A",
        },
      },
      fontFamily: {
        heading: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        elevation: "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
}
