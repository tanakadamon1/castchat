<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" :aria-labelledby="title ? 'modal-title' : undefined" @click="handleBackdropClick">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <!-- Modal container -->
        <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            @after-enter="emit('opened')"
          >
            <div v-if="show" :class="modalClasses" @click.stop role="document">
              <!-- Header -->
              <div
                v-if="title || $slots.header || showClose"
                class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600"
              >
                <div class="flex-1">
                  <slot name="header">
                    <h3 v-if="title" id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {{ title }}
                    </h3>
                  </slot>
                </div>

                <button
                  v-if="showClose"
                  type="button"
                  class="ml-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="モーダルを閉じる"
                  @click="$emit('close')"
                >
                  <span class="sr-only">閉じる</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div :class="bodyClasses">
                <slot />
              </div>

              <!-- Footer -->
              <div
                v-if="$slots.footer"
                class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              >
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
export default {
  name: 'BaseModal'
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  showClose?: boolean
  persistent?: boolean
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  showClose: true,
  persistent: false,
  padding: true,
})

const emit = defineEmits<{
  close: []
  opened: []
}>()

const modalClasses = computed(() => {
  const baseClasses = ['relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all']

  const sizeClasses = {
    sm: 'max-w-sm w-full mx-4 sm:mx-auto',
    md: 'max-w-md w-full mx-4 sm:mx-auto',
    lg: 'max-w-lg w-full mx-4 sm:mx-auto',
    xl: 'max-w-4xl w-full mx-4 sm:mx-auto',
    full: 'max-w-7xl w-full mx-4',
  }

  return [...baseClasses, sizeClasses[props.size]].join(' ')
})

const bodyClasses = computed(() => {
  return props.padding ? 'p-4' : ''
})

const handleBackdropClick = () => {
  if (props.closable && !props.persistent) {
    emit('close')
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show && props.closable) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  if (props.show) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>
