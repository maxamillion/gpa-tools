import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command }) => ({
  // Use /gpa-tools/ for production builds, / for development
  base: command === 'build' ? '/gpa-tools/' : '/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Performance budgets per constitution
    chunkSizeWarningLimit: 500, // 500KB gzipped
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor code separate from application code
          'vendor': ['@octokit/rest'],
          // Chart library loaded lazily
          'charts': ['chart.js']
        }
      }
    }
  },
  plugins: [
    // Bundle size visualization - generates stats.html
    visualizer({
      filename: '../dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  }
}));
