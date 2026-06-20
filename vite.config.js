import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://localhost:7082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
