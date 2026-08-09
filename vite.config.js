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
            // Stale-while-revalidate rather than cache-first: cache-first with
            // an expiry treats an aged entry as a miss and falls through to the
            // network, so the stop list stopped working offline after a day.
            // This serves the cached copy immediately and refreshes it in the
            // background whenever the network is there.
            urlPattern: ({ url }) => url.pathname.includes('stops'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'stops-cache',
              expiration: { maxEntries: 1 }
            }
          }
        ]
        // Departures are deliberately not cached here. The service worker
        // would answer an offline request with ok: true from its own cache,
        // and fetchDepartures would report minutes-old times as live. The
        // app caches them in IndexedDB instead, where it can label them.
      }
    })
  ],

  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js']
  }
})
