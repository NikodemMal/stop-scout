import { defineConfig } from 'vite'
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
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',

        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('departures'),

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
            urlPattern: ({ url }) =>
              url.pathname.includes('stops'),

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
  ]
})