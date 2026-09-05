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
        // Semantic SOC tokens — values live in app/globals.css as CSS variables
        // (light default via :root, dark via .dark) so every component is
        // dual-theme without dark: prefixes. RGB triplets enable /alpha use.
        soc: {
          bg: "rgb(var(--soc-bg) / <alpha-value>)",
          panel: "rgb(var(--soc-panel) / <alpha-value>)",
          raised: "rgb(var(--soc-raised) / <alpha-value>)",
          overlay: "rgb(var(--soc-overlay) / <alpha-value>)",
          border: "rgb(var(--soc-border) / <alpha-value>)",
          borderStrong: "rgb(var(--soc-borderStrong) / <alpha-value>)",
          text: "rgb(var(--soc-text) / <alpha-value>)",
          textSecondary: "rgb(var(--soc-textSecondary) / <alpha-value>)",
          textMuted: "rgb(var(--soc-textMuted) / <alpha-value>)",
          textDim: "rgb(var(--soc-textDim) / <alpha-value>)",
          accent: "rgb(var(--soc-accent) / <alpha-value>)",
          accentBright: "rgb(var(--soc-accentBright) / <alpha-value>)",
          accentDim: "rgb(var(--soc-accentDim) / <alpha-value>)",
          accentInk: "rgb(var(--soc-accentInk) / <alpha-value>)",
          crit: "rgb(var(--soc-crit) / <alpha-value>)",
          critDim: "rgb(var(--soc-critDim) / <alpha-value>)",
          high: "rgb(var(--soc-high) / <alpha-value>)",
          highDim: "rgb(var(--soc-highDim) / <alpha-value>)",
          med: "rgb(var(--soc-med) / <alpha-value>)",
          medDim: "rgb(var(--soc-medDim) / <alpha-value>)",
          low: "rgb(var(--soc-low) / <alpha-value>)",
          lowDim: "rgb(var(--soc-lowDim) / <alpha-value>)",
          ok: "rgb(var(--soc-ok) / <alpha-value>)",
          okDim: "rgb(var(--soc-okDim) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-grotesk)",
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],     // 11px
        xs: ["0.75rem", { lineHeight: "1.125rem" }],       // 12px
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],      // 13px body
        base: ["0.875rem", { lineHeight: "1.375rem" }],    // 14px
        lg: ["1rem", { lineHeight: "1.5rem" }],            // 16px
        xl: ["1.125rem", { lineHeight: "1.65rem" }],       // 18px
        "2xl": ["1.375rem", { lineHeight: "1.8rem" }],     // 22px page title
      },
      borderRadius: {
        sm: "7px",
        DEFAULT: "9px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        "2xl": "18px",
        full: "9999px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        dropdown: "var(--shadow-dropdown)",
        drawer: "-16px 0 48px rgb(16 24 40 / 0.18)",
      },
      maxWidth: {
        console: "1440px",
      },
    },
  },
  plugins: [],
}
