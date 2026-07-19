import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('gsap') || id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('swiper')) {
              return 'swiper-vendor';
            }
            return 'vendor'; // generic vendor
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
