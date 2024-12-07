import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    host: true, // Expose server on local network
    hmr: {
      overlay: false, // Disable error overlay
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Redirect API calls to backend
        changeOrigin: true,
        secure: false, // Ignore SSL errors (if any) on the target
        cookieDomainRewrite: 'localhost', // Tambahkan ini
        cookiePathRewrite: '/' // Tambahkan ini
      },
    },
  },
  plugins: [react()],
});
