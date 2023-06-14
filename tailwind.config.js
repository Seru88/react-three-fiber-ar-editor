/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        'dynamic-screen': '100dvh'
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['emerald']
  }
}
