import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// デバッグユーティリティをインポート（開発環境のみ）
if (import.meta.env.DEV) {
  import('./utils/debug')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
