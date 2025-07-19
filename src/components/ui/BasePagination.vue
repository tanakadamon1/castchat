<template>
  <nav
    class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6"
    aria-label="Pagination"
  >
    <!-- Mobile view -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        :disabled="currentPage <= 1"
        :class="mobileButtonClasses(currentPage <= 1)"
        @click="goToPage(currentPage - 1)"
      >
        前へ
      </button>
      
      <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
        {{ currentPage }} / {{ totalPages }}
      </div>
      
      <button
        :disabled="currentPage >= totalPages"
        :class="mobileButtonClasses(currentPage >= totalPages)"
        @click="goToPage(currentPage + 1)"
      >
        次へ
      </button>
    </div>
    
    <!-- Desktop view -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          <span class="font-medium">{{ startItem }}</span>
          -
          <span class="font-medium">{{ endItem }}</span>
          件表示 (全
          <span class="font-medium">{{ total }}</span>
          件中)
        </p>
      </div>
      
      <div>
        <nav
          class="isolate inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <!-- Previous button -->
          <button
            :disabled="currentPage <= 1"
            :class="desktopButtonClasses('prev', currentPage <= 1)"
            @click="goToPage(currentPage - 1)"
          >
            <span class="sr-only">前のページ</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              :class="desktopButtonClasses('page', false, page === currentPage)"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0"
            >
              ...
            </span>
          </template>
          
          <!-- Next button -->
          <button
            :disabled="currentPage >= totalPages"
            :class="desktopButtonClasses('next', currentPage >= totalPages)"
            @click="goToPage(currentPage + 1)"
          >
            <span class="sr-only">次のページ</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
export default {
  name: 'BasePagination'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  perPage: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 7
  
  if (props.totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (props.currentPage <= 4) {
      // Show pages 2-5 and ellipsis
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
    } else if (props.currentPage >= props.totalPages - 3) {
      // Show ellipsis and last 4 pages
      pages.push('...')
      for (let i = props.totalPages - 3; i <= props.totalPages - 1; i++) {
        pages.push(i)
      }
    } else {
      // Show ellipsis, current page area, and ellipsis
      pages.push('...')
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
    }
    
    // Always show last page
    if (props.totalPages > 1) {
      pages.push(props.totalPages)
    }
  }
  
  return pages
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const mobileButtonClasses = (disabled: boolean) => {
  const baseClasses = 'relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium'
  
  if (disabled) {
    return `${baseClasses} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed`
  }
  
  return `${baseClasses} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
}

const desktopButtonClasses = (type: 'prev' | 'next' | 'page', disabled = false, active = false) => {
  const baseClasses = 'relative inline-flex items-center text-sm font-medium focus:z-10 focus:outline-offset-0'
  
  if (type === 'prev') {
    const prevClasses = 'rounded-l-md px-2 py-2'
    if (disabled) {
      return `${baseClasses} ${prevClasses} text-gray-300 dark:text-gray-600 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 cursor-not-allowed`
    }
    return `${baseClasses} ${prevClasses} text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500`
  }
  
  if (type === 'next') {
    const nextClasses = 'rounded-r-md px-2 py-2'
    if (disabled) {
      return `${baseClasses} ${nextClasses} text-gray-300 dark:text-gray-600 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 cursor-not-allowed`
    }
    return `${baseClasses} ${nextClasses} text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500`
  }
  
  // Page button
  const pageClasses = 'px-4 py-2'
  if (active) {
    return `${baseClasses} ${pageClasses} z-10 bg-indigo-600 dark:bg-indigo-500 text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500`
  }
  
  return `${baseClasses} ${pageClasses} text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500`
}
</script>