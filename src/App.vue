<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import AnimatedBackground from './components/ui/AnimatedBackground.vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { config } from './config/env'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// Debug: Log config values on app start
declare global {
  interface Window {
    appConfig: typeof config
  }
}

window.appConfig = config
console.error('App Config Debug:', {
  squareApplicationId: config.squareApplicationId,
  squareLocationId: config.squareLocationId,
  squareEnvironment: config.squareEnvironment,
  enablePremium: config.enablePremium,
  appName: config.appName,
  appVersion: config.appVersion
})

// Debug: Check raw env vars
console.error('Raw ENV vars:', {
  VITE_SQUARE_APPLICATION_ID: import.meta.env.VITE_SQUARE_APPLICATION_ID,
  VITE_SQUARE_LOCATION_ID: import.meta.env.VITE_SQUARE_LOCATION_ID,
  VITE_SQUARE_ENVIRONMENT: import.meta.env.VITE_SQUARE_ENVIRONMENT,
  VITE_ENABLE_PREMIUM: import.meta.env.VITE_ENABLE_PREMIUM,
  MODE: import.meta.env.MODE
})

onMounted(async () => {
  try {
    // URLパラメータをチェックして強制リセット
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('reset') === 'true') {
      await authStore.forceSignOut()
      // URLからresetパラメータを削除
      urlParams.delete('reset')
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
      window.history.replaceState({}, '', newUrl)
    }
    
    await authStore.initialize()
    themeStore.initialize()
  } catch (error) {
    console.error('App.vue: Initialization error:', error)
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-200 relative">
    <!-- アニメーション背景 -->
    <AnimatedBackground />
    
    <AppHeader class="relative z-20" />
    
    <main class="flex-1 relative z-20">
      <RouterView />
    </main>
    
    <AppFooter class="relative z-20" />
    
    <ToastContainer />
  </div>
</template>
