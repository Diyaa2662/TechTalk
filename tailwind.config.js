/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: "#13151A",
        panel: "#1C1F26",
        panelEdge: "#262B35",

        // Brand
        accent: "#5CA1FC",
        accentDim: "rgba(92, 161, 252, 0.15)",
        accentHover: "#4A8BE8",
        accentDark: "#3A75CC",
        accentLight: "#7DB4FD",

        // Text
        white: "#FFFFFF",
        muted: "#8A94A6",
        label: "#5A6478",

        // Semantic
        success: "#3EC98A",
        error: "#FF5C6A",
        warning: "#F59E0B",
        info: "#5CA1FC",
      },
      backgroundImage: {
        "gradient-title": "linear-gradient(135deg, #FFFFFF, #5CA1FC, #4A8BE8)",
        "gradient-title-secondary":
          "linear-gradient(135deg, #5CA1FC, #7DB4FD, #3A75CC)",
        "gradient-button": "linear-gradient(135deg, #5CA1FC, #4A8BE8, #3A75CC)",
        "gradient-accent": "linear-gradient(135deg, #5CA1FC, #4A8BE8)",
        "gradient-glow":
          "linear-gradient(135deg, rgba(92, 161, 252, 0.2), rgba(92, 161, 252, 0.05))",
      },
      boxShadow: {
        accent: "0 8px 32px rgba(92, 161, 252, 0.40)",
        "accent-sm": "0 4px 16px rgba(92, 161, 252, 0.25)",
        "accent-lg": "0 12px 48px rgba(92, 161, 252, 0.30)",
        "field-focus": "0 0 24px rgba(92, 161, 252, 0.15)",
        panel: "0 4px 16px rgba(0, 0, 0, 0.35)",
        "panel-lg": "0 8px 32px rgba(0, 0, 0, 0.45)",
      },
      animation: {
        gradient: "gradientMove 4s ease infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "slide-up": "slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
