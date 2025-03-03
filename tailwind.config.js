/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white-linen': '#F9F4EC',
        'moss-green': '#B7D5B9',
        'lemon-yellow': '#FFE552',
        'spring-garden': '#51865D',
        'forest-green': '#006442',
        'charcoal': '#3C3C3B',
      },
    },
  },
  plugins: [],
}
