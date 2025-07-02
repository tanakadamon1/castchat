<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    
    <main class="flex-1">
      <RouterView />
    </main>
    
    <AppFooter />
  </div>
</template>
