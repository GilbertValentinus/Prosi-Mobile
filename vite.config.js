import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false  // Add this to disable the error overlay
    },
    proxy: {
      '/api': {
        // target: 'junction.proxy.rlwy.net:32409',
        target: 'https://prosi-mobile.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});