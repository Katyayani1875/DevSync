// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        'muted-foreground': '#A3A3A3',
        accent: '#F7879A', // sharp, salmon-pink accent
      },
      fontFamily: {
        // Set Satoshi as the default sans-serif font
        sans: ['Satoshi', 'sans-serif'],
      },
    },
  },
  plugins: [],
}