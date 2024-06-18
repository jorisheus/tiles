/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors.js'

export default {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,vue,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/app.vue'
  ]
}

