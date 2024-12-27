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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#1B8B7D',
          600: '#187D70',
          700: '#156F63',
          800: '#126156',
          900: '#0F5349',
        }
      }
    },
  },
  plugins: [],
} 