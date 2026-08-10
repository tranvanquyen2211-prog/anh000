/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2C59',
          dark: '#0A1E3F',
          light: '#1A3B6E'
        },
        orange: {
          DEFAULT: '#FF6B00',
          hover: '#E65100'
        },
        gold: {
          DEFAULT: '#FFD700',
          dark: '#B8860B'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}
