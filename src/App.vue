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

onMounted(() => {
  authStore.initialize()
  themeStore.initialize()
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
