import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import process from 'node:process';

const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: apiTarget, changeOrigin: true } },
  },
  preview: {
    proxy: { '/api': { target: apiTarget, changeOrigin: true } },
  },
});
