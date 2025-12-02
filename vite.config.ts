import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: /\.vue$/,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
    fs: {
      strict: false,
    },
    hmr: {
      overlay: true,
    },
  },
  build: {
    target: 'es2022', // Support top-level await
  },
  optimizeDeps: {
    include: ['vue', 'vue-router'],
  },
})

