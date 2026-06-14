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
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-low': 'rgb(var(--color-surface-low) / <alpha-value>)',
        'surface-lowest': 'rgb(var(--color-surface-lowest) / <alpha-value>)',
        'surface-variant': 'rgb(var(--color-surface-variant) / <alpha-value>)',
        'surface-high': 'rgb(var(--color-surface-high) / <alpha-value>)',
        
        'dark-surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'dark-card': 'rgb(var(--color-card) / <alpha-value>)',
        'dark-border': 'rgb(var(--color-border) / <alpha-value>)',
        'dark-hover': 'rgb(var(--color-surface-variant) / <alpha-value>)',
        'dark-muted': 'rgb(var(--color-muted) / <alpha-value>)',
        
        primary: {
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
        },
        secondary: {
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
        },
        tertiary: {
          400: '#34d399',
          500: '#10b981', // Emerald
          600: '#059669',
        },

        // Text
        'on-surface': 'rgb(var(--color-text) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-muted) / <alpha-value>)',
        'on-dark': 'rgb(var(--color-text) / <alpha-value>)',
        
        // System colors
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        // Outline
        'outline-variant': 'rgb(var(--color-border) / <alpha-value>)',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.03em',
      },
      borderRadius: {
        'card': '8px',
        'input': '8px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'ambient': 'var(--shadow-card)',
        'ambient-hover': 'var(--shadow-card-hover)',
        'glow-primary': 'var(--shadow-glow)',
        'glow-cyan': 'var(--shadow-glow)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        nav: '20px',
        glass: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradientX 15s ease infinite',
        'border-beam': 'borderBeam 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientX: {
          '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
          },
          '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
          },
        },
        borderBeam: {
          '100%': { transform: 'rotate(1turn)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(258,90%,66%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(330,100%,71%,0.1) 0px, transparent 50%)',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(258,90%,66%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(330,100%,71%,0.05) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
