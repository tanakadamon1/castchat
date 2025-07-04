<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test Page</h1>
    <p>If you can see this, the app is working!</p>
    <BaseButton @click="handleClick">Click Me</BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

const handleClick = () => {
  alert('Button clicked!')
}
</script>