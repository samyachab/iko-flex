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
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo-wordmark.png'],
      manifest: {
        name: 'Iko Flex',
        short_name: 'Iko Flex',
        description: 'Routines mobilité & renfo pour athlète 800m — zéro friction.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121212',
        theme_color: '#121212',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        // Hors ligne d'office : la voix par défaut (Vivienne). Les autres voix se mettent en cache en les utilisant.
        globIgnores: ['voice/remy/**', 'voice/denise/**', 'voice/henri/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Polices Google mises en cache : l'app reste belle hors ligne
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/voice/'),
            handler: 'CacheFirst',
            options: { cacheName: 'voice-clips', expiration: { maxEntries: 1200 } },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
