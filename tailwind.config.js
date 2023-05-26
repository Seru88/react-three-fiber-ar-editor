/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      height: {
        'dynamic-screen': '100dvh'
      }
    }
  },
  plugins: [require('tw-elements/dist/plugin.cjs')],
  darkMode: 'class'
}
