/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-main) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        primary: '#4F46E5', // Indigo
        secondary: '#06B6D4', // Cyan
        accent: '#0ea5e9',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        textMain: 'rgb(var(--text-main) / <alpha-value>)',
        textMuted: 'rgb(var(--text-muted) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
