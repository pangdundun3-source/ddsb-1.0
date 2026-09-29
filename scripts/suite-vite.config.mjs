import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

const appRoot = process.env.SUITE_APP_DIR;
const cacheDir = process.env.SUITE_CACHE_DIR;

if (!appRoot || !cacheDir) {
  throw new Error('SUITE_APP_DIR and SUITE_CACHE_DIR are required');
}

export default defineConfig({
  root: appRoot,
  cacheDir,
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': appRoot,
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
