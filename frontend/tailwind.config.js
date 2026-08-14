/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          600: 'var(--primary-hover)',
          500: 'var(--primary-light)'
        },
        brand: {
          wine: '#8B263E',
          burgundy: '#721E32',
          blush: '#FDF2F4',
          ivory: '#FAF6F0',
          charcoal: '#1C1917',
          stone: '#E7E5E4'
        },
        glass: {
          50: 'rgba(255,255,255,0.5)',
          100: 'rgba(255,255,255,0.15)'
        },
        accent: {
          pink: '#ff6b9f',
          rose: '#ff5c7c',
          wine: 'var(--primary)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Playfair Display', 'serif']
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
