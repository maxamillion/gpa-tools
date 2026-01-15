import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gpa-tools/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Performance budgets per constitution
    chunkSizeWarningLimit: 500, // 500KB gzipped
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  }
});
