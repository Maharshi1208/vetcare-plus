/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#b9e6ff",
          300: "#8cd6ff",
          400: "#59bfff",
          500: "#2aa4ff",
          600: "#1682e6",
          700: "#1569be",
          800: "#155899",
          900: "#133a63",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.03), 0 8px 24px -12px rgb(2 6 23 / 0.15)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};