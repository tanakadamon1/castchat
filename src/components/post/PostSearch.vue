<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        v-model="searchQuery"
        type="text"
        placeholder="募集内容を検索..."
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        @input="handleSearchInput"
        @keydown.enter="handleSearch"
      />
      
      <button
        v-if="searchQuery"
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="clearSearch"
      >
        <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Quick Filters -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="filter in quickFilters"
        :key="filter.key"
        type="button"
        :class="quickFilterClasses(filter)"
        @click="toggleQuickFilter(filter)"
      >
        {{ filter.label }}
      </button>
    </div>
    
    <!-- Advanced Filters Toggle -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        @click="showAdvanced = !showAdvanced"
      >
        <svg
          class="w-4 h-4 mr-1 transition-transform duration-200"
          :class="{ 'rotate-180': showAdvanced }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        詳細フィルター
      </button>
      
      <div
        v-if="hasActiveFilters"
        class="text-sm text-gray-600 dark:text-gray-400"
      >
        {{ activeFiltersCount }} 個のフィルターが適用中
        <button
          type="button"
          class="ml-2 text-indigo-600 hover:text-indigo-500"
          @click="clearAllFilters"
        >
          クリア
        </button>
      </div>
    </div>
    
    <!-- Advanced Filters -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showAdvanced"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <BaseSelect
          v-model="filters.category"
          label="カテゴリ"
          placeholder="すべて"
          :options="categoryOptions"
          @change="handleFilterChange"
        />
        
        <!-- 募集タイプは現在使用されていないため非表示
        <BaseSelect
          v-model="filters.type"
          label="募集タイプ"
          placeholder="すべて"
          :options="typeOptions"
          @change="handleFilterChange"
        />
        -->
        
        <BaseSelect
          v-model="filters.status"
          label="ステータス"
          placeholder="すべて"
          :options="statusOptions"
          @change="handleFilterChange"
        />
        
        <BaseSelect
          v-model="filters.sortBy"
          label="並び順"
          :options="sortOptions"
          @change="handleFilterChange"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PostFilter } from '@/types/post'
import BaseSelect from '@/components/ui/BaseSelect.vue'

interface Props {
  modelValue: PostFilter
}

interface Emits {
  (e: 'update:modelValue', filters: PostFilter): void
  (e: 'search'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref(props.modelValue.search || '')
const showAdvanced = ref(false)
let searchTimeout: NodeJS.Timeout | null = null

const filters = ref<PostFilter>({
  ...props.modelValue
})

// Quick filter options
const quickFilters = ref([
  { key: 'customer-service', label: '接客', type: 'category', value: 'customer-service' },
  { key: 'meetings', label: '集会', type: 'category', value: 'meetings' },
  { key: 'music-dance', label: '音楽・ダンス', type: 'category', value: 'music-dance' },
  { key: 'games', label: 'ゲーム', type: 'category', value: 'games' },
  { key: 'deadline_soon', label: '締切間近', type: 'special', value: 'deadline_soon' }
])

// Select options
const categoryOptions = [
  { label: 'すべて', value: '' },
  { label: '接客', value: 'customer-service' },
  { label: '集会', value: 'meetings' },
  { label: '音楽・ダンス', value: 'music-dance' },
  { label: '出会い', value: 'social' },
  { label: '初心者', value: 'beginners' },
  { label: 'ロールプレイ', value: 'roleplay' },
  { label: 'ゲーム', value: 'games' },
  { label: 'その他', value: 'other' }
]

const typeOptions = [
  { label: 'すべて', value: '' }
  // 募集タイプは現在使用されていないため、オプションを削除
]

const statusOptions = [
  { label: 'すべて', value: '' },
  { label: '募集中', value: 'active' },
  { label: '募集終了', value: 'closed' }
]

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '締切順', value: 'deadline' },
  { label: '人気順', value: 'popular' }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return Boolean(
    filters.value.category ||
    filters.value.type ||
    filters.value.status ||
    searchQuery.value
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.category) count++
  if (filters.value.type) count++
  if (filters.value.status) count++
  if (searchQuery.value) count++
  return count
})

const quickFilterClasses = (filter: any) => {
  const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-full border transition-colors duration-200'
  const isActive = isQuickFilterActive(filter)
  
  if (isActive) {
    return `${baseClasses} bg-indigo-600 text-white border-indigo-600`
  }
  
  return `${baseClasses} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`
}

// Methods
const isQuickFilterActive = (filter: any) => {
  if (filter.type === 'type') {
    return filters.value.type === filter.value
  }
  if (filter.type === 'category') {
    return filters.value.category === filter.value
  }
  if (filter.type === 'special') {
    // Handle special filters like deadline_soon
    return false // TODO: Implement special filter logic
  }
  return false
}

const toggleQuickFilter = (filter: any) => {
  if (filter.type === 'type') {
    filters.value.type = filters.value.type === filter.value ? undefined : filter.value
  } else if (filter.type === 'category') {
    filters.value.category = filters.value.category === filter.value ? undefined : filter.value
  }
  
  handleFilterChange()
}

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    filters.value.search = searchQuery.value
    handleFilterChange()
  }, 300)
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  filters.value.search = searchQuery.value
  emit('search')
}

const clearSearch = () => {
  searchQuery.value = ''
  filters.value.search = undefined
  handleFilterChange()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filters.value = {
    sortBy: filters.value.sortBy || 'newest'
  }
  handleFilterChange()
}

const handleFilterChange = () => {
  emit('update:modelValue', { ...filters.value })
  emit('search')
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  filters.value = { ...newValue }
  searchQuery.value = newValue.search || ''
}, { deep: true })
</script>