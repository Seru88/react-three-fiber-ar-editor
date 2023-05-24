/* eslint-disable no-undef */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: 'default',
            '@fullhuman/postcss-purgecss': {
              content: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.ts'],
              safelist: {
                standard: [/\[(.*?)\]$/]
              }
            }
          }
        }
      : {})
  }
}
