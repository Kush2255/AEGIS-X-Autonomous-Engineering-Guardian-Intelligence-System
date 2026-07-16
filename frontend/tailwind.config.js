/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3b82f6", # Blue
          success: "#10b981", # Emerald
          warning: "#f59e0b", # Amber
          danger: "#ef4444", # Red
          critical: "#ec4899", # Pink/Critical
        },
        dark: {
          bg: "#080B10",
          card: "rgba(13, 18, 30, 0.65)",
          border: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.1)",
          text: "#f3f4f6",
          muted: "#9ca3af"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(59, 130, 246, 0.15)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
