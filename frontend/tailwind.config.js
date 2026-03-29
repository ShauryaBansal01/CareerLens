/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      colors: {
        surface: '#f8f9fa',
        'surface-low': '#f1f4f6',
        'surface-lowest': '#ffffff',
        'surface-variant': '#dbe4e7',
        primary: {
          400: '#8582ff',
          500: '#4d44e3',
          600: '#4034d7',
        },
        'on-surface': '#2b3437',
        'on-surface-variant': '#586064',
        error: '#9e3f4e',
      },
      boxShadow: {
        'ambient': '0px 20px 40px rgba(77, 68, 227, 0.04)',
        'ambient-hover': '0px 25px 50px rgba(77, 68, 227, 0.08)',
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 3s infinite',
        'blob': 'blob 10s infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-2%)' },
          '50%': { transform: 'translateY(2%)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      }
    },
  },
  plugins: [],
}
// trigger rebuild
