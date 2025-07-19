<template>
  <article
    :class="[
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex flex-col h-full cursor-pointer',
      post.isPriority ? 'border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-900' : 'border-gray-200 dark:border-gray-700'
    ]"
    :aria-label="`${post.title}の募集投稿`"
    data-post-card
    tabindex="0"
    role="article"
    @keydown="handleKeyDown"
    @click="handleCardClick"
  >
    <!-- Main Content -->
    <div class="flex-grow">
      <!-- Header -->
      <div class="p-4 pb-0">
        <div class="flex items-start justify-between mb-3 gap-2">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ post.authorName }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(post.createdAt) }}</p>
          </div>
          
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <!-- Priority Badge -->
            <span
              v-if="post.isPriority"
              class="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 whitespace-nowrap"
            >
              <svg class="w-3 h-3 mr-0.5 hidden sm:inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="hidden sm:inline">優先</span>
              <span class="sm:hidden">★</span>
            </span>
            
            <span :class="[statusBadgeClasses, 'inline-flex items-center justify-center whitespace-nowrap text-xs px-1.5 py-0.5']">
              <span class="hidden sm:inline">{{ statusLabels[post.status] }}</span>
              <span class="sm:hidden">{{ post.status === 'active' ? '募集中' : statusLabels[post.status] }}</span>
            </span>
          </div>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {{ post.title }}
        </h3>
      </div>
      
      <!-- Description Section with fixed height -->
      <div class="px-4 pb-3">
        <p class="text-gray-600 dark:text-gray-300 text-sm h-[3.75rem] line-clamp-3 whitespace-pre-wrap">
          {{ post.description }}
        </p>
      </div>
      
      <!-- Image Section with aspect ratio -->
      <div class="px-4 pb-3">
        <div v-if="post.images && post.images.length > 0">
          <div class="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800" @click.stop="$emit('view-image', post.images[0], 0)">
            <LazyImage
              :src="post.images[0]"
              :alt="`投稿画像 1`"
              container-class="w-full aspect-video"
              image-class="w-full h-full object-contain"
              :eager="true"
              :threshold="0.2"
            />
            
            <!-- 複数画像がある場合の表示 -->
            <div
              v-if="post.images.length > 1"
              class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full"
            >
              {{ post.images.length }}枚
            </div>
          </div>
        </div>
        <div v-else class="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <!-- Details -->
      <div class="px-4 pb-3 space-y-2">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.998 1.998 0 013 12V7a2 2 0 012-2z" />
          </svg>
          {{ categoryLabels[post.category] }}
        </div>
        
        <div
          v-if="post.eventFrequency"
          class="flex items-center text-sm text-blue-600 dark:text-blue-400"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatEventTime(post) }}
        </div>
        
        <div
          v-if="post.deadline"
          class="flex items-center text-sm text-red-600 dark:text-red-400"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          締切: {{ formatDate(post.deadline) }}
        </div>
        
        <div
          v-if="post.worldName"
          class="flex items-center text-sm text-blue-600 dark:text-blue-400"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
          {{ post.worldName }}
        </div>
      </div>
      
      <!-- Tags -->
      <div
        v-if="post.tags && post.tags.length > 0"
        class="px-4 pb-3"
      >
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in post.tags.slice(0, 4)"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            #{{ tag }}
          </span>
          <span
            v-if="post.tags.length > 4"
            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            +{{ post.tags.length - 4 }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ post.applicationsCount }} 応募
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- 編集・削除ボタン（投稿者のみ） -->
          <div v-if="isAuthor" class="flex items-center space-x-1">
            <!-- ステータス変更ボタン -->
            <BaseButton
              v-if="post.status === 'closed' && post.status !== 'draft'"
              size="sm"
              variant="ghost"
              @click.stop="$emit('toggle-status', post.id, 'active')"
              :aria-label="`${post.title}の募集を再開する`"
              class="text-green-600 hover:text-green-700"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </BaseButton>
            <BaseButton
              v-if="post.status === 'active'"
              size="sm"
              variant="ghost"
              @click.stop="$emit('toggle-status', post.id, 'closed')"
              :aria-label="`${post.title}の募集を終了する`"
              class="text-red-600 hover:text-red-700"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </BaseButton>
            
            <!-- Priority Button -->
            <BaseButton
              v-if="!post.isPriority"
              size="sm"
              variant="ghost"
              @click.stop="$emit('promote-post', post.id)"
              :aria-label="`${post.title}を優先表示に設定。優先表示にすると上位に表示されます。`"
              class="text-yellow-600 hover:text-yellow-700"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </BaseButton>
            
            <BaseButton
              size="sm"
              variant="ghost"
              @click.stop="handleEditClick"
              :aria-label="`${post.title}を編集する。編集ページに移動します。`"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </BaseButton>
            <BaseButton
              size="sm"
              variant="ghost"
              @click.stop="$emit('delete-post', post.id)"
              :aria-label="`${post.title}を削除する。この操作は元に戻すことができません。`"
              class="text-red-600 hover:text-red-700"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </BaseButton>
          </div>
          
          <BaseButton
            size="sm"
            variant="outline"
            @click.stop="$emit('view-details', post.id)"
            :aria-label="`${post.title}の詳細ページを開く。募集内容の詳細や応募方法が確認できます。`"
          >
            詳細を見る
          </BaseButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
export default {
  name: 'PostCard'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/types/post'
import { categoryLabels, statusLabels, eventFrequencyLabels, weekdayLabels, weekOfMonthLabels } from '@/utils/constants'
import BaseButton from '@/components/ui/BaseButton.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  post: Post
}

interface Emits {
  (e: 'view-details', postId: string): void
  (e: 'view-image', imageUrl: string, index: number): void
  (e: 'edit-post', postId: string): void
  (e: 'delete-post', postId: string): void
  (e: 'promote-post', postId: string): void
  (e: 'toggle-status', postId: string, newStatus: 'active' | 'closed'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const authStore = useAuthStore()

// 投稿者かどうかの判定
const isAuthor = computed(() => {
  return authStore.user?.id === props.post.authorId
})

// キーボードイベント処理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('view-details', props.post.id)
  }
}

// カードクリック処理（ボタンクリック時は除外）
const handleCardClick = (event: MouseEvent) => {
  // ボタンやリンクをクリックした場合は詳細遷移しない
  const target = event.target as HTMLElement
  if (target.closest('button') || target.closest('a')) {
    return
  }
  emit('view-details', props.post.id)
}

// 編集ボタンクリック処理
const handleEditClick = () => {
  emit('edit-post', props.post.id)
}


const statusBadgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  const variants = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    closed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    draft: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  }
  
  return `${baseClasses} ${variants[props.post.status]}`
})


const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatEventTime = (post: Post) => {
  if (post.eventFrequency === 'once' && post.eventSpecificDate) {
    const date = new Date(post.eventSpecificDate)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (post.eventFrequency && post.eventWeekday !== undefined && post.eventTime) {
    const weekday = weekdayLabels[post.eventWeekday as keyof typeof weekdayLabels]
    const time = post.eventTime
    
    if (post.eventFrequency === 'monthly' && post.eventWeekOfMonth) {
      const weekOfMonth = weekOfMonthLabels[post.eventWeekOfMonth as keyof typeof weekOfMonthLabels]
      return `毎月${weekOfMonth}${weekday} ${time}`
    } else if (post.eventFrequency === 'biweekly' && post.eventWeekOfMonth) {
      const pattern = post.eventWeekOfMonth === 1 ? '第1・第3' : '第2・第4'
      return `${pattern}${weekday} ${time}`
    } else if (post.eventFrequency === 'weekly') {
      return `毎週${weekday} ${time}`
    }
  }
  
  return eventFrequencyLabels[post.eventFrequency as keyof typeof eventFrequencyLabels] || ''
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>