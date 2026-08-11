import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project Pages served at https://iamkhayyam.github.io/type-tweaker/
export default defineConfig({
  root: __dirname,
  base: '/type-tweaker/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5180,
    host: '0.0.0.0',
  },
});
