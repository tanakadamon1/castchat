<template>
  <div :class="containerClasses">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
        <svg
          class="w-6 h-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="type === 'search'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <path
            v-else-if="type === 'posts'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      
      <h3 class="mt-4 text-lg font-medium text-gray-900">
        {{ title }}
      </h3>
      
      <p class="mt-2 text-sm text-gray-600 max-w-md mx-auto">
        {{ message }}
      </p>
      
      <div
        v-if="actionText || $slots.actions"
        class="mt-6"
      >
        <slot name="actions">
          <BaseButton
            v-if="actionText"
            @click="$emit('action')"
          >
            {{ actionText }}
          </BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

interface Props {
  type?: 'general' | 'search' | 'posts' | 'applications'
  title?: string
  message?: string
  actionText?: string
  fullHeight?: boolean
}

interface Emits {
  (e: 'action'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  fullHeight: false
})

defineEmits<Emits>()

const containerClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center'
  
  if (props.fullHeight) {
    return `${baseClasses} min-h-[400px]`
  }
  
  return `${baseClasses} py-12`
})

const title = computed(() => {
  if (props.title) return props.title
  
  const titles = {
    general: 'データがありません',
    search: '検索結果が見つかりませんでした',
    posts: '募集投稿がありません',
    applications: '応募がありません'
  }
  
  return titles[props.type]
})

const message = computed(() => {
  if (props.message) return props.message
  
  const messages = {
    general: '現在表示できるデータがありません。',
    search: '別のキーワードで検索するか、フィルター条件を変更してみてください。',
    posts: '現在募集中の投稿がありません。新しい募集を投稿してみませんか？',
    applications: 'まだ応募がありません。もう少しお待ちください。'
  }
  
  return messages[props.type]
})
</script>