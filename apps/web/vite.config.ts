import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  console.log('Vite mode in defineConfig:', mode);
  const isE2EHarness = mode === 'e2e-harness'
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
        manifest: {
          name: 'Harmoniq',
          short_name: 'Harmoniq',
          description: 'Choir management and song library',
          theme_color: '#18005F',
          background_color: '#F4F2F5',
          display: 'standalone',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              // Firebase Storage images (album art, chord charts)
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'firebase-storage-assets',
                expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Spotify / external album art CDNs
              urlPattern: /^https:\/\/i\.scdn\.co\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'spotify-images',
                expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Google Fonts
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@harmoniq/shared': path.resolve(__dirname, '../../packages/shared/src'),
        ...(isE2EHarness ? {
          '@/lib/songs': path.resolve(__dirname, './e2e/test-utils.ts'),
          // Alias individual firebase modules to our mock
          'firebase/app': path.resolve(__dirname, './e2e/mock-firebase.ts'),
          'firebase/auth': path.resolve(__dirname, './e2e/mock-firebase.ts'),
          'firebase/firestore': path.resolve(__dirname, './e2e/mock-firebase.ts'),
          'firebase/storage': path.resolve(__dirname, './e2e/mock-firebase.ts'),
          'firebase/functions': path.resolve(__dirname, './e2e/mock-firebase.ts'),
        } : {})
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase-core': ['firebase/app', 'firebase/auth'],
            'firebase-data': ['firebase/firestore', 'firebase/storage', 'firebase/functions'],
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          },
        },
      },
    },
  }
})
