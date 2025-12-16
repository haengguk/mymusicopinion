/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // Indigo-500
        secondary: "#A855F7", // Purple-500
        dark: "#0F172A", // Slate-900
      }
    },
  },
  plugins: [],
}
