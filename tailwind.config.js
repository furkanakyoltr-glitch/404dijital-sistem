/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#f8f9fa",
        foreground: "#1a1a1a",
        primary: { DEFAULT: "#1a1a1a", foreground: "#ffffff" },
        secondary: { DEFAULT: "#4a4a4a", foreground: "#ffffff" },
        muted: { DEFAULT: "#f8f9fa", foreground: "#555555" },
        card: { DEFAULT: "#ffffff", foreground: "#1a1a1a" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        gold: "#ffc107",
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      },
      fontFamily: {
        'bebas': ['Bebas Neue', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1.5rem',
      },
      keyframes: {
        'fly-right': {
          '0%': { left: '-120%' },
          '50%': { left: '0%' },
          '100%': { left: '100%' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideIn': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fly-right': 'fly-right 2s cubic-bezier(0.7, 0, 0.3, 1) forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin-slow 20s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
