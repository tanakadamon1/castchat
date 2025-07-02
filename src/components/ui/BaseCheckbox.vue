<template>
  <div class="flex items-start space-x-3">
    <div class="flex h-6 items-center">
      <input
        :id="checkboxId"
        v-model="computedValue"
        type="checkbox"
        :disabled="disabled"
        :required="required"
        :class="checkboxClasses"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @change="handleChange"
      />
    </div>
    
    <div class="flex-1 text-sm leading-6">
      <label
        v-if="label || $slots.default"
        :for="checkboxId"
        class="font-medium text-gray-900 cursor-pointer"
        :class="{ 'text-gray-500': disabled }"
      >
        <slot>{{ label }}</slot>
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <p
        v-if="description"
        class="text-gray-500"
        :class="{ 'text-gray-400': disabled }"
      >
        {{ description }}
      </p>
      
      <p
        v-if="error"
        class="text-red-600 text-sm mt-1"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<Emits>()

const checkboxId = useId()

const computedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const checkboxClasses = computed(() => {
  const baseClasses = [
    'h-4 w-4 rounded border-gray-300 text-indigo-600',
    'focus:ring-indigo-600 transition-colors duration-200'
  ]
  
  const stateClasses = {
    default: 'hover:border-gray-400',
    error: 'border-red-300 hover:border-red-400 focus:ring-red-600',
    disabled: 'text-gray-400 cursor-not-allowed'
  }
  
  let state: keyof typeof stateClasses = 'default'
  if (props.disabled) state = 'disabled'
  else if (props.error) state = 'error'
  
  return [
    ...baseClasses,
    stateClasses[state]
  ].join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.checked)
}
</script>