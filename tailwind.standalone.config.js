/** @type {import('tailwindcss').Config} */
const preset = require('./src/styles/preset.js')

module.exports = {
  content: ['./src/ui/**/*.tsx'],
  theme: {
    extend: {
      ...preset.theme?.extend,
    },
  },
  plugins: [],
}
