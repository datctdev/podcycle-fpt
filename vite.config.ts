import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/sepay': {
        target: 'https://userapi.sepay.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sepay/, '')
      }
    }
  }
})
