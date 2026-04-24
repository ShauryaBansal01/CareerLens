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
        // Neon / Cyber premium palette
        surface: '#f8fafc',
        'surface-low': '#f1f5f9',
        'surface-lowest': '#ffffff',
        'surface-variant': '#e2e8f0',
        'surface-high': '#cbd5e1',
        
        // Deep Dark Mode for AI apps
        'dark-surface': '#040405',
        'dark-card': '#0a0a0c',
        'dark-border': '#18181b',
        'dark-hover': '#131316',
        'dark-muted': '#71717a',
        
        // Vibrant Accents
        primary: {
          400: '#a78bfa',
          500: '#8b5cf6', // Violet
          600: '#7c3aed',
        },
        secondary: {
          400: '#22d3ee',
          500: '#06b6d4', // Cyan
          600: '#0891b2',
        },
        tertiary: {
          400: '#34d399',
          500: '#10b981', // Emerald
          600: '#059669',
        },

        // Text
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
        'on-dark': '#f8fafc',
        
        // System colors
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        // Outline
        'outline-variant': '#cbd5e1',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.03em',
      },
      borderRadius: {
        'card': '20px',
        'input': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'ambient': '0 4px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
        'ambient-hover': '0 10px 50px rgba(139, 92, 246, 0.15), 0 4px 20px rgba(139, 92, 246, 0.1)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
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
