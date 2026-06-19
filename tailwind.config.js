/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#1e3a8a',
        'navy-dark': '#0f172a',
        accent: '#1e3a8a',
        neutral: '#E2E8F0',
        charcoal: '#1e3a8a',
      },
    },
  },
  plugins: [],
};
