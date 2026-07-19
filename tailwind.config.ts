import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

/**
 * Tesla Mall design tokens.
 * Palette extracted from the Tesla Mall logo:
 *  - Metallic gold gradient (brand signature)
 *  - Pure white (brand base)
 *  - Ink black (typographic contrast, dark mode surface)
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Tesla Mall gold scale — extracted from logo metallic gradient
        gold: {
          50: "#FBF6EA",
          100: "#F5EACB",
          200: "#EAD6A0",
          300: "#DFC077",
          400: "#D4AF55",
          500: "#C6A048", // core brand gold (buttons, active states)
          600: "#B08A34",
          700: "#8E6D28",
          800: "#6B521E",
          900: "#4A3814",
          950: "#2C210C",
        },
        ink: {
          DEFAULT: "#0A0A0B",
          50: "#F4F4F5",
          100: "#E4E4E7",
          200: "#B8B8BE",
          300: "#8C8C94",
          400: "#5F5F69",
          500: "#3A3A42",
          600: "#26262C",
          700: "#1A1A1E",
          800: "#111113",
          900: "#0A0A0B",
          950: "#050506",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(198, 160, 72, 0.45)",
        "gold-sm": "0 2px 10px -2px rgba(198, 160, 72, 0.35)",
        premium: "0 20px 60px -15px rgba(10, 10, 11, 0.25)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #EAD6A0 0%, #C6A048 45%, #8E6D28 100%)",
        "gold-shimmer":
          "linear-gradient(110deg, #B08A34 0%, #F5EACB 30%, #D4AF55 50%, #F5EACB 70%, #B08A34 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
};

export default config;
