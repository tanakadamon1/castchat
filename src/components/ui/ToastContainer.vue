<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-50 flex flex-col space-y-4 pointer-events-none sm:max-w-sm max-w-[calc(100vw-2rem)]"
    >
      <BaseToast
        v-for="toastItem in toasts"
        :key="toastItem.id"
        :show="true"
        :type="toastItem.type"
        :title="toastItem.title"
        :message="toastItem.message"
        :closable="toastItem.closable"
        :duration="0"
        class="pointer-events-auto"
        @close="remove(toastItem.id)"
      />
    </div>
  </Teleport>
</template>

<script lang="ts">
export default {
  name: 'ToastContainer'
}
</script>

<script setup lang="ts">
import BaseToast from './BaseToast.vue'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>