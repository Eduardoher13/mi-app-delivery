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
        accent: '#00A878',
        navy: '#0F172A',
        charcoal: '#1A202C',
        neutral: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
