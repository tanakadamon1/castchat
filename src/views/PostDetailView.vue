<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="goBack"
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </BaseButton>
      </div>
      
      <!-- Loading State -->
      <LoadingSpinner
        v-if="loading"
        message="募集詳細を読み込んでいます..."
        size="lg"
      />
      
      <!-- Error State -->
      <ErrorState
        v-else-if="errorMessage"
        type="not-found"
        title="募集が見つかりませんでした"
        :message="errorMessage"
        @retry="loadPost"
      />
      
      <!-- Post Detail -->
      <div
        v-else-if="post"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="font-semibold text-gray-900">{{ post.authorName || '匿名' }}</h2>
              <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}に投稿</p>
            </div>
            
            <div class="flex items-center space-x-2">
              <span :class="statusBadgeClasses">
                {{ statusLabels[post.status] }}
              </span>
            </div>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.998 1.998 0 013 12V7a2 2 0 012-2z" />
              </svg>
              {{ categoryLabels[post.category] }}
            </div>
            
            
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ post.applicationsCount }} 件の応募
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6">
          <!-- Description -->
          <section class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">募集内容</h3>
            <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {{ post.description }}
            </div>
          </section>
          
          <!-- Images -->
          <section v-if="post.images && post.images.length > 0" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">関連画像</h3>
            <div class="grid gap-4" :class="imageGridClasses">
              <div
                v-for="(image, index) in post.images"
                :key="index"
                class="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                @click="openImageViewer(image, index)"
              >
                <LazyImage
                  :src="image"
                  :alt="`投稿画像 ${index + 1}`"
                  container-class="w-full h-64"
                  image-class="w-full h-64 object-cover transition-transform duration-200 group-hover:scale-105"
                  :eager="index === 0"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Details Grid -->
          <section class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">詳細情報</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Event Schedule -->
              <div
                v-if="post.eventFrequency"
                class="bg-blue-50 rounded-lg p-4"
              >
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="font-medium text-blue-900">開催日時</span>
                </div>
                <p class="text-blue-800">
                  {{ formatEventTime(post) }}
                </p>
              </div>
              
              <!-- Deadline -->
              <div
                v-if="post.deadline"
                class="bg-red-50 rounded-lg p-4"
              >
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-medium text-red-900">応募締切</span>
                </div>
                <p class="text-red-800">{{ formatDate(post.deadline) }}</p>
              </div>
              
              <!-- World -->
              <div
                v-if="post.worldName"
                class="bg-blue-50 rounded-lg p-4"
              >
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  <span class="font-medium text-blue-900">ワールド</span>
                </div>
                <p class="text-blue-800">{{ post.worldName }}</p>
              </div>
              
              <!-- Contact -->
              <div 
                v-if="post.contactMethod && post.contactValue"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="font-medium text-gray-900">連絡方法</span>
                </div>
                <p class="text-gray-700">
                  {{ contactMethodLabels[post.contactMethod] || post.contactMethod }}:
                  <a 
                    :href="getContactLink(post.contactMethod, post.contactValue)"
                    :target="post.contactMethod === 'discord' ? '_self' : '_blank'"
                    :rel="post.contactMethod === 'discord' ? '' : 'noopener noreferrer'"
                    class="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    {{ post.contactValue }}
                  </a>
                </p>
              </div>
            </div>
          </section>
          
          <!-- Requirements -->
          <section
            v-if="post.requirements && post.requirements.length > 0"
            class="mb-8"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-3">応募条件</h3>
            <ul class="space-y-2">
              <li
                v-for="(requirement, index) in post.requirements"
                :key="`requirement-${index}`"
                class="flex items-start"
              >
                <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-700">{{ requirement }}</span>
              </li>
            </ul>
          </section>
          
          <!-- Tags -->
          <section
            v-if="post.tags && post.tags.length > 0"
            class="mb-8"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-3">タグ</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in post.tags"
                :key="`tag-${index}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                #{{ tag }}
              </span>
            </div>
          </section>
        </div>
        
        <!-- Action Footer -->
        <div class="p-6 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row gap-4">
            <BaseButton
              v-if="post.status === 'active'"
              size="lg"
              class="flex-1"
              @click="handleApply"
            >
              この募集に応募する
            </BaseButton>
            
            <BaseButton
              v-else
              size="lg"
              variant="secondary"
              disabled
              class="flex-1"
            >
              募集は終了しました
            </BaseButton>
            
            <BaseButton
              variant="outline"
              size="lg"
              @click="sharePost"
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              シェア
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 応募モーダル -->
    <ApplicationModal
      v-if="showApplicationModal && post"
      :post="post"
      @close="showApplicationModal = false"
      @submit="handleApplicationSubmit"
    />
    
    <!-- 画像ビューア -->
    <ImageViewer
      :show="showImageViewer"
      :images="selectedImages"
      :initial-index="selectedImageIndex"
      @close="closeImageViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Post } from '@/types/post'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LazyImage from '@/components/ui/LazyImage.vue'
import ImageViewer from '@/components/ui/ImageViewer.vue'
import ApplicationModal from '@/components/application/ApplicationModal.vue'
import { postsApi } from '@/lib/postsApi'
import { categoryLabels, statusLabels, contactMethodLabels, eventFrequencyLabels, weekdayLabels, weekOfMonthLabels } from '@/utils/mockData'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const post = ref<Post | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const showApplicationModal = ref(false)
const showImageViewer = ref(false)
const selectedImages = ref<string[]>([])
const selectedImageIndex = ref(0)

// Computed
const statusBadgeClasses = computed(() => {
  if (!post.value) return ''
  
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
  
  const variants = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800'
  }
  
  return `${baseClasses} ${variants[post.value.status]}`
})

const imageGridClasses = computed(() => {
  if (!post.value?.images) return ''
  const count = post.value.images.length
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
})

const getContactLink = (method: string, value: string) => {
  switch (method) {
    case 'discord':
      return `https://discord.com/users/${value.replace('#', '')}`
    case 'twitter':
      return `https://twitter.com/${value.replace('@', '')}`
    case 'email':
      return `mailto:${value}`
    case 'vrchat':
      return `https://vrchat.com/home/user/${value}`
    default:
      return '#'
  }
}

// Methods
const loadPost = async () => {
  loading.value = true
  errorMessage.value = null
  
  try {
    const postId = route.params.id as string
    
    // 実際のAPIコール
    const result = await postsApi.getPost(postId)
    
    if (result.error) {
      errorMessage.value = result.error
      return
    }
    
    if (!result.data) {
      errorMessage.value = '指定された募集が見つかりませんでした。'
      return
    }
    
    post.value = result.data
    
  } catch (err) {
    errorMessage.value = 'データの読み込みに失敗しました。'
    console.error('Failed to load post:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const handleApply = () => {
  if (!authStore.isAuthenticated) {
    toast.error('ログインが必要です')
    router.push('/login')
    return
  }
  
  // 応募モーダルを表示
  showApplicationModal.value = true
}

const sharePost = async () => {
  if (!post.value) return
  
  const shareData = {
    title: post.value.title,
    text: post.value.description,
    url: window.location.href
  }
  
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('URLをクリップボードにコピーしました')
    }
  } catch (err) {
    console.error('Share failed:', err)
    toast.error('シェアに失敗しました')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatEventTime = (post: any) => {
  if (post.eventFrequency === 'once' && post.eventSpecificDate) {
    const date = new Date(post.eventSpecificDate)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (post.eventFrequency && post.eventWeekday !== undefined && post.eventTime) {
    const frequency = eventFrequencyLabels[post.eventFrequency]
    const weekday = weekdayLabels[post.eventWeekday]
    const time = post.eventTime
    
    if (post.eventFrequency === 'monthly' && post.eventWeekOfMonth) {
      const weekOfMonth = weekOfMonthLabels[post.eventWeekOfMonth]
      return `${frequency} ${weekOfMonth}${weekday} ${time}`
    } else if (post.eventFrequency === 'biweekly' && post.eventWeekOfMonth) {
      const pattern = post.eventWeekOfMonth === 1 ? '第1・第3' : '第2・第4'
      return `${pattern}${weekday} ${time}`
    } else {
      return `${frequency} ${weekday} ${time}`
    }
  }
  
  return eventFrequencyLabels[post.eventFrequency] || ''
}

// 画像ビューア関数
const openImageViewer = (imageUrl: string, index: number) => {
  if (post.value?.images) {
    selectedImages.value = post.value.images
    selectedImageIndex.value = index
    showImageViewer.value = true
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
  selectedImages.value = []
  selectedImageIndex.value = 0
}

// 応募処理
const handleApplicationSubmit = async (applicationData: any) => {
  try {
    const { applicationApi } = await import('@/lib/applicationApi')
    const result = await applicationApi.submitApplication(applicationData)
    
    if (result.error) {
      toast.error(result.error)
      return
    }
    
    toast.success('応募を送信しました')
    showApplicationModal.value = false
  } catch (err) {
    console.error('応募エラー:', err)
    toast.error('応募に失敗しました')
  }
}

// Lifecycle
onMounted(() => {
  loadPost()
})
</script>