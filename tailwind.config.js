/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        black: "#000000",
        yellowShade: "#FFC107",
        darkShade: "#121212",
        greyShade: "#6B7280",
      },
    },
  },
  plugins: [],
};
