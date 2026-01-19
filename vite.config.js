import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Will be set via environment variable or defaults to '/'
  base: process.env.VITE_BASE_PATH || '/',

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'github-api': ['@octokit/rest'],
          'storage': ['idb']
        }
      }
    }
  },

  server: {
    port: 3000,
    open: true
  },

  preview: {
    port: 4173
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.{test,spec}.js']
    }
  }
});
