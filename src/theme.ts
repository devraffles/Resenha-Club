import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  cssVarsPrefix: "resenha",
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: "#f5eeff" },
          100: { value: "#e9d5ff" },
          200: { value: "#d4aaff" },
          300: { value: "#b975ff" },
          400: { value: "#a855f7" },
          500: { value: "#8B2FC9" },
          600: { value: "#7B1FA2" },
          700: { value: "#6A0F91" },
          800: { value: "#4A0072" },
          900: { value: "#2D0050" },
          950: { value: "#1A0030" },
        },
        gold: {
          50:  { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
          950: { value: "#451a03" },
        },
      },
      gradients: {
        brand: { value: "linear-gradient(135deg, #8B2FC9 0%, #6A0F91 50%, #4A0072 100%)" },
        gold:  { value: "linear-gradient(135deg, #FFD700 0%, #F59E0B 50%, #D97706 100%)" },
        "brand-dark": { value: "linear-gradient(180deg, #2D0050 0%, #1A0030 100%)" },
        hero:  { value: "linear-gradient(135deg, #4A0072 0%, #2D0050 40%, #1A0030 100%)" },
        card:  { value: "linear-gradient(145deg, rgba(139,47,201,0.15) 0%, rgba(74,0,114,0.05) 100%)" },
        glow:  { value: "radial-gradient(ellipse at center, rgba(139,47,201,0.3) 0%, transparent 70%)" },
        "gold-glow": { value: "radial-gradient(ellipse at center, rgba(245,158,11,0.3) 0%, transparent 70%)" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid:      { value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" } },
          contrast:   { value: "{colors.brand.50}" },
          fg:         { value: "{colors.brand.700}" },
          muted:      { value: "{colors.brand.100}" },
          subtle:     { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing:  { value: "{colors.brand.500}" },
        },
        gold: {
          solid:      { value: "{colors.gold.500}" },
          contrast:   { value: "{colors.gold.50}" },
          fg:         { value: "{colors.gold.700}" },
          muted:      { value: "{colors.gold.100}" },
          subtle:     { value: "{colors.gold.200}" },
          emphasized: { value: "{colors.gold.300}" },
          focusRing:  { value: "{colors.gold.500}" },
        },
      },
    },
    keyframes: {
      shimmer: {
        "0%":   { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
      glow: {
        "0%, 100%": { boxShadow: "0 0 20px rgba(139,47,201,0.4), 0 0 40px rgba(139,47,201,0.2)" },
        "50%":      { boxShadow: "0 0 30px rgba(139,47,201,0.7), 0 0 60px rgba(139,47,201,0.4)" },
      },
      goldGlow: {
        "0%, 100%": { boxShadow: "0 0 15px rgba(245,158,11,0.4)" },
        "50%":      { boxShadow: "0 0 30px rgba(245,158,11,0.8), 0 0 50px rgba(245,158,11,0.4)" },
      },
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%":      { transform: "translateY(-8px)" },
      },
      dealCard: {
        "0%":   { transform: "translateY(-100px) rotate(-10deg)", opacity: "0" },
        "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
      },
    },
  },
  globalCss: {
    "*": {
      boxSizing: "border-box",
    },
    "html, body": {
      bg: "#0D0118",
      color: "white",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: "hidden",
    },
    "::-webkit-scrollbar": {
      width: "6px",
    },
    "::-webkit-scrollbar-track": {
      bg: "#1A0030",
    },
    "::-webkit-scrollbar-thumb": {
      bg: "#6A0F91",
      borderRadius: "full",
    },
    "::-webkit-scrollbar-thumb:hover": {
      bg: "#8B2FC9",
    },
  },
})

export const system = createSystem(defaultConfig, config)
