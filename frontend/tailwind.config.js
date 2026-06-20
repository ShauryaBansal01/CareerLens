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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Theme Backgrounds
        background: {
          light: '#FAFBFD',
          dark: '#0F172A',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        // Core Palette
        primary: {
          50: '#F0EFFF',
          100: '#E4E1FF',
          200: '#C9C4FF',
          300: '#AFA6FF',
          400: '#8E82FF',
          500: '#6C5CE7', // Primary Purple
          600: '#5649B9',
          700: '#40378A',
          800: '#2B255C',
          900: '#15122E',
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
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // Emerald Green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
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
