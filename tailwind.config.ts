import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      /* Typography — keeps DGC People standardized scale, adds Pulse named sizes */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.75rem", { lineHeight: "2.25rem" }],
        "2xl": ["2rem", { lineHeight: "2.5rem" }],
        /* Pulse named sizes (opt-in) */
        caption:    ["13px", { lineHeight: "18px", letterSpacing: "0.02em" }],
        body:       ["16px", { lineHeight: "26px" }],
        "body-lg":  ["18px", { lineHeight: "30px" }],
        eyebrow:    ["12px", { lineHeight: "16px", letterSpacing: "0.16em" }],
        h4:         ["18px", { lineHeight: "24px", letterSpacing: "0", fontWeight: "500" }],
        h3:         ["28px", { lineHeight: "34px", letterSpacing: "-0.015em", fontWeight: "500" }],
        h2:         ["40px", { lineHeight: "46px", letterSpacing: "-0.02em",  fontWeight: "600" }],
        h1:         ["56px", { lineHeight: "60px", letterSpacing: "-0.025em", fontWeight: "600" }],
        display:    ["72px", { lineHeight: "76px", letterSpacing: "-0.03em",  fontWeight: "600" }],
        metric:     ["32px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "metric-lg":["44px", { lineHeight: "48px", letterSpacing: "-0.02em",  fontWeight: "600" }],
        "metric-xl":["52px", { lineHeight: "56px", letterSpacing: "-0.025em", fontWeight: "600" }],
        "page-title":["44px", { lineHeight: "50px", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          bg: "hsl(var(--destructive-bg))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          bg: "hsl(var(--success-bg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          bg: "hsl(var(--warning-bg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          accent: "hsl(var(--chart-accent))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          muted: "hsl(var(--sidebar-muted))",
        },
      },
      borderRadius: {
        "2xl": "calc(var(--radius) + 6px)",
        xl: "calc(var(--radius) + 4px)",
        lg: "calc(var(--radius) + 2px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 1px)",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      gap: {
        grid: "var(--spacing-md)",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        content: "1200px",
        page: "1400px",
        prose: "65ch",
      },
      transitionTimingFunction: {
        refined: "cubic-bezier(0.2, 0.6, 0.2, 1)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-lg)",
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
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "50%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(0.95)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 280ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
        "fade-in": "fade-in 280ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
        "scale-in": "scale-in 0.2s ease-out both",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
