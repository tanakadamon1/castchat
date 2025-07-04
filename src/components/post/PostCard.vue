<template>
  <article
    class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    :aria-label="`${post.title}の募集投稿`"
    data-post-card
    tabindex="0"
    role="article"
    @keydown="handleKeyDown"
  >
    <!-- Header -->
    <div class="p-4 pb-3">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3">
          <LazyImage
            :src="post.authorAvatar || '/default-avatar.png'"
            :alt="post.authorName"
            container-class="w-10 h-10 rounded-full"
            image-class="w-10 h-10 rounded-full object-cover"
            :eager="false"
          />
          <div>
            <p class="font-medium text-gray-900">{{ post.authorName }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <span :class="statusBadgeClasses">
            {{ statusLabels[post.status] }}
          </span>
          <span :class="typeBadgeClasses">
            {{ typeLabels[post.type] }}
          </span>
        </div>
      </div>
      
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ post.title }}
      </h3>
      
      <p class="text-gray-600 text-sm mb-3 line-clamp-3">
        {{ post.description }}
      </p>
      
      <!-- 画像プレビュー -->
      <div v-if="post.images && post.images.length > 0" class="mb-3">
        <div class="grid gap-2" :class="imageGridClasses">
          <div
            v-for="(image, index) in displayImages"
            :key="index"
            class="relative group cursor-pointer overflow-hidden rounded-lg"
            @click="$emit('view-image', image, index)"
          >
            <LazyImage
              :src="image"
              :alt="`投稿画像 ${index + 1}`"
              container-class="w-full h-32"
              image-class="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
              :eager="index === 0"
              :threshold="0.2"
            />
            
            <!-- 残り画像数表示 -->
            <div
              v-if="index === 2 && post.images!.length > 3"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold"
            >
              +{{ post.images!.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Details -->
    <div class="px-4 pb-3 space-y-2">
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.998 1.998 0 013 12V7a2 2 0 012-2z" />
        </svg>
        {{ categoryLabels[post.category] }}
      </div>
      
      <div
        v-if="post.payment"
        class="flex items-center text-sm text-green-600 font-medium"
      >
        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        {{ post.payment }}
      </div>
      
      <div
        v-if="post.deadline"
        class="flex items-center text-sm text-red-600"
      >
        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        締切: {{ formatDate(post.deadline) }}
      </div>
      
      <div
        v-if="post.worldName"
        class="flex items-center text-sm text-blue-600"
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
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
        >
          #{{ tag }}
        </span>
        <span
          v-if="post.tags.length > 4"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500"
        >
          +{{ post.tags.length - 4 }}
        </span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 text-sm text-gray-600">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ post.viewsCount }}
          </span>
          
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ post.applicationsCount }} 応募
          </span>
        </div>
        
        <BaseButton
          size="sm"
          variant="outline"
          @click="$emit('view-details', post.id)"
          :aria-label="`${post.title}の詳細を見る`"
        >
          詳細を見る
        </BaseButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/types/post'
import { categoryLabels, typeLabels, statusLabels } from '@/utils/mockData'
import { BaseButton } from '@/components/ui'
import LazyImage from '@/components/ui/LazyImage.vue'

interface Props {
  post: Post
}

interface Emits {
  (e: 'view-details', postId: string): void
  (e: 'view-image', imageUrl: string, index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// キーボードイベント処理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('view-details', props.post.id)
  }
}

// 画像グリッドのレイアウト
const imageGridClasses = computed(() => {
  const imageCount = props.post.images?.length || 0
  if (imageCount === 1) return 'grid-cols-1'
  if (imageCount === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

// 表示する画像（最大3枚）
const displayImages = computed(() => {
  return props.post.images?.slice(0, 3) || []
})

const statusBadgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  const variants = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800'
  }
  
  return `${baseClasses} ${variants[props.post.status]}`
})

const typeBadgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  const variants = {
    paid: 'bg-blue-100 text-blue-800',
    volunteer: 'bg-purple-100 text-purple-800',
    collaboration: 'bg-orange-100 text-orange-800'
  }
  
  return `${baseClasses} ${variants[props.post.type]}`
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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