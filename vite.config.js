import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },

      manifest: {
        name: 'Stop Scout',
        short_name: 'StopScout',
        description: 'Odjazdy ZTM Gdańsk na żywo, z trybem offline',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',

        // One scalable SVG instead of a pair of PNGs. App stores will need
        // 192 and 512 px rasters on top of this.
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            // Departures change constantly, so the network wins and the
            // cache is only a 5 minute safety net.
            urlPattern: ({ url }) => url.pathname.includes('departures'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'departures-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              }
            }
          },

          {
            // The stop list changes once a day, so serve it from cache
            // and refresh after 24 hours.
            urlPattern: ({ url }) => url.pathname.includes('stops'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'stops-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ],

  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js']
  }
})
