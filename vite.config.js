import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Precache all app shell assets + images
        // JSON data is statically bundled into JS chunks, so it's covered by js/css/html
        // Note: excludes source-japan.jpg (build artifact, not deployed as-is)
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2}', 'images/japan-hero-*.jpg'],
        // Runtime caching: CARTO map tiles (StaleWhileRevalidate with size cap)
        // CARTO URL format: https://{a|b|c}.basemaps.cartocdn.com/...
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Japan Trip Guide',
        short_name: 'Japan 2026',
        description: '10-day Japan itinerary guide — Fukuoka, Osaka, Kyoto, Tokyo',
        theme_color: '#C73E3A',
        background_color: '#F8F7F4',
        display: 'standalone',
        start_url: '/today',
        scope: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
})
