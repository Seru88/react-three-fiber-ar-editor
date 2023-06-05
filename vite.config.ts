import eslintPlugin from '@nabla/vite-plugin-eslint'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.hdr', '**/*.glb', '**/*.env'],
  plugins: [
    {
      ...eslintPlugin(),
      apply: 'serve'
    },
    {
      ...eslint({
        emitWarning: true,
        failOnWarning: false
      }),
      apply: 'build'
    },
    tsconfigPaths({ loose: true }),
    basicSsl(),
    react()
  ],
  preview: {
    https: true,
    open: true,
    proxy: {
      '/api': {
        target: 'https://seb.xrplatform.io',
        // target: 'https://peb.xrplatform.io',
        changeOrigin: true,
        secure: false
        // ws: true,
      }
    }
  },
  server: {
    https: true,
    open: true,
    proxy: {
      '/api': {
        target: 'https://seb.xrplatform.io',
        changeOrigin: true,
        secure: false
        // ws: true,
      }
    }
  }
})
