/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: 1 },
          "100%": { transform: "scale(2)", opacity: 0 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        breathe: "breathe 3s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        ripple: "ripple 1.5s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
      backgroundImage: {
        "garden-gradient": "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        "water-pattern": "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cGF0aCBkPSJNMjggNjZMMCA1MEwwIDE2TDI4IDBMNTYgMTZMNTYgNTBMMjggNjZMMjggMTAwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4NGZhYjAxNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA4NEwyOCAxMDBMNTYgODRMNTYgNTBMMjggMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg0ZmFiMDE1IiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD4KPC9zdmc+')",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};