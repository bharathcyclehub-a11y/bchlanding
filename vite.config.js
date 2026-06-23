import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better dev experience
      fastRefresh: true,
      // Exclude node_modules from Fast Refresh
      exclude: /node_modules/,
    })
  ],

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2015',

    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep React, react-dom AND its scheduler/store deps in ONE chunk —
            // splitting scheduler out breaks react-dom (unstable_scheduleCallback undefined).
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')
              || id.includes('scheduler') || id.includes('use-sync-external-store')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        }
      }
    },

    // Source maps for production debugging (optional, can disable for smaller builds)
    sourcemap: false,

    // Asset inline limit
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64

    // Enable polyfill for legacy browsers (if needed)
    modulePreload: {
      polyfill: true
    }
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'jspdf'],
    // Force esbuild to optimize these dependencies
    esbuildOptions: {
      target: 'es2015'
    }
  },

  // Server configuration
  server: {
    // Enable compression in dev
    compress: true
  }
})
