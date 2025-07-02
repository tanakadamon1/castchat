<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700"
      :class="{ 'text-red-600': error }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <select
        :id="selectId"
        v-model="computedValue"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @change="handleChange"
      >
        <option
          v-if="placeholder"
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          class="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    
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
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

type Option = string | number | { label: string; value: string | number }

interface Props {
  modelValue?: string | number
  options: Option[]
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'change', value: string | number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectId = useId()

const computedValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value)
})

const selectClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900',
    'ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600',
    'sm:text-sm sm:leading-6 transition-colors duration-200 appearance-none bg-white'
  ]
  
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
    stateClasses[state]
  ].join(' ')
})

const getOptionValue = (option: Option): string | number => {
  return typeof option === 'object' ? option.value : option
}

const getOptionLabel = (option: Option): string => {
  return typeof option === 'object' ? option.label : String(option)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('change', value)
}
</script>