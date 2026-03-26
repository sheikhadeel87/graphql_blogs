/** @type {import('tailwindcss').Config} */
export default {
darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#6ba3fc',
          500: '#4f85f5',
          600: '#3b72e8',
          700: '#2d5fd6',
          800: '#244bbf',
          900: '#1e3a9e',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 30px -6px rgb(0 0 0 / 0.08), 0 4px 12px -4px rgb(0 0 0 / 0.04)',
        'glow': '0 0 0 1px rgb(79 133 245 / 0.08), 0 8px 24px -4px rgb(79 133 245 / 0.15)',
        'inner-glow': 'inset 0 1px 0 0 rgb(255 255 255 / 0.03)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #4f85f5 0%, #3b72e8 100%)',
        'gradient-mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(79 133 245 / 0.1), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgb(79 133 245 / 0.05), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
