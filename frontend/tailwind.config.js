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
          950: '#070d1e',
          900: '#0b132b',
          800: '#1c2541',
          700: '#2a365c',
          600: '#3a4b7c',
        },
        cyan: {
          400: '#48cae4',
          500: '#00b4d8',
        }
      }
    },
  },
  plugins: [],
}
