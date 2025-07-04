<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="show"
      :class="toastClasses"
      role="alert"
    >
      <div class="flex items-start">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <component
            :is="iconComponent"
            class="h-5 w-5"
            :class="iconClasses"
          />
        </div>
        
        <!-- Content -->
        <div class="ml-3 flex-1">
          <h4
            v-if="title"
            :class="titleClasses"
          >
            {{ title }}
          </h4>
          
          <div
            v-if="message || $slots.default"
            :class="messageClasses"
          >
            <slot>{{ message }}</slot>
          </div>
        </div>
        
        <!-- Close button -->
        <div
          v-if="closable"
          class="ml-4 flex-shrink-0 flex"
        >
          <button
            type="button"
            :class="closeButtonClasses"
            @click="$emit('close')"
          >
            <span class="sr-only">閉じる</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, markRaw } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-vue-next'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message?: string
  closable?: boolean
  duration?: number
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  closable: true,
  duration: 0
})

const emit = defineEmits<Emits>()

let timeoutId: NodeJS.Timeout | null = null

const toastClasses = computed(() => {
  const baseClasses = [
    'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5'
  ]
  
  const typeClasses = {
    success: 'border-l-4 border-green-400',
    error: 'border-l-4 border-red-400',
    warning: 'border-l-4 border-yellow-400',
    info: 'border-l-4 border-blue-400'
  }
  
  return [
    ...baseClasses,
    typeClasses[props.type],
    'p-4'
  ].join(' ')
})

const iconComponent = computed(() => {
  const icons = {
    success: markRaw(CheckCircle),
    error: markRaw(XCircle),
    warning: markRaw(AlertTriangle),
    info: markRaw(Info)
  }
  
  return icons[props.type]
})

const iconClasses = computed(() => {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  
  return classes[props.type]
})

const titleClasses = computed(() => {
  return 'text-sm font-medium text-gray-900'
})

const messageClasses = computed(() => {
  const baseClasses = 'text-sm text-gray-500'
  return props.title ? `mt-1 ${baseClasses}` : baseClasses
})

const closeButtonClasses = computed(() => {
  return [
    'inline-flex rounded-md text-gray-400 hover:text-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
  ].join(' ')
})

const startAutoClose = () => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      emit('close')
    }, props.duration)
  }
}

const clearAutoClose = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

onMounted(() => {
  if (props.show) {
    startAutoClose()
  }
})

onUnmounted(() => {
  clearAutoClose()
})
</script>