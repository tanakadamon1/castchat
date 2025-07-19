<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <svg
        class="h-4 w-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </component>
</template>

<script lang="ts">
export default {
  name: 'BaseButton'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  tag?: 'button' | 'a' | 'router-link'
  type?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string | object
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  type: 'button'
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'relative inline-flex items-center justify-center rounded-md font-medium',
    'transition-colors duration-200 focus-visible:outline focus-visible:outline-2',
    'focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50'
  ]
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-3.5 py-2.5 text-sm',
    xl: 'px-4 py-3 text-base'
  }
  
  const variantClasses = {
    primary: [
      'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400',
      'focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500'
    ],
    secondary: [
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600',
      'hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500'
    ],
    outline: [
      'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300',
      'hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500'
    ],
    ghost: [
      'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      'focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500'
    ],
    danger: [
      'bg-red-600 dark:bg-red-500 text-white shadow-sm hover:bg-red-500 dark:hover:bg-red-400',
      'focus-visible:outline-red-600 dark:focus-visible:outline-red-500'
    ]
  }
  
  const widthClasses = props.fullWidth ? 'w-full' : ''
  
  const allClasses = [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    widthClasses
  ]
  const filteredClasses = []
  for (let i = 0; i < allClasses.length; i++) {
    if (allClasses[i]) {
      filteredClasses.push(allClasses[i])
    }
  }
  return filteredClasses.join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>