/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: "#13151A",
        panel: "#1C1F26",
        panelEdge: "#262B35",
        
        // Brand
        accent: "#7C5CFC",
        accentDim: "rgba(124, 92, 252, 0.15)",
        accentHover: "#6B4AE0",
        
        // Text
        white: "#FFFFFF",
        muted: "#6B7385",
        label: "#4A5060",
        
        // Semantic
        success: "#3EC98A",
        error: "#FF5C6A",
      },
      backgroundImage: {
        'gradient-title': 'linear-gradient(135deg, #FFFFFF, #B09FFF)',
        'gradient-button': 'linear-gradient(135deg, #9B7DFF, #7C5CFC, #5A3FC0)',
      },
      boxShadow: {
        'accent': '0 8px 24px rgba(124, 92, 252, 0.40)',
        'accent-sm': '0 4px 12px rgba(124, 92, 252, 0.25)',
        'field-focus': '0 0 16px rgba(124, 92, 252, 0.18)',
        'panel': '0 4px 16px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}