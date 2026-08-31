/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          base: "#060709",
          panel: "#0C0E12",
          raised: "#14171E",
          elevated: "#1C2029",
          border: "#232732",
          borderSubtle: "#171A22",
          borderContrast: "#4A5162",
          textPrimary: "#F4F5F7",
          textSecondary: "#9CA3AF",
          textMuted: "#656C7A",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
