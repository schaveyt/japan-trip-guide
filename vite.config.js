import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      // In dev, proxy /api calls to wrangler dev running on port 8787
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2}', 'images/japan-hero-*.jpg'],
        // Prevent the SPA shell (index.html) from being served for /api/* requests
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // Photo bytes are immutable per ID — safe to cache aggressively
          {
            urlPattern: /^\/api\/photos\/[^/]+\/bytes$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'photo-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          // Google Fonts stylesheet (fonts.googleapis.com)
          // StaleWhileRevalidate: serve cached CSS quickly, refresh in background
          // The stylesheet lists which font files to fetch — short TTL so updates propagate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts binaries (fonts.gstatic.com)
          // CacheFirst: font files are content-addressed (URL = specific version),
          // never change once fetched — safe to cache for up to 1 year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // CARTO map tiles (StaleWhileRevalidate with size cap)
          // CARTO URL format: https://{a|b|c}.basemaps.cartocdn.com/...
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
