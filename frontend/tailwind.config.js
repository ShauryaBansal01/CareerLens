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
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      colors: {
        // Light Mode Apple-inspired
        surface: '#f5f5f7',
        'surface-low': '#f0f0f2',
        'surface-lowest': '#ffffff',
        'surface-variant': '#e8e8ea',
        'surface-high': '#e2e2e4',
        
        // Dark Mode Apple-inspired
        'dark-surface': '#000000',
        'dark-card': '#1c1c1e',
        'dark-border': '#38383a',
        'dark-hover': '#2c2c2e',
        'dark-muted': '#8e8e93',
        
        primary: {
          400: '#47a3f5',
          500: '#0071e3',
          600: '#0059b5',
        },
        // Text
        'on-surface': '#1d1d1f',
        'on-surface-variant': '#6e6e73',
        'on-dark': '#f5f5f7',
        
        // System colors
        error: '#ff3b30',
        success: '#34c759',
        warning: '#ff9500',
        // Outline
        'outline-variant': '#d2d2d7',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.03em',
      },
      borderRadius: {
        'card': '18px',
        'input': '12px',
        'pill': '980px',
      },
      boxShadow: {
        'ambient': '0 4px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)',
        'ambient-hover': '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'card': '0 2px 12px rgba(0,0,0,0.05)',
      },
      backdropBlur: {
        nav: '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s ease',
        'spin-slow': 'spin 1.4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
