import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'

try {
  const app = createApp(App)
  const head = createHead()

  app.use(createPinia())
  app.use(router)
  app.use(head)

  // グローバルエラーハンドラー
  app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err)
    console.error('Error info:', info)
    console.error('Component instance:', instance)
  }

  app.mount('#app')
} catch (error) {
  console.error('Failed to initialize app:', error)
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
  console.error('Environment:', {
    NODE_ENV: import.meta.env.MODE,
    BASE_URL: import.meta.env.BASE_URL,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV
  })
  
  // エラー画面を表示
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
        <div style="text-align: center; padding: 2rem; max-width: 600px;">
          <h1 style="font-size: 1.5rem; font-weight: bold; color: #111827; margin-bottom: 0.5rem;">castChat</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">アプリケーションの読み込み中にエラーが発生しました。</p>
          <div style="background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: left; font-size: 0.875rem;">
            <strong>エラー詳細:</strong><br>
            ${error instanceof Error ? error.message : String(error)}<br>
            ${error instanceof Error && error.stack ? `<br><pre style="white-space: pre-wrap; font-size: 0.75rem; overflow-x: auto;">${error.stack}</pre>` : ''}
          </div>
          <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer;">
            ページを再読み込み
          </button>
        </div>
      </div>
    `
  }
}
