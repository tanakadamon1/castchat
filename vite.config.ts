import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools' // Disabled due to version conflicts
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // vueDevTools(), // Temporarily disable due to WSL path issues
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // APIリクエストは常にネットワークから取得
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
        includeAssets: ['favicon.ico', 'icons/*.png'],
        manifestFilename: 'manifest.webmanifest',
        manifest: {
          name: 'castChat',
          short_name: 'castChat',
          description: 'VRChatコミュニティのためのキャスト募集・応募プラットフォーム',
          theme_color: '#6366f1',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: 'icons/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: 'icons/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:54321', // Supabase local
          'https://*.supabase.co',
          env.VITE_APP_URL || 'http://localhost:5173',
        ],
        credentials: true,
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      // パフォーマンス最適化
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vue関連のvendorチャンク
            if (
              id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')
            ) {
              return 'vue-vendor'
            }

            // UI関連のチャンク
            if (
              id.includes('node_modules/lucide-vue-next') ||
              id.includes('node_modules/@heroicons')
            ) {
              return 'ui-vendor'
            }

            // Supabase関連のチャンク
            if (id.includes('node_modules/@supabase')) {
              return 'supabase-vendor'
            }

            // その他のvendor
            if (id.includes('node_modules')) {
              return 'vendor'
            }

            // UIコンポーネントを個別にチャンク分割して循環依存を回避
            if (id.includes('/src/components/ui/BaseButton.vue')) {
              return 'ui-base-button'
            }

            if (id.includes('/src/components/ui/BaseModal.vue')) {
              return 'ui-base-modal'
            }

            if (
              id.includes('/src/components/ui/BaseInput.vue') ||
              id.includes('/src/components/ui/BaseTextarea.vue') ||
              id.includes('/src/components/ui/BaseSelect.vue') ||
              id.includes('/src/components/ui/BaseCheckbox.vue')
            ) {
              return 'ui-form-components'
            }

            if (
              id.includes('/src/components/ui/LoadingSpinner.vue') ||
              id.includes('/src/components/ui/ErrorState.vue') ||
              id.includes('/src/components/ui/EmptyState.vue')
            ) {
              return 'ui-state-components'
            }

            if (
              id.includes('/src/components/ui/ImageViewer.vue') ||
              id.includes('/src/components/ui/LazyImage.vue')
            ) {
              return 'ui-image-components'
            }

            if (
              id.includes('/src/components/ui/BaseToast.vue') ||
              id.includes('/src/components/ui/ToastContainer.vue')
            ) {
              return 'ui-toast-components'
            }

            if (
              id.includes('/src/components/ui/BasePagination.vue') ||
              id.includes('/src/components/ui/DarkModeToggle.vue') ||
              id.includes('/src/components/ui/SkeletonLoader.vue')
            ) {
              return 'ui-other-components'
            }

            if (id.includes('/src/components/message/')) {
              return 'message-components'
            }

            if (id.includes('/src/components/post/')) {
              return 'post-components'
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId && facadeModuleId.includes('src/views/')) {
              // ビューファイルに基づいた命名
              const name = facadeModuleId.split('/').pop()?.replace('.vue', '') || 'view'
              return `js/${name}-[hash].js`
            }
            return 'js/[name]-[hash].js'
          },
        },
        external: (id) => id.includes('workbox-'),
        onwarn(warning, warn) {
          // 循環依存関係の警告を抑制
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            return
          }
          warn(warning)
        },
      },
      // 圧縮オプション
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Temporarily enable for debugging
          drop_debugger: mode === 'production',
          pure_funcs: [],
          passes: 2, // 圧縮パスを增やしてサイズをさらに削減
        },
        mangle: {
          properties: {
            regex: /^_/,
          },
        },
        format: {
          comments: false,
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'lucide-vue-next', '@supabase/supabase-js'],
      exclude: ['workbox-window'],
    },
  }
})
