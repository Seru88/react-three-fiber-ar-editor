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
    themes: [
      'lofi',
      'light',
      'dark',
      // 'cupcake',
      // 'bumblebee',
      // 'emerald',
      // 'corporate',
      // 'synthwave',
      // 'retro',
      'cyberpunk',
      // 'valentine',
      // 'halloween',
      'garden',
      // 'forest',
      'aqua',
      // 'pastel',
      // 'fantasy',
      // 'wireframe',
      // 'black',
      // 'luxury',
      'dracula',
      // 'cmyk',
      // 'autumn',
      'business',
      // 'acid',
      // 'lemonade',
      'night',
      // 'coffee',
      'winter'
    ]
  }
}
