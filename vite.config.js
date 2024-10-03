import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your Express server's port
        changeOrigin: true,              // Necessary for proxying
        secure: false,                   // Use this if your backend doesn't use HTTPS
      }
    }
  }
})
