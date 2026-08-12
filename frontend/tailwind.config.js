/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          600: '#1d4ed8',
          500: '#3b82f6'
        },
        glass: {
          50: 'rgba(255,255,255,0.5)',
          100: 'rgba(255,255,255,0.15)'
        },
        accent: {
          pink: '#ff6b9f',
          rose: '#ff5c7c'
        }
      },
      borderRadius: {
        'xl-2': '1.25rem'
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(2,6,23,0.12)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(15px, -25px) scale(1.05)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
