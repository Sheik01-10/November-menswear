import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Match core React packages only (avoiding matching react-icons, etc.)
            const isReactCore = /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id);
            if (isReactCore) {
              return 'react-vendor';
            }
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('gsap') || id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('swiper')) {
              return 'swiper-vendor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
