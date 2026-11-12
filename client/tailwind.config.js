/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f9f8',
          100: '#f3f2ee',
          200: '#e7e5dd',
          300: '#d5d0c2',
          400: '#b8b09b',
          500: '#9b9075',
          600: '#7e735b',
          700: '#645b49',
          800: '#4a4437',
          900: '#1e1c18',
          950: '#0f0e0c',
        },
        editorial: {
          card: '#F6F5F2',
          cardHover: '#EDEBE5',
          dark: '#0E0E10',
          accent: '#FF4D2E',
          royal: '#1E3A8A',
          warm: '#FBF9F5'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        display: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

