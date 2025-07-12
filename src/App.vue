<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()

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
  <div class="min-h-screen flex flex-col transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
    <AppHeader />
    
    <main class="flex-1 bg-gray-50 dark:bg-gray-900">
      <RouterView />
    </main>
    
    <AppFooter />
    
    <ToastContainer />
  </div>
</template>
