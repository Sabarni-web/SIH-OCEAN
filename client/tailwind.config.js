/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040b16',
        surface: 'rgba(10, 25, 47, 0.6)',
        surfaceElevated: 'rgba(17, 34, 64, 0.8)',
        primary: '#00d4ff',
        secondary: '#0a66c2',
        accent: '#64ffda',
        textPrimary: '#e6f1ff',
        textSecondary: '#8892b0',
        border: 'rgba(0, 212, 255, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
