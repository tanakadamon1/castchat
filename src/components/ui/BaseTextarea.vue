<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="textareaId"
      class="block text-sm font-medium text-gray-700"
      :class="{ 'text-red-600': error }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <textarea
        :id="textareaId"
        v-model="computedValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :maxlength="maxlength"
        :class="textareaClasses"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @input="handleInput"
      />
    </div>
    
    <div class="flex justify-between">
      <div>
        <p
          v-if="error"
          class="text-sm text-red-600"
        >
          {{ error }}
        </p>
        
        <p
          v-else-if="hint"
          class="text-sm text-gray-500"
        >
          {{ hint }}
        </p>
      </div>
      
      <div
        v-if="maxlength && showCount"
        class="text-xs text-gray-500"
      >
        {{ (computedValue?.toString().length || 0) }}/{{ maxlength }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxlength?: number
  showCount?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  resize: 'vertical',
  showCount: false
})

const emit = defineEmits<Emits>()

const textareaId = useId()

const computedValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value)
})

const textareaClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset',
    'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600',
    'sm:text-sm sm:leading-6 transition-colors duration-200'
  ]
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }
  
  const stateClasses = {
    default: 'ring-gray-300 hover:ring-gray-400',
    error: 'ring-red-300 hover:ring-red-400 focus:ring-red-600',
    disabled: 'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed'
  }
  
  let state: keyof typeof stateClasses = 'default'
  if (props.disabled) state = 'disabled'
  else if (props.error) state = 'error'
  
  return [
    ...baseClasses,
    resizeClasses[props.resize],
    stateClasses[state]
  ].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('input', target.value)
}
</script>