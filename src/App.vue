<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useAuthStore } from './stores/auth'
import useDarkModeWithInit from './composables/useDarkMode'

const authStore = useAuthStore()
const darkMode = useDarkModeWithInit()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div 
    class="min-h-screen flex flex-col transition-colors duration-200" 
    :class="{ 'dark': darkMode.isDarkMode.value }"
    :style="darkMode.cssVariables.value"
  >
    <AppHeader />
    
    <main class="flex-1 bg-gray-50 dark:bg-gray-900">
      <RouterView />
    </main>
    
    <AppFooter />
    
    <ToastContainer />
  </div>
</template>
