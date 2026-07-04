/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Theme Backgrounds
        background: {
          light: '#F8FAFC',
          dark: '#020617',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        // Core Palette
        primary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', 
          600: '#475569', 
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Main Navy
        },
        secondary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Indigo
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', 
          600: '#0284C7',
          700: '#0369A1', // Main Blue
          800: '#075985',
          900: '#0C4A6E',
        },
        // Semantic Colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Borders and Text (Dark Mode variables mapped via CSS if needed, but explicit here is good too)
        border: {
          light: '#E2E8F0',
          dark: '#334155',
        },
        muted: {
          light: '#64748B',
          dark: '#94A3B8',
        }
      },
      borderRadius: {
        'button': '14px',
        'input': '14px',
        'card': '16px',
        'modal': '18px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        'soft-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
        'soft-dark-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
