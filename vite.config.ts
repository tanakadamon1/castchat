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
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'VRChatキャスト募集掲示板',
          short_name: 'キャスト募集',
          description: 'VRChatでのキャスト募集・応募プラットフォーム',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
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
          env.VITE_APP_URL || 'http://localhost:5173'
        ],
        credentials: true
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vue関連のvendorチャンク
            if (id.includes('node_modules/vue') || 
                id.includes('node_modules/vue-router') || 
                id.includes('node_modules/pinia')) {
              return 'vue-vendor'
            }
            
            // UI関連のチャンク
            if (id.includes('node_modules/lucide-vue-next') ||
                id.includes('node_modules/@heroicons')) {
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
            
            // コンポーネント別チャンク
            if (id.includes('/src/components/ui/')) {
              return 'ui-components'
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
          }
        },
        external: id => id.includes('workbox-')
      },
      // 圧縮オプション
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia']
    }
  }
})
