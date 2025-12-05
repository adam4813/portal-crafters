import { defineConfig } from 'vite';

export default defineConfig({
  base: '/portal-crafters/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
